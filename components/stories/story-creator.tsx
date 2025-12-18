"use client"

import { useState, useRef } from "react"
import { X, Image as ImageIcon, Video, Send, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface StoryCreatorProps {
  onClose: () => void
  onCreated: () => void
}

export function StoryCreator({ onClose, onCreated }: StoryCreatorProps) {
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [caption, setCaption] = useState("")
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validate file type
    const isImage = selectedFile.type.startsWith("image/")
    const isVideo = selectedFile.type.startsWith("video/")
    
    if (!isImage && !isVideo) {
      toast({ title: "Errore", description: "Seleziona un'immagine o un video", variant: "destructive" })
      return
    }

    // Validate size (max 50MB for video, 10MB for image)
    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024
    if (selectedFile.size > maxSize) {
      toast({ 
        title: "File troppo grande", 
        description: `Massimo ${isVideo ? "50MB" : "10MB"}`, 
        variant: "destructive" 
      })
      return
    }

    setFile(selectedFile)
    setPreview(URL.createObjectURL(selectedFile))
  }

  const handleSubmit = async () => {
    if (!file) return

    setLoading(true)
    try {
      // Upload file
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "stories")

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadRes.ok) throw new Error("Upload fallito")

      const { url } = await uploadRes.json()

      // Create story
      const storyRes = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaUrl: url,
          mediaType: file.type.startsWith("video/") ? "video" : "image",
          caption: caption.trim() || null,
        }),
      })

      if (storyRes.ok) {
        toast({ title: "Storia pubblicata!" })
        onCreated()
      } else {
        throw new Error("Errore creazione storia")
      }
    } catch (error) {
      toast({ title: "Errore", description: "Impossibile pubblicare la storia", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md bg-gray-900 rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-lg font-bold text-white">Crea storia</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-800">
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {!preview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="aspect-[9/16] max-h-[60vh] rounded-xl border-2 border-dashed border-gray-700 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-sky-500 transition-colors"
            >
              <div className="flex gap-4">
                <div className="p-4 rounded-full bg-gray-800">
                  <ImageIcon className="h-8 w-8 text-sky-400" />
                </div>
                <div className="p-4 rounded-full bg-gray-800">
                  <Video className="h-8 w-8 text-pink-400" />
                </div>
              </div>
              <p className="text-gray-400 text-center">
                Clicca per selezionare<br />
                <span className="text-sm">Immagine o Video</span>
              </p>
            </div>
          ) : (
            <div className="relative aspect-[9/16] max-h-[60vh] rounded-xl overflow-hidden bg-black">
              {file?.type.startsWith("video/") ? (
                <video
                  src={preview}
                  className="w-full h-full object-contain"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              )}
              <button
                onClick={() => {
                  setFile(null)
                  setPreview(null)
                }}
                className="absolute top-2 right-2 p-2 rounded-full bg-black/50 hover:bg-black/70"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Caption input */}
          {preview && (
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Aggiungi una didascalia..."
              maxLength={150}
              className="w-full mt-4 px-4 py-3 bg-gray-800 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <Button
            onClick={handleSubmit}
            disabled={!file || loading}
            className="w-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:opacity-90"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Pubblica storia
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

