# 🎬 Guida Demo Vybes - Per Portfolio/Curriculum

## 🎯 Obiettivo
Creare una demo professionale e funzionante al 100% da mostrare nel portfolio/curriculum.

---

## 📋 Setup Rapido Demo

### 1. Preparazione Database
```bash
# Reset database e seed con dati demo
npm run db:push
npm run db:seed
```

### 2. Creare Utente Admin Demo
```bash
# Creare utente superadmin per demo
npm run create-user
# Seguire le istruzioni e salvare le credenziali
```

### 3. Avviare il Progetto
```bash
npm run dev
```

### 4. Accedere
- URL: http://localhost:3000
- Login con credenziali create sopra

---

## 🎭 Script Demo - Cosa Mostrare (5-10 minuti)

### Parte 1: Autenticazione e Dashboard (1 min)
1. ✅ **Login** - Mostrare sistema autenticazione
2. ✅ **Dashboard** - 4 modalità visualizzazione feed (Cover, Social, Masonry, Threads)
   - Cambiare modalità per mostrare flessibilità UI
3. ✅ **Dark Mode** - Toggle dark/light mode
4. ✅ **Multilingua** - Toggle IT/EN

### Parte 2: Sistema Post (2 min)
1. ✅ **Creare un post** con:
   - Testo
   - Immagine
   - Tag
   - Opzionale: Poll
2. ✅ **Interazioni post**:
   - Like/Unlike
   - Reazioni emoji
   - Commenti
   - Salvataggio (Bookmark)
   - Repost
3. ✅ **Modifica post** - Menu "..." → Modifica
4. ✅ **Cancellazione post** - Menu "..." → Elimina (dopo conferma)

### Parte 3: Eventi (2 min)
1. ✅ **Creare un evento**:
   - Titolo, descrizione
   - Data/ora
   - Posizione (mappa interattiva)
   - Tipo evento
   - Immagine
2. ✅ **Visualizzare eventi**:
   - Lista eventi
   - Mappa eventi
   - Dettaglio evento
3. ✅ **Partecipare a evento**
4. ✅ **Gestire partecipanti** (se recruiter)

### Parte 4: Social Features (2 min)
1. ✅ **Profilo utente**:
   - Visualizzare statistiche
   - Follow/Unfollow
   - Recap eventi partecipati
   - Portfolio
2. ✅ **Chat/Messaggi**:
   - Minichat flottante
   - Pagina messaggi completa
   - Inviare messaggio
3. ✅ **Ricerca globale**:
   - Cercare utenti
   - Cercare post
   - Cercare eventi

### Parte 5: Features Avanzate (1-2 min)
1. ✅ **Gamification**:
   - Livelli ed esperienza
   - Quest system
   - Reputazione
2. ✅ **Notifiche**:
   - Badge notifiche
   - Lista notifiche
3. ✅ **Portfolio**:
   - Upload item portfolio
   - Visualizzazione portfolio
4. ✅ **Collaborazioni**:
   - Creare post collaborazione
   - Invitare artisti

### Parte 6: Responsive Design (30 sec)
1. ✅ Mostrare su mobile (dev tools)
2. ✅ Navigazione mobile menu

---

## 📝 Checklist Pre-Demo

### Verifica Funzionalità
- [ ] Login funziona
- [ ] Feed carica correttamente
- [ ] Creazione post funziona
- [ ] Modifica post funziona
- [ ] Cancellazione post funziona
- [ ] Creazione evento funziona
- [ ] Mappa eventi funziona
- [ ] Chat funziona
- [ ] Notifiche funzionano
- [ ] Ricerca funziona
- [ ] Dark mode funziona
- [ ] Multilingua funziona
- [ ] Responsive su mobile

### Verifica Dati
- [ ] Database seedato con dati demo
- [ ] Esistono almeno 5-10 post di esempio
- [ ] Esistono almeno 3-5 eventi di esempio
- [ ] Esistono almeno 3-5 utenti di esempio
- [ ] Alcuni post hanno immagini
- [ ] Alcuni eventi hanno immagini

### Verifica Performance
- [ ] Pagina carica velocemente (< 2 secondi)
- [ ] Immagini caricano correttamente
- [ ] Infinite scroll funziona
- [ ] Navigazione fluida

---

## 🎥 Script Video Demo (Opzionale)

Se vuoi registrare un video:

### Intro (30 sec)
"Vybes è una piattaforma social per artisti e recruiter. Permette agli artisti di condividere il loro lavoro, partecipare a eventi e collaborare, mentre i recruiter possono organizzare eventi e trovare talenti."

### Features Principali
1. **Feed Social Multi-modalità** (1 min)
2. **Sistema Eventi con Mappa** (1 min)
3. **Chat e Collaborazioni** (1 min)
4. **Gamification e Notifiche** (30 sec)
5. **Responsive Design** (30 sec)

### Outro (30 sec)
"Vybes è costruito con Next.js 14, TypeScript, Prisma, e Tailwind CSS. Include autenticazione completa, real-time features, e un sistema di gamification."

---

## 🚀 Deployment per Demo

### Vercel (Consigliato)
1. Push su GitHub
2. Importa su Vercel
3. Configura Environment Variables:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - Altri necessari
4. Deploy

### Environment Variables Necessari
```env
DATABASE_URL=your_database_url
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_URL_DEV=http://localhost:3000
```

---

## 📸 Screenshot Consigliati per Portfolio

1. **Dashboard Feed** (modalità Social)
2. **Creazione Post** con modal aperto
3. **Mappa Eventi** con marker visibili
4. **Chat Interface** con conversazione
5. **Profilo Utente** con statistiche
6. **Mobile View** (responsive)

---

## ⚠️ Note Importanti per Demo

1. **Database**: Usa un database separato per demo (non produzione)
2. **Dati Sensibili**: Non usare dati reali di utenti
3. **Performance**: Assicurati che carichi velocemente
4. **Errori**: Verifica che non ci siano errori in console
5. **Browser**: Testa su Chrome/Firefox/Safari

---

## 🎯 Highlight Tecnologici da Menzionare

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion (animazioni)
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL/SQLite
- **Auth**: NextAuth.js
- **Real-time**: Socket.io (setup completo)
- **Features**: SSR, ISR, Image Optimization, SEO

---

## 📦 File Aggiuntivi per Demo

- `DEMO_DATA.md` - Dati di esempio pre-caricati
- `SCREENSHOTS/` - Screenshot per portfolio
- `demo-video.mp4` - Video demo (opzionale)

---

## ✅ Quick Start Checklist

```bash
# 1. Install dependencies
npm install

# 2. Setup database
npm run db:push
npm run db:seed

# 3. Create demo user
npm run create-user

# 4. Start dev server
npm run dev

# 5. Open http://localhost:3000
# 6. Login e inizia demo!
```

---

## 🎉 Buona Demo!

Ricorda: una demo funzionante al 100% impressiona più di una demo perfetta ma che non funziona. Assicurati che tutto funzioni prima di mostrarla!

