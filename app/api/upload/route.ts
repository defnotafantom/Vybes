import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { put } from '@vercel/blob'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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

    if (!file) {
      return NextResponse.json(
        { error: 'Nessun file fornito' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo di file non supportato' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File troppo grande (max 10MB)' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = (file.name.split('.').pop() || '').toLowerCase()
    const filename = `${timestamp}-${randomString}${extension ? `.${extension}` : ''}`
    const pathname = `${folder}/${filename}`.replace(/\/+/g, '/')

    // Prefer Vercel Blob in production (persistent storage)
    const hasBlobToken = !!process.env.BLOB_READ_WRITE_TOKEN
    const canUseBlob = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production'

    if (hasBlobToken) {
      const blob = await put(pathname, buffer, {
        access: 'public',
        contentType: file.type,
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

