# 🎬 Vybes - Demo per Portfolio/Curriculum

## 🎯 Obiettivo
Demo funzionante al 100% da mostrare nel portfolio per dimostrare le capacità di sviluppo full-stack.

---

## ⚡ Setup Rapido (5 minuti)

```bash
# 1. Install dependencies
npm install

# 2. Setup database e dati demo
npm run db:push
npm run db:seed

# 3. Avviare demo
npm run dev

# 4. Aprire http://localhost:3000
```

---

## 🔑 Credenziali Demo

Dopo il seed, puoi usare questi account:

| Email | Password | Ruolo | Uso |
|-------|----------|-------|-----|
| `demo@vybes.com` | `demo123` | ARTIST | **Account principale** |
| `artista1@vybes.com` | `password123` | ARTIST | Utente con contenuti |
| `recruiter1@vybes.com` | `password123` | RECRUITER | Per eventi |
| `viewer@vybes.com` | `password123` | DEFAULT | Utente base |

**Nota**: Se l'account `demo@vybes.com` non esiste, crealo con:
```bash
npm run create-user
# Email: demo@vybes.com
# Password: demo123
```

---

## 🎭 Script Demo (3-5 minuti)

### 1️⃣ Overview Generale (1 min)
- ✅ Login
- ✅ Dashboard con 4 modalità feed (Cover, Social, Masonry, Threads)
- ✅ Dark Mode toggle
- ✅ Lingua IT/EN toggle

### 2️⃣ Sistema Post (1 min)
- ✅ Creare post con immagine
- ✅ Like, commenti, reazioni
- ✅ Modifica post (menu "...")
- ✅ Salvataggio post

### 3️⃣ Sistema Eventi (1 min)
- ✅ Visualizzare mappa eventi
- ✅ Creare evento
- ✅ Partecipare a evento
- ✅ Dettaglio evento

### 4️⃣ Features Social (1 min)
- ✅ Profilo utente con statistiche
- ✅ Chat/Messaggi
- ✅ Ricerca globale
- ✅ Notifiche

### 5️⃣ Features Avanzate (30 sec)
- ✅ Portfolio
- ✅ Gamification (livelli, quest)
- ✅ Responsive mobile

---

## 📸 Screenshot Consigliati per Portfolio

1. **Dashboard Feed** (modalità Social) - Mostra l'interfaccia principale
2. **Creazione Evento** con mappa - Feature unica
3. **Profilo Utente** con gamification - Sistema completo
4. **Chat Interface** - Real-time ready
5. **Mobile View** - Responsive design

---

## 🎥 Video Demo Script (Opzionale)

### Intro (30 sec)
"Vybes è una piattaforma social per artisti e recruiter costruita con Next.js 14, TypeScript e Prisma. Permette agli artisti di condividere il loro lavoro, partecipare a eventi e collaborare, mentre i recruiter possono organizzare eventi e trovare talenti."

### Features (2-3 min)
1. **Feed Multi-modalità** - 4 visualizzazioni diverse
2. **Sistema Eventi con Mappa** - Integrazione Leaflet
3. **Chat Real-time Ready** - Socket.io integrato
4. **Gamification Completa** - Sistema di livelli e quest
5. **Responsive Design** - Funziona su tutti i dispositivi

### Outro (30 sec)
"Vybes dimostra competenze in full-stack development, con focus su UX, performance e scalabilità."

---

## 🛠️ Stack Tecnologico da Evidenziare

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **React 18**
- **Tailwind CSS**
- **Framer Motion** (animazioni)

### Backend
- **Next.js API Routes**
- **Prisma ORM**
- **NextAuth.js**

### Database
- **PostgreSQL/SQLite**

### Features
- **SSR/ISR**
- **Image Optimization**
- **SEO**
- **Real-time Ready** (Socket.io)

---

## ✅ Checklist Pre-Demo

### Funzionalità
- [ ] Login funziona
- [ ] Feed carica post
- [ ] Creazione post funziona
- [ ] Modifica/cancellazione post funziona
- [ ] Eventi visibili sulla mappa
- [ ] Creazione evento funziona
- [ ] Chat funziona
- [ ] Notifiche funzionano
- [ ] Ricerca funziona
- [ ] Dark mode funziona
- [ ] Multilingua funziona

### Performance
- [ ] Caricamento < 2 secondi
- [ ] Immagini ottimizzate
- [ ] Infinite scroll funziona
- [ ] Mobile responsive

### Dati
- [ ] Database seedato
- [ ] Esistono post di esempio
- [ ] Esistono eventi di esempio
- [ ] Esistono utenti di esempio

---

## 🚀 Deployment per Demo Online

### Vercel (Consigliato)
1. Push su GitHub
2. Import su Vercel
3. Configura Environment Variables
4. Deploy

### Environment Variables
```env
DATABASE_URL=your_database_url
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=https://your-domain.vercel.app
```

---

## 📋 Highlights da Menzionare

### ✅ Funzionalità Complete
- Sistema autenticazione completo
- Feed social con 4 modalità
- Sistema eventi con mappa
- Chat real-time ready
- Gamification completa
- Portfolio per artisti
- Notifiche in tempo reale
- Ricerca globale
- Responsive design
- Dark mode
- Multilingua

### ✅ Best Practices
- TypeScript per type safety
- Prisma per type-safe database access
- API RESTful ben strutturate
- Error handling completo
- Loading states
- Optimistic updates
- SEO ottimizzato

---

## 🎯 Cosa Evidenziare nella Presentazione

1. **Architettura Scalabile** - Next.js App Router, API Routes
2. **Type Safety** - TypeScript + Prisma
3. **UX/UI Moderna** - Tailwind, animazioni, responsive
4. **Performance** - Image optimization, lazy loading
5. **Real-time Ready** - Socket.io integrato
6. **Features Complete** - Sistema completo e funzionante

---

## ⚠️ Note Importanti

1. **Database Separato** - Usa DB separato per demo
2. **Dati di Test** - Non usare dati reali
3. **Performance** - Testa velocità di caricamento
4. **Errori** - Verifica console per errori
5. **Browser** - Testa su Chrome/Firefox/Safari

---

## 🎉 Buona Demo!

Una demo funzionante al 100% impressiona più di una demo perfetta ma che non funziona. Assicurati che tutto funzioni prima di mostrarla!

---

## 📞 Supporto

Per problemi durante la demo:
1. Controlla i log della console
2. Verifica Environment Variables
3. Controlla connessione database
4. Rileggi questa guida

**In bocca al lupo con la demo! 🚀**

