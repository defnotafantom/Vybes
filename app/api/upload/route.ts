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
  kind: 'image' | 'any'
  maxBytes: number
  allowedMime?: string[]
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
    // Feed posts: medium, good quality, reasonable bandwidth
    case 'posts':
      return { kind: 'image', maxBytes: 6 * 1024 * 1024, allowedMime: ['image/jpeg', 'image/png', 'image/webp'], maxWidth: 1600, maxHeight: 1600, outputFormat: 'webp', quality: 82 }
    // Map / events marker cover: wide-ish header image
    case 'events':
      return { kind: 'image', maxBytes: 6 * 1024 * 1024, allowedMime: ['image/jpeg', 'image/png', 'image/webp'], maxWidth: 1920, maxHeight: 1080, outputFormat: 'webp', quality: 85 }
    // Portfolio: higher quality / bigger
    case 'portfolio':
      return { kind: 'image', maxBytes: 12 * 1024 * 1024, allowedMime: ['image/jpeg', 'image/png', 'image/webp'], maxWidth: 2400, maxHeight: 2400, outputFormat: 'webp', quality: 90 }
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

    // Validate/transform images depending on folder
    const isImage = file.type?.startsWith('image/')
    if (preset.kind === 'image') {
      if (!isImage) {
        return NextResponse.json({ error: 'Carica un’immagine (JPG/PNG/WebP).' }, { status: 400 })
      }
      if (preset.allowedMime && !preset.allowedMime.includes(file.type)) {
        return NextResponse.json({ error: 'Formato non supportato. Usa JPG, PNG o WebP.' }, { status: 400 })
      }

      // Decode+sanitize+resize+convert server-side (hard enforcement)
      try {
        const maxW = preset.maxWidth || 1920
        const maxH = preset.maxHeight || 1920
        const q = preset.quality ?? 85
        buffer = await sharp(buffer as unknown as Buffer, { failOn: 'none' })
          .rotate() // respect EXIF
          .resize({ width: maxW, height: maxH, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: q })
          .toBuffer()
      } catch (e) {
        console.error('Image processing failed:', e)
        return NextResponse.json({ error: 'Immagine non valida o corrotta.' }, { status: 400 })
      }
    } else {
      // Legacy mode: allow images+videos with safe allowlist
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm']
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: 'Tipo di file non supportato' }, { status: 400 })
      }
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const originalExtension = (file.name.split('.').pop() || '').toLowerCase()
    const extension = preset.kind === 'image' ? 'webp' : originalExtension
    const filename = `${timestamp}-${randomString}${extension ? `.${extension}` : ''}`
    const pathname = `${folder}/${filename}`.replace(/\/+/g, '/')

    // Prefer Vercel Blob in production (persistent storage)
    const hasBlobToken = !!process.env.BLOB_READ_WRITE_TOKEN
    const canUseBlob = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production'

    if (hasBlobToken) {
      const blob = await put(pathname, buffer, {
        access: 'public',
        contentType: preset.kind === 'image' ? 'image/webp' : file.type,
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

