"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Upload, Image as ImageIcon, Video, X } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'

export default function CreatePortfolioPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'IMAGE' | 'VIDEO' | 'AUDIO' | 'OTHER'>('IMAGE')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onloadend = () => {
        setFilePreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !file) return

    setLoading(true)
    try {
      // Upload file
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('folder', 'portfolio')

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      if (!uploadResponse.ok) {
        throw new Error('Errore nel caricamento del file')
      }

      const uploadData = await uploadResponse.json()
      const fileUrl = uploadData.url

      // Create portfolio item
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          type,
          tags,
          imageUrl: type === 'IMAGE' ? fileUrl : null,
          videoUrl: type === 'VIDEO' ? fileUrl : null,
        }),
      })

      if (response.ok) {
        router.push('/dashboard/portfolio')
      } else {
        throw new Error('Errore nella creazione del portfolio item')
      }
    } catch (error) {
      console.error('Error creating portfolio item:', error)
      alert('Errore nella creazione del portfolio item. Riprova.')
    } finally {
      setLoading(false)
    }
  }

  if (session?.user?.role !== 'ARTIST') {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 dark:text-slate-400 mb-4">
          Solo gli artisti possono aggiungere al portfolio
        </p>
        <Button onClick={() => router.back()}>Torna indietro</Button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="hover:bg-sky-50 dark:hover:bg-sky-900/20"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Indietro
        </Button>
      </div>

      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-sky-100 dark:border-sky-900 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Aggiungi al Portfolio</CardTitle>
          <CardDescription>
            Condividi le tue opere d&apos;arte con la community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Titolo *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titolo dell'opera"
                required
                className="bg-white dark:bg-gray-900"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrizione</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrivi la tua opera..."
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-sky-200 dark:border-sky-800 bg-white dark:bg-gray-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(['IMAGE', 'VIDEO', 'AUDIO', 'OTHER'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      type === t
                        ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20'
                        : 'border-sky-200 dark:border-sky-800 hover:border-sky-300 dark:hover:border-sky-700'
                    }`}
                  >
                    {t === 'IMAGE' && <ImageIcon className="h-5 w-5 mx-auto mb-1" />}
                    {t === 'VIDEO' && <Video className="h-5 w-5 mx-auto mb-1" />}
                    {t === 'AUDIO' && <Video className="h-5 w-5 mx-auto mb-1" />}
                    {t === 'OTHER' && <Upload className="h-5 w-5 mx-auto mb-1" />}
                    <div className="text-xs font-semibold">{t}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label>File *</Label>
              <div className="border-2 border-dashed border-sky-300 dark:border-sky-700 rounded-lg p-6 text-center">
                {filePreview ? (
                  <div className="relative">
                    {type === 'IMAGE' ? (
                      <Image
                        src={filePreview}
                        alt="Preview"
                        width={400}
                        height={300}
                        className="mx-auto rounded-lg max-h-64 object-contain"
                      />
                    ) : (
                      <video
                        src={filePreview}
                        controls
                        className="mx-auto rounded-lg max-h-64"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null)
                        setFilePreview(null)
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="h-12 w-12 mx-auto mb-2 text-sky-400" />
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Clicca per caricare o trascina qui
                    </div>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept={
                        type === 'IMAGE'
                          ? 'image/*'
                          : type === 'VIDEO'
                          ? 'video/*'
                          : type === 'AUDIO'
                          ? 'audio/*'
                          : '*/*'
                      }
                      className="hidden"
                      required
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tag</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                  placeholder="Aggiungi tag (premi Invio)"
                  className="bg-white dark:bg-gray-900"
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  Aggiungi
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 rounded-full text-sm flex items-center gap-2"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                Annulla
              </Button>
              <Button
                type="submit"
                disabled={loading || !title.trim() || !file}
                className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700"
              >
                {loading ? 'Caricamento...' : 'Pubblica'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

