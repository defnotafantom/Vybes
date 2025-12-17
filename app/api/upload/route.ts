import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { put } from '@vercel/blob'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import sharp from 'sharp'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type UploadPreset = {
  kind: 'image' | 'media' | 'any'
  maxBytes: number
  allowedMime?: string[]
  // Media mode
  maxVideoBytes?: number
  allowedVideoMime?: string[]
  maxGifBytes?: number
  // For images only
  maxWidth?: number
  maxHeight?: number
  outputFormat?: 'webp'
  quality?: number
}

function getPreset(folder: string): UploadPreset {
  // Folder is already sanitized. Keep explicit list.
  switch (folder) {
    // Avatar/profile pictures: small, square-ish, fast to load
    case 'profile':
      return { kind: 'image', maxBytes: 2 * 1024 * 1024, allowedMime: ['image/jpeg', 'image/png', 'image/webp'], maxWidth: 512, maxHeight: 512, outputFormat: 'webp', quality: 82 }
    // Feed posts: allow images (incl gif) and short videos
    case 'posts':
      return {
        kind: 'media',
        maxBytes: 6 * 1024 * 1024,
        allowedMime: ['image/jpeg', 'image/png', 'image/webp'],
        maxGifBytes: 10 * 1024 * 1024,
        maxVideoBytes: 50 * 1024 * 1024,
        allowedVideoMime: ['video/mp4', 'video/webm'],
        maxWidth: 1600,
        maxHeight: 1600,
        outputFormat: 'webp',
        quality: 82,
      }
    // Map / events marker cover: allow images (incl gif). Video not supported in UI for events yet.
    case 'events':
      return {
        kind: 'media',
        maxBytes: 6 * 1024 * 1024,
        allowedMime: ['image/jpeg', 'image/png', 'image/webp'],
        maxGifBytes: 10 * 1024 * 1024,
        maxVideoBytes: 0,
        allowedVideoMime: [],
        maxWidth: 1920,
        maxHeight: 1080,
        outputFormat: 'webp',
        quality: 85,
      }
    // Portfolio: allow images (incl gif) and videos
    case 'portfolio':
      return {
        kind: 'media',
        maxBytes: 12 * 1024 * 1024,
        allowedMime: ['image/jpeg', 'image/png', 'image/webp'],
        maxGifBytes: 15 * 1024 * 1024,
        maxVideoBytes: 150 * 1024 * 1024,
        allowedVideoMime: ['video/mp4', 'video/webm'],
        maxWidth: 2400,
        maxHeight: 2400,
        outputFormat: 'webp',
        quality: 90,
      }
    default:
      // Keep legacy behaviour (images + videos) for unknown folders, but still limit size.
      return { kind: 'any', maxBytes: 10 * 1024 * 1024 }
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const folderRaw = (formData.get('folder') as string) || 'uploads'
    // Prevent path traversal / invalid folder names
    const folder = folderRaw.replace(/[^a-zA-Z0-9/_-]/g, '').replace(/^\/+/, '').replace(/\.\./g, '')
    const preset = getPreset(folder)

    if (!file) {
      return NextResponse.json(
        { error: 'Nessun file fornito' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > preset.maxBytes) {
      return NextResponse.json(
        { error: `File troppo grande (max ${Math.round(preset.maxBytes / (1024 * 1024))}MB)` },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    // Ensure we use Node's Buffer type (avoid ArrayBufferLike generic mismatch in Next build)
    let buffer: Buffer = Buffer.from(bytes) as unknown as Buffer
    const originalExtension = (file.name.split('.').pop() || '').toLowerCase()

    // Validate/transform media depending on folder
    const isImage = file.type?.startsWith('image/')
    const isVideo = file.type?.startsWith('video/')
    const isGif = file.type === 'image/gif'

    let outputContentType = file.type
    let outputExt = originalExtension

    if (preset.kind === 'image') {
      if (!isImage || isGif) return NextResponse.json({ error: 'Carica un’immagine JPG/PNG/WebP.' }, { status: 400 })
      if (preset.allowedMime && !preset.allowedMime.includes(file.type)) return NextResponse.json({ error: 'Formato non supportato. Usa JPG, PNG o WebP.' }, { status: 400 })
      try {
        const maxW = preset.maxWidth || 1920
        const maxH = preset.maxHeight || 1920
        const q = preset.quality ?? 85
        buffer = await sharp(buffer as unknown as Buffer, { failOn: 'none' })
          .rotate()
          .resize({ width: maxW, height: maxH, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: q })
          .toBuffer()
        outputContentType = 'image/webp'
        outputExt = 'webp'
      } catch (e) {
        console.error('Image processing failed:', e)
        return NextResponse.json({ error: 'Immagine non valida o corrotta.' }, { status: 400 })
      }
    } else if (preset.kind === 'media') {
      if (isVideo) {
        const maxV = preset.maxVideoBytes ?? 0
        const allowedV = preset.allowedVideoMime ?? []
        if (!allowedV.includes(file.type) || maxV <= 0) {
          return NextResponse.json({ error: 'Video non supportato per questa sezione.' }, { status: 400 })
        }
        if (file.size > maxV) {
          return NextResponse.json({ error: `Video troppo grande (max ${Math.round(maxV / (1024 * 1024))}MB)` }, { status: 400 })
        }
        outputContentType = file.type
        outputExt = originalExtension || (file.type === 'video/webm' ? 'webm' : 'mp4')
      } else if (isGif) {
        const maxG = preset.maxGifBytes ?? preset.maxBytes
        if (file.size > maxG) {
          return NextResponse.json({ error: `GIF troppo grande (max ${Math.round(maxG / (1024 * 1024))}MB)` }, { status: 400 })
        }
        outputContentType = 'image/gif'
        outputExt = 'gif'
      } else if (isImage) {
        if (preset.allowedMime && !preset.allowedMime.includes(file.type)) {
          return NextResponse.json({ error: 'Formato immagine non supportato. Usa JPG, PNG, WebP o GIF.' }, { status: 400 })
        }
        try {
          const maxW = preset.maxWidth || 1920
          const maxH = preset.maxHeight || 1920
          const q = preset.quality ?? 85
          buffer = await sharp(buffer as unknown as Buffer, { failOn: 'none' })
            .rotate()
            .resize({ width: maxW, height: maxH, fit: 'inside', withoutEnlargement: true })
            .webp({ quality: q })
            .toBuffer()
          outputContentType = 'image/webp'
          outputExt = 'webp'
        } catch (e) {
          console.error('Image processing failed:', e)
          return NextResponse.json({ error: 'Immagine non valida o corrotta.' }, { status: 400 })
        }
      } else {
        return NextResponse.json({ error: 'Tipo di file non supportato.' }, { status: 400 })
      }
    } else {
      // Legacy mode: allow images+videos with safe allowlist
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm']
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: 'Tipo di file non supportato' }, { status: 400 })
      }
      outputContentType = file.type
      outputExt = originalExtension
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const filename = `${timestamp}-${randomString}${outputExt ? `.${outputExt}` : ''}`
    const pathname = `${folder}/${filename}`.replace(/\/+/g, '/')

    // Prefer Vercel Blob in production (persistent storage)
    const hasBlobToken = !!process.env.BLOB_READ_WRITE_TOKEN
    const canUseBlob = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production'

    if (hasBlobToken) {
      const blob = await put(pathname, buffer, {
        access: 'public',
        contentType: outputContentType,
        addRandomSuffix: false,
      })
      return NextResponse.json({ url: blob.url, filename, pathname, storage: 'blob' })
    }

    // Fallback: local filesystem (OK for local dev, NOT persistent on Vercel)
    if (canUseBlob) {
      return NextResponse.json(
        {
          error: 'Upload storage non configurato. Abilita Vercel Blob (BLOB_READ_WRITE_TOKEN).',
        },
        { status: 500 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', folder)
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true })
    }

    // Write file
    const filepath = join(uploadDir, filename)
    await writeFile(filepath, buffer)

    // Return public URL
    const url = `/${folder}/${filename}`

    return NextResponse.json({ url, filename, pathname, storage: 'local' })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Errore nel caricamento del file' },
      { status: 500 }
    )
  }
}

