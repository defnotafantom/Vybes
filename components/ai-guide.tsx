"use client"

import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/components/providers/language-provider'

type GuideStep = {
  id: string
  selector: string
  it: { title: string; body: string }
  en: { title: string; body: string }
  placement?: 'top' | 'bottom' | 'left' | 'right'
}

function getRect(el: Element) {
  const r = (el as HTMLElement).getBoundingClientRect()
  return {
    x: r.left,
    y: r.top,
    w: r.width,
    h: r.height,
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export function AIGuide() {
  const { language } = useLanguage()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [idx, setIdx] = useState(0)
  const [targetRect, setTargetRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null)

  const steps: GuideStep[] = useMemo(() => {
    const common: GuideStep[] = [
      {
        id: 'header-profile',
        selector: '[data-guide=\"header-profile\"]',
        placement: 'bottom',
        it: { title: 'Menu profilo', body: 'Da qui accedi a profilo e impostazioni.' },
        en: { title: 'Profile menu', body: 'Access your profile and settings from here.' },
      },
      {
        id: 'header-language',
        selector: '[data-guide=\"header-language\"]',
        placement: 'bottom',
        it: { title: 'Lingua', body: 'Cambia lingua IT/EN.' },
        en: { title: 'Language', body: 'Switch between IT/EN.' },
      },
      {
        id: 'header-theme',
        selector: '[data-guide=\"header-theme\"]',
        placement: 'bottom',
        it: { title: 'Tema', body: 'Passa tra chiaro/scuro.' },
        en: { title: 'Theme', body: 'Toggle light/dark mode.' },
      },
      {
        id: 'sidebar',
        selector: '[data-guide=\"sidebar\"]',
        placement: 'right',
        it: { title: 'Navigazione', body: 'Questa è la barra laterale: cambia sezione rapidamente.' },
        en: { title: 'Navigation', body: 'This is the sidebar: quickly switch sections.' },
      },
    ]

    if (pathname?.includes('/dashboard/map')) {
      return [
        ...common,
        {
          id: 'map-search',
          selector: '[data-guide=\"map-search\"]',
          placement: 'bottom',
          it: { title: 'Ricerca', body: 'Cerca per titolo/descrizione/città. I risultati si aggiornano subito.' },
          en: { title: 'Search', body: 'Search by title/description/city. Results update instantly.' },
        },
        {
          id: 'map-filters',
          selector: '[data-guide=\"map-filters\"]',
          placement: 'bottom',
          it: { title: 'Filtri', body: 'Filtra per tipo e art tags. Su mobile trovi tutto nel pannello Filtri.' },
          en: { title: 'Filters', body: 'Filter by type and art tags. On mobile, open the Filters sheet.' },
        },
        {
          id: 'map-new',
          selector: '[data-guide=\"map-new\"]',
          placement: 'bottom',
          it: { title: 'Nuovo marker', body: 'Crea un marker sulla mappa (se hai i permessi).' },
          en: { title: 'New marker', body: 'Create a marker on the map (if you have permissions).' },
        },
        {
          id: 'map-details',
          selector: '[data-guide=\"map-details\"]',
          placement: 'left',
          it: { title: 'Dettaglio marker', body: 'Qui vedi foto zona (Mapillary) + descrizione + azioni.' },
          en: { title: 'Marker details', body: 'See nearby photos (Mapillary), description, and actions.' },
        },
      ]
    }

    if (pathname?.includes('/dashboard/messages')) {
      return [
        ...common,
        {
          id: 'messages-list',
          selector: '[data-guide=\"messages-list\"]',
          placement: 'right',
          it: { title: 'Conversazioni', body: 'Seleziona una chat per vedere i messaggi.' },
          en: { title: 'Conversations', body: 'Select a chat to view messages.' },
        },
        {
          id: 'messages-compose',
          selector: '[data-guide=\"messages-compose\"]',
          placement: 'top',
          it: { title: 'Scrivi', body: 'Invia messaggi e resta in contatto con autori e partecipanti.' },
          en: { title: 'Compose', body: 'Send messages and stay in touch with creators and participants.' },
        },
      ]
    }

    return common
  }, [pathname])

  const current = steps[idx]

  // Recompute target rect on open/step/resize/scroll
  useEffect(() => {
    if (!open) return

    const update = () => {
      const el = document.querySelector(current?.selector || '')
      if (!el) {
        setTargetRect(null)
        return
      }
      setTargetRect(getRect(el))
      ;(el as HTMLElement).scrollIntoView({ block: 'center', behavior: 'smooth' })
    }

    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [open, current?.selector])

  const text = language === 'it' ? current?.it : current?.en

  const next = () => setIdx((v) => clamp(v + 1, 0, steps.length - 1))
  const prev = () => setIdx((v) => clamp(v - 1, 0, steps.length - 1))

  const close = () => {
    setOpen(false)
    setIdx(0)
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="border-sky-200 dark:border-sky-800 bg-white/70 dark:bg-gray-900/30"
        data-guide="ai-guide-trigger"
      >
        {language === 'it' ? 'Guida' : 'Guide'}
      </Button>

      <AnimatePresence>
        {open && current && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0" onClick={close} />

            {/* Spotlight */}
            {targetRect && (
              <motion.div
                className="absolute rounded-2xl border-2 border-sky-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]"
                style={{
                  left: Math.max(8, targetRect.x - 6),
                  top: Math.max(8, targetRect.y - 6),
                  width: Math.max(24, targetRect.w + 12),
                  height: Math.max(24, targetRect.h + 12),
                }}
                initial={{ scale: 0.98 }}
                animate={{ scale: 1 }}
              />
            )}

            {/* Tooltip */}
            <motion.div
              className="absolute left-1/2 -translate-x-1/2 bottom-6 w-[min(520px,calc(100vw-24px))] rounded-3xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-sky-200 dark:border-sky-800 shadow-2xl p-4"
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-black text-slate-900 dark:text-slate-100">
                    {text?.title}
                  </div>
                  <div className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                    {text?.body}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={close}
                  className="shrink-0 px-3 py-2 rounded-xl border border-sky-200 dark:border-sky-800 bg-white/60 dark:bg-gray-900/30 text-slate-700 dark:text-slate-200"
                >
                  {language === 'it' ? 'Chiudi' : 'Close'}
                </button>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {language === 'it' ? 'Step' : 'Step'} {idx + 1}/{steps.length}
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={prev} disabled={idx === 0}>
                    {language === 'it' ? 'Indietro' : 'Back'}
                  </Button>
                  <Button type="button" onClick={idx === steps.length - 1 ? close : next}>
                    {idx === steps.length - 1 ? (language === 'it' ? 'Fine' : 'Done') : (language === 'it' ? 'Avanti' : 'Next')}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

