"use client"

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, Search, X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/components/providers/language-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Lang = 'it' | 'en'

type GuideItem = {
  id: string
  selector: string
  href?: string
  where?: Record<Lang, string>
  title: Record<Lang, string>
  body: Record<Lang, string>
  keywords: string[]
  section: 'header' | 'sidebar' | 'map' | 'messages' | 'general'
}

function getLang(code: string): Lang {
  return code?.toLowerCase().startsWith('it') ? 'it' : 'en'
}

export function AIGuideButton() {
  const { language } = useLanguage()
  const lang = getLang(language)
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [step, setStep] = useState(0)
  const [tour, setTour] = useState(false)

  const items: GuideItem[] = useMemo(
    () => [
      {
        id: 'header-notifications',
        selector: '[data-guide=\"header-notifications\"]',
        section: 'header',
        href: '/dashboard',
        where: { it: 'Dashboard → Header', en: 'Dashboard → Header' },
        title: { it: 'Notifiche', en: 'Notifications' },
        body: {
          it: 'Qui trovi notifiche su messaggi, follow, commenti e aggiornamenti. Aprilo per vedere cosa è successo di recente.',
          en: 'Here you’ll see notifications about messages, follows, comments, and updates. Open it to review recent activity.',
        },
        keywords: ['notifiche', 'notifications', 'bell', 'avvisi'],
      },
      {
        id: 'header-theme',
        selector: '[data-guide=\"header-theme\"]',
        section: 'header',
        href: '/dashboard',
        where: { it: 'Dashboard → Header', en: 'Dashboard → Header' },
        title: { it: 'Tema chiaro/scuro', en: 'Theme (light/dark)' },
        body: {
          it: 'Cambia il tema dell’app. Utile di sera o se preferisci più contrasto.',
          en: 'Switch the app theme. Useful at night or if you prefer higher contrast.',
        },
        keywords: ['tema', 'theme', 'dark', 'light'],
      },
      {
        id: 'header-language',
        selector: '[data-guide=\"header-language\"]',
        section: 'header',
        href: '/dashboard',
        where: { it: 'Dashboard → Header', en: 'Dashboard → Header' },
        title: { it: 'Lingua', en: 'Language' },
        body: {
          it: 'Cambia la lingua tra italiano e inglese.',
          en: 'Switch the language between Italian and English.',
        },
        keywords: ['lingua', 'language', 'it', 'en'],
      },
      {
        id: 'sidebar-map',
        selector: '[data-guide=\"nav-map\"]',
        section: 'sidebar',
        href: '/dashboard/map',
        where: { it: 'Dashboard → Sidebar', en: 'Dashboard → Sidebar' },
        title: { it: 'Mappa', en: 'Map' },
        body: {
          it: 'Esplora marker e opportunità. Usa ricerca e filtri per trovare ciò che ti interessa.',
          en: 'Explore markers and opportunities. Use search and filters to find what you need.',
        },
        keywords: ['mappa', 'map', 'marker', 'filtri', 'filters'],
      },
      {
        id: 'map-search',
        selector: '[data-guide=\"map-search\"]',
        section: 'map',
        href: '/dashboard/map',
        where: { it: 'Dashboard → Mappa', en: 'Dashboard → Map' },
        title: { it: 'Ricerca sulla mappa', en: 'Map search' },
        body: {
          it: 'Cerca per titolo, città o testo nella descrizione. I risultati si aggiornano in tempo reale.',
          en: 'Search by title, city, or text in the description. Results update live.',
        },
        keywords: ['ricerca', 'search', 'cerca', 'query'],
      },
      {
        id: 'map-filters',
        selector: '[data-guide=\"map-filters\"]',
        section: 'map',
        href: '/dashboard/map',
        where: { it: 'Dashboard → Mappa', en: 'Dashboard → Map' },
        title: { it: 'Filtri', en: 'Filters' },
        body: {
          it: 'Filtra per tipo (opportunità, collaborazione, eventi) e per art-tag. Su mobile si apre un pannello dedicato.',
          en: 'Filter by type (opportunities, collaborations, events) and art tags. On mobile it opens a dedicated panel.',
        },
        keywords: ['filtri', 'filters', 'tags', 'art', 'categorie'],
      },
      {
        id: 'map-new-marker',
        selector: '[data-guide=\"map-new-marker\"]',
        section: 'map',
        href: '/dashboard/map',
        where: { it: 'Dashboard → Mappa', en: 'Dashboard → Map' },
        title: { it: 'Nuovo marker', en: 'New marker' },
        body: {
          it: 'Crea un marker sulla mappa. Puoi anche cliccare direttamente sulla mappa per precompilare la posizione.',
          en: 'Create a new marker on the map. You can also click the map to prefill the position.',
        },
        keywords: ['nuovo', 'new', 'marker', 'crea', 'create'],
      },
      {
        id: 'map-contact',
        selector: '[data-guide=\"map-contact\"]',
        section: 'map',
        href: '/dashboard/map',
        where: { it: 'Dashboard → Mappa', en: 'Dashboard → Map' },
        title: { it: 'Contatta autore', en: 'Contact author' },
        body: {
          it: 'Apre una chat con l’autore e invia un messaggio automatico con riferimento al marker. Poi ti porta in Messaggi.',
          en: 'Opens a chat with the author and sends an automatic reference message. Then it takes you to Messages.',
        },
        keywords: ['contatta', 'contact', 'chat', 'messaggio', 'message'],
      },
      {
        id: 'messages',
        selector: '[data-guide=\"nav-messages\"]',
        section: 'messages',
        href: '/dashboard/messages',
        where: { it: 'Dashboard → Sidebar', en: 'Dashboard → Sidebar' },
        title: { it: 'Messaggi', en: 'Messages' },
        body: {
          it: 'Gestisci le conversazioni. Da qui puoi continuare le chat avviate dalla mappa o dal profilo.',
          en: 'Manage conversations. Continue chats started from the map or from profiles.',
        },
        keywords: ['messaggi', 'messages', 'chat', 'inbox'],
      },
    ],
    []
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items
      .map((it) => {
        const hay = `${it.title.it} ${it.title.en} ${it.body.it} ${it.body.en} ${it.keywords.join(' ')}`.toLowerCase()
        return { it, score: hay.includes(q) ? 2 : it.keywords.some((k) => k.toLowerCase().includes(q)) ? 1 : 0 }
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.it)
  }, [items, query])

  const active = filtered[Math.min(step, Math.max(0, filtered.length - 1))]
  const activeEl = useMemo(() => {
    if (!active) return null
    return document.querySelector(active.selector) as HTMLElement | null
  }, [active])

  // Tour mode: try to scroll and “pulse” the target element
  useEffect(() => {
    if (!open || !tour) return
    if (!active) return
    const el = document.querySelector(active.selector) as HTMLElement | null
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
    el.classList.add('ring-4', 'ring-sky-400/50', 'ring-offset-2', 'ring-offset-white', 'dark:ring-offset-gray-900')
    const tId = window.setTimeout(() => {
      el.classList.remove('ring-4', 'ring-sky-400/50', 'ring-offset-2', 'ring-offset-white', 'dark:ring-offset-gray-900')
    }, 1800)
    return () => window.clearTimeout(tId)
  }, [open, tour, active, step])

  const title = lang === 'it' ? 'Guida AI' : 'AI Guide'
  const subtitle =
    lang === 'it'
      ? 'Cerca una sezione o avvia il tour per capire dove cliccare.'
      : 'Search a section or start the tour to understand where to click.'

  const goToActive = () => {
    if (!active?.href) return
    if (pathname === active.href) return
    router.push(active.href)
  }

  return (
    <>
      <button
        type="button"
        data-guide="header-ai-guide"
        onClick={() => setOpen(true)}
        className="p-2 rounded-xl hover:bg-sky-50/80 dark:hover:bg-sky-900/30 transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md"
        title={title}
        aria-label={title}
      >
        <HelpCircle className="h-5 w-5 text-slate-700 dark:text-slate-300" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute right-4 top-4 w-[min(520px,calc(100vw-2rem))] rounded-3xl border border-sky-200 dark:border-sky-800 bg-white/90 dark:bg-gray-900/85 backdrop-blur-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-sky-200/60 dark:border-sky-800/60 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-sky-500" />
                    <div className="text-lg font-black text-slate-800 dark:text-slate-100">{title}</div>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">{subtitle}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-xl border border-sky-200 dark:border-sky-800 hover:bg-sky-50 dark:hover:bg-sky-900/20"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-4 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value)
                      setStep(0)
                    }}
                    placeholder={lang === 'it' ? 'Cerca: mappa, filtri, messaggi…' : 'Search: map, filters, messages…'}
                    className="pl-10"
                  />
                </div>

                <div className="flex items-center justify-between gap-2">
                  <Button variant={tour ? 'default' : 'outline'} onClick={() => setTour((v) => !v)} className="flex-1">
                    {lang === 'it' ? (tour ? 'Tour attivo' : 'Avvia tour') : tour ? 'Tour on' : 'Start tour'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setQuery('')
                      setStep(0)
                    }}
                    className="shrink-0"
                  >
                    {lang === 'it' ? 'Reset' : 'Reset'}
                  </Button>
                </div>

                {active ? (
                  <div className="rounded-2xl border border-sky-200 dark:border-sky-800 bg-white/60 dark:bg-gray-900/30 p-4">
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-100">{active.title[lang]}</div>
                    {active.where && (
                      <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="font-semibold">{lang === 'it' ? 'Dove:' : 'Where:'}</span> {active.where[lang]}
                      </div>
                    )}
                    <div className="text-sm text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">{active.body[lang]}</div>

                    {/* Action: open the section when the target isn’t on this page */}
                    {active.href && (
                      <div className="mt-3 flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={goToActive}
                          disabled={pathname === active.href}
                        >
                          {lang === 'it' ? (pathname === active.href ? 'Sei già qui' : 'Vai alla sezione') : pathname === active.href ? 'You are here' : 'Go to section'}
                        </Button>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {activeEl ? (lang === 'it' ? 'Elemento trovato' : 'Target found') : (lang === 'it' ? 'Elemento non in pagina' : 'Target not on page')}
                        </div>
                      </div>
                    )}
                    <div className="mt-3 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setStep((s) => Math.max(0, s - 1))}
                        disabled={step <= 0}
                        className={cn(
                          'px-3 py-2 rounded-xl border text-sm font-semibold flex items-center gap-2',
                          step <= 0
                            ? 'border-sky-200/50 dark:border-sky-800/50 text-slate-400 cursor-not-allowed'
                            : 'border-sky-200 dark:border-sky-800 hover:bg-sky-50 dark:hover:bg-sky-900/20 text-slate-700 dark:text-slate-200'
                        )}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        {lang === 'it' ? 'Indietro' : 'Back'}
                      </button>

                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {step + 1}/{filtered.length}
                      </div>

                      <button
                        type="button"
                        onClick={() => setStep((s) => Math.min(filtered.length - 1, s + 1))}
                        disabled={step >= filtered.length - 1}
                        className={cn(
                          'px-3 py-2 rounded-xl border text-sm font-semibold flex items-center gap-2',
                          step >= filtered.length - 1
                            ? 'border-sky-200/50 dark:border-sky-800/50 text-slate-400 cursor-not-allowed'
                            : 'border-sky-200 dark:border-sky-800 hover:bg-sky-50 dark:hover:bg-sky-900/20 text-slate-700 dark:text-slate-200'
                        )}
                      >
                        {lang === 'it' ? 'Avanti' : 'Next'}
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {lang === 'it' ? 'Nessun risultato.' : 'No results.'}
                  </div>
                )}

                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {lang === 'it'
                    ? 'Nota: la guida evidenzia elementi quando sono presenti nella pagina corrente.'
                    : 'Note: the guide highlights elements only when they exist on the current page.'}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}












