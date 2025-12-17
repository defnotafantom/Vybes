"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ShoppingBag, Coins, Check, Lock, Image as ImageIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'
import { useLanguage } from '@/components/providers/language-provider'

interface AvatarItem {
  id: string
  name: string
  description: string | null
  category: string
  previewUrl: string | null
  priceCoins: number
  rarity: string
  owned: boolean
}

interface AvatarConfig {
  face?: string | null
  eyes?: string | null
  hair?: string | null
  top?: string | null
  bottom?: string | null
  accessories?: string | null
}

const CATEGORIES = [
  { id: 'face', labelKey: 'avatar.category.face', icon: '😊' },
  { id: 'eyes', labelKey: 'avatar.category.eyes', icon: '👁️' },
  { id: 'hair', labelKey: 'avatar.category.hair', icon: '💇' },
  { id: 'top', labelKey: 'avatar.category.top', icon: '👕' },
  { id: 'bottom', labelKey: 'avatar.category.bottom', icon: '👖' },
  { id: 'accessories', labelKey: 'avatar.category.accessories', icon: '👓' },
]

export default function FittingRoomPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [avatar, setAvatar] = useState<AvatarConfig | null>(null)
  const [items, setItems] = useState<AvatarItem[]>([])
  const [ownedItems, setOwnedItems] = useState<string[]>([])
  const [coins, setCoins] = useState(0)
  const [useAvatar, setUseAvatar] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('face')

  useEffect(() => {
    fetchAvatar()
    fetchItems()
  }, [])

  const fetchAvatar = async () => {
    try {
      const response = await fetch('/api/avatar')
      if (response.ok) {
        const data = await response.json()
        setAvatar(data.avatar || {})
        setCoins(data.avatar?.user?.coins || 0)
        setUseAvatar(data.avatar?.user?.useAvatar || false)
      }
    } catch (error) {
      console.error('Error fetching avatar:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/avatar/items')
      if (response.ok) {
        const data = await response.json()
        setItems(data.items || [])
        setOwnedItems(data.items.filter((item: AvatarItem) => item.owned).map((item: AvatarItem) => item.id))
      }
    } catch (error) {
      console.error('Error fetching items:', error)
    }
  }

  const handleItemSelect = (itemId: string) => {
    if (!avatar) return
    
    const item = items.find(i => i.id === itemId)
    if (!item) return

    // Only allow selection of owned items
    if (!item.owned) {
      toast({
        title: t('toast.itemNotOwned'),
        description: t('avatar.itemNotOwned'),
        variant: 'destructive',
      })
      return
    }

    const categoryKey = item.category as keyof AvatarConfig
    setAvatar({
      ...avatar,
      [categoryKey]: itemId,
    })
  }

  const handlePurchase = async (itemId: string) => {
    setPurchasing(itemId)
    try {
      const response = await fetch('/api/avatar/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: t('toast.purchaseSuccess'),
          description: `${data.ownership.item.name} acquistato con successo!`,
        })
        setCoins(data.coins)
        await fetchItems() // Refresh items to update ownership
      } else {
        toast({
          title: t('toast.purchaseError'),
          description: data.error || t('toast.purchaseError'),
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error purchasing item:', error)
      toast({
        title: t('toast.genericError'),
        description: t('toast.purchaseError'),
        variant: 'destructive',
      })
    } finally {
      setPurchasing(null)
    }
  }

  const handleSave = async () => {
    if (!avatar) return

    setSaving(true)
    try {
      const response = await fetch('/api/avatar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...avatar,
          useAvatar,
        }),
      })

      if (response.ok) {
        toast({
          title: t('toast.avatarSaved'),
          description: t('toast.avatarConfigSaved'),
        })
      } else {
        toast({
          title: t('toast.avatarError'),
          description: t('toast.avatarSaveError'),
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error saving avatar:', error)
      toast({
        title: t('toast.avatarError'),
        description: t('toast.avatarSaveError'),
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const getItemsByCategory = (category: string) => {
    return items.filter(item => item.category === category)
  }

  const getSelectedItem = (category: string) => {
    if (!avatar) return null
    const categoryKey = category as keyof AvatarConfig
    const itemId = avatar[categoryKey]
    if (!itemId) return null
    return items.find(item => item.id === itemId) || null
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'border-gray-300 dark:border-gray-600'
      case 'rare':
        return 'border-blue-400 dark:border-blue-600'
      case 'epic':
        return 'border-purple-400 dark:border-purple-600'
      case 'legendary':
        return 'border-yellow-400 dark:border-yellow-600'
      default:
        return 'border-gray-300 dark:border-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-600 dark:text-slate-400">{t('minichat.loading')}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
              {t('profile.avatar.open')}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              {t('profile.avatar.description')}
            </p>
          </div>
          
          {/* Coins Display */}
          <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-300 dark:border-amber-700">
            <CardContent className="p-4 flex items-center gap-2">
              <Coins className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <span className="font-bold text-amber-700 dark:text-amber-300">{coins}</span>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar Preview */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>{t('avatar.previewTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Avatar Display - Placeholder for 3D renderer */}
              <div className="aspect-square bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-900/30 dark:to-blue-900/30 rounded-xl flex items-center justify-center border-2 border-sky-200 dark:border-sky-800">
                <div className="text-center">
                  <ImageIcon className="h-16 w-16 text-sky-400 dark:text-sky-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {t('avatar.preview3d')}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    {t('avatar.preview3dNote')}
                  </p>
                </div>
              </div>

              {/* Toggle Use Avatar */}
              <div className="flex items-center justify-between p-3 bg-sky-50 dark:bg-sky-900/20 rounded-lg border border-sky-200 dark:border-sky-800">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t('avatar.useAvatarInstead')}
                </span>
                <Button
                  variant={useAvatar ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUseAvatar(!useAvatar)}
                  className={useAvatar ? "bg-sky-500 hover:bg-sky-600" : ""}
                >
                  {useAvatar ? t('common.active') : t('common.inactive')}
                </Button>
              </div>

              {/* Save Button */}
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700"
              >
                {saving ? t('avatar.saving') : t('avatar.saveConfig')}
              </Button>
            </CardContent>
          </Card>

          {/* Items Selection */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{t('avatar.customizeTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <TabsList className="grid w-full grid-cols-6">
                  {CATEGORIES.map((cat) => (
                    <TabsTrigger key={cat.id} value={cat.id} className="flex flex-col gap-1">
                      <span className="text-xl">{cat.icon}</span>
                      <span className="text-xs">{t(cat.labelKey)}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {CATEGORIES.map((category) => {
                  const categoryItems = getItemsByCategory(category.id)
                  const selectedItem = getSelectedItem(category.id)

                  return (
                    <TabsContent key={category.id} value={category.id} className="mt-4">
                      <div className="space-y-4">
                        {/* Selected Item Display */}
                        {selectedItem && (
                          <div className="p-4 bg-sky-50 dark:bg-sky-900/20 rounded-lg border-2 border-sky-300 dark:border-sky-700">
                            <div className="flex items-center gap-3">
                              <Check className="h-5 w-5 text-green-500" />
                              <div>
                                <p className="font-semibold text-slate-800 dark:text-slate-200">
                                  {selectedItem.name}
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  {t('avatar.currentlySelected')}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Items Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {categoryItems.map((item) => {
                            const isSelected = avatar?.[category.id as keyof AvatarConfig] === item.id
                            const isOwned = item.owned

                            return (
                              <motion.div
                                key={item.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Card
                                  className={`cursor-pointer transition-all ${
                                    isSelected
                                      ? 'ring-2 ring-sky-500 border-sky-500'
                                      : isOwned
                                      ? `hover:border-sky-300 dark:hover:border-sky-700 ${getRarityColor(item.rarity)}`
                                      : 'opacity-60 border-gray-300 dark:border-gray-700'
                                  }`}
                                  onClick={() => handleItemSelect(item.id)}
                                >
                                  <CardContent className="p-4">
                                    {/* Item Preview */}
                                    <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-lg mb-3 flex items-center justify-center relative">
                                                {item.previewUrl ? (
                                                  <Image
                                                    src={item.previewUrl}
                                                    alt={item.name}
                                                    width={100}
                                                    height={100}
                                                    className="w-full h-full object-cover rounded-lg"
                                                  />
                                                ) : (
                                                  <ShoppingBag className="h-8 w-8 text-slate-400" />
                                                )}
                                      {!isOwned && (
                                        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                                          <Lock className="h-6 w-6 text-white" />
                                        </div>
                                      )}
                                      {isSelected && (
                                        <div className="absolute top-2 right-2 bg-sky-500 rounded-full p-1">
                                          <Check className="h-4 w-4 text-white" />
                                        </div>
                                      )}
                                    </div>

                                    {/* Item Info */}
                                    <div className="space-y-2">
                                      <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate">
                                        {item.name}
                                      </h3>
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                          <Coins className="h-4 w-4 text-amber-500" />
                                          <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                                            {item.priceCoins}
                                          </span>
                                        </div>
                                        {!isOwned && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-7 text-xs"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              handlePurchase(item.id)
                                            }}
                                            disabled={purchasing === item.id || coins < item.priceCoins}
                                          >
                                            {purchasing === item.id ? (
                                              '...'
                                            ) : (
                                              'Acquista'
                                            )}
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            )
                          })}
                        </div>

                        {categoryItems.length === 0 && (
                          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                            Nessun item disponibile per questa categoria
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  )
                })}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}

