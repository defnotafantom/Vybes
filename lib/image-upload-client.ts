export type ImageUploadPreset = 'profile' | 'portfolio' | 'posts' | 'events'

type PresetConfig = {
  maxBytes: number
  maxWidth: number
  maxHeight: number
  quality: number // 0..1 for canvas
  allowedMime: string[]
  outputMime: 'image/webp'
  // media
  maxGifBytes?: number
  maxVideoBytes?: number
  allowedVideoMime?: string[]
}

const PRESETS: Record<ImageUploadPreset, PresetConfig> = {
  profile: {
    maxBytes: 2 * 1024 * 1024,
    maxWidth: 512,
    maxHeight: 512,
    quality: 0.82,
    allowedMime: ['image/jpeg', 'image/png', 'image/webp'],
    outputMime: 'image/webp',
  },
  posts: {
    maxBytes: 6 * 1024 * 1024,
    maxWidth: 1600,
    maxHeight: 1600,
    quality: 0.82,
    allowedMime: ['image/jpeg', 'image/png', 'image/webp'],
    outputMime: 'image/webp',
    maxGifBytes: 10 * 1024 * 1024,
    maxVideoBytes: 50 * 1024 * 1024,
    allowedVideoMime: ['video/mp4', 'video/webm'],
  },
  events: {
    maxBytes: 6 * 1024 * 1024,
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.85,
    allowedMime: ['image/jpeg', 'image/png', 'image/webp'],
    outputMime: 'image/webp',
    maxGifBytes: 10 * 1024 * 1024,
  },
  portfolio: {
    maxBytes: 12 * 1024 * 1024,
    maxWidth: 2400,
    maxHeight: 2400,
    quality: 0.9,
    allowedMime: ['image/jpeg', 'image/png', 'image/webp'],
    outputMime: 'image/webp',
    maxGifBytes: 15 * 1024 * 1024,
    maxVideoBytes: 150 * 1024 * 1024,
    allowedVideoMime: ['video/mp4', 'video/webm'],
  },
}

function extToFilename(name: string, newExt: string) {
  const base = name.replace(/\.[^.]+$/, '')
  return `${base}.${newExt}`
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (!b) reject(new Error('Impossibile convertire l\'immagine'))
        else resolve(b)
      },
      type,
      quality
    )
  })
}

export function formatBytes(bytes: number) {
  const mb = bytes / (1024 * 1024)
  return `${Math.round(mb * 10) / 10}MB`
}

export async function prepareImageForUpload(file: File, preset: ImageUploadPreset): Promise<File> {
  const cfg = PRESETS[preset]

  if (!file.type?.startsWith('image/')) {
    throw new Error('Seleziona un\'immagine (JPG/PNG/WebP).')
  }
  if (file.type === 'image/gif') {
    throw new Error('GIF non supportata in questa funzione. Usa prepareMediaForUpload().')
  }
  if (!cfg.allowedMime.includes(file.type)) {
    throw new Error('Formato non supportato. Usa JPG, PNG o WebP.')
  }
  if (file.size > cfg.maxBytes) {
    throw new Error(`Immagine troppo grande (max ${formatBytes(cfg.maxBytes)}).`)
  }

  // If already webp and small enough, still allow resize if dimensions are huge.
  // Do a best-effort resize+convert (some browsers may not support certain decoders).
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    // Fallback: keep original (server will enforce)
    return file
  }

  const scale = Math.min(1, cfg.maxWidth / bitmap.width, cfg.maxHeight / bitmap.height)
  const outW = Math.max(1, Math.round(bitmap.width * scale))
  const outH = Math.max(1, Math.round(bitmap.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = outW
  canvas.height = outH
  const ctx = canvas.getContext('2d')
  if (!ctx) return file

  ctx.drawImage(bitmap, 0, 0, outW, outH)
  bitmap.close?.()

  const blob = await toBlob(canvas, cfg.outputMime, cfg.quality)
  const outName = extToFilename(file.name || 'image', 'webp')
  return new File([blob], outName, { type: cfg.outputMime })
}

export async function prepareMediaForUpload(file: File, preset: ImageUploadPreset): Promise<File> {
  const cfg = PRESETS[preset]

  if (file.type?.startsWith('video/')) {
    const allowed = cfg.allowedVideoMime || []
    const maxV = cfg.maxVideoBytes || 0
    if (!allowed.includes(file.type) || maxV <= 0) throw new Error('Video non supportato qui.')
    if (file.size > maxV) throw new Error(`Video troppo grande (max ${formatBytes(maxV)}).`)
    return file
  }

  if (file.type === 'image/gif') {
    const maxG = cfg.maxGifBytes || cfg.maxBytes
    if (file.size > maxG) throw new Error(`GIF troppo grande (max ${formatBytes(maxG)}).`)
    return file
  }

  // normal image -> optimize
  return await prepareImageForUpload(file, preset)
}









