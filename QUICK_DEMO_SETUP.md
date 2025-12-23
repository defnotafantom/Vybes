# ⚡ Quick Demo Setup - Vybes

## 🚀 Setup in 5 Minuti

### 1. Installazione Dependencies
```bash
npm install
```

### 2. Setup Database e Dati Demo
```bash
# Reset e setup database
npm run db:push

# Seed con dati demo completi
npm run db:seed:demo
```

### 3. Avviare Demo
```bash
npm run dev
```

### 4. Accedere
- URL: http://localhost:3000
- **Account Demo Principale**: `demo@vybes.com` / `demo123`
- Altri account disponibili dopo il seed

---

## 👤 Account Demo Pre-Caricati

Dopo il seed, avrai questi account:

| Email | Password | Ruolo | Note |
|-------|----------|-------|------|
| `demo@vybes.com` | `demo123` | ARTIST | **Account principale per demo** |
| `artista1@vybes.com` | `password123` | ARTIST | Ha già post ed eventi |
| `recruiter1@vybes.com` | `password123` | RECRUITER | Ha eventi creati |
| `viewer@vybes.com` | `password123` | DEFAULT | Utente base |

---

## 📝 Script Demo Rapida (3 minuti)

### Minuto 1: Overview
1. Login con `demo@vybes.com`
2. Mostrare Dashboard con 4 modalità feed
3. Toggle dark mode
4. Toggle lingua IT/EN

### Minuto 2: Features Principali
1. Creare un post con immagine
2. Like, commento, reazione
3. Visualizzare evento sulla mappa
4. Partecipare a evento

### Minuto 3: Features Avanzate
1. Aprire chat
2. Visualizzare profilo con statistiche
3. Mostrare portfolio
4. Mostrare notifiche

---

## 🎥 Screenshot Consigliati

1. **Dashboard Feed** (modalità Social)
2. **Creazione Evento** con mappa
3. **Profilo Utente** con gamification
4. **Chat Interface**
5. **Mobile View** (responsive)

---

## ✅ Checklist Pre-Demo

- [ ] Database seedato
- [ ] Login funziona
- [ ] Feed carica post
- [ ] Creazione post funziona
- [ ] Eventi visibili
- [ ] Chat funziona
- [ ] Mobile responsive ok

---

## 🎯 Features da Evidenziare

### Tecnologie
- Next.js 14 (App Router)
- TypeScript
- Prisma ORM
- Tailwind CSS
- NextAuth.js
- Socket.io (real-time ready)

### Features
- Feed multi-modalità (4 visualizzazioni)
- Sistema eventi con mappa
- Chat real-time ready
- Gamification completa
- Portfolio per artisti
- Notifiche in tempo reale

---

## 🔧 Troubleshooting

### Database non si connette
```bash
# Verifica DATABASE_URL in .env
# Per SQLite: DATABASE_URL="file:./dev.db"
# Per PostgreSQL: DATABASE_URL="postgresql://..."
```

### Seed fallisce
```bash
# Reset database
npx prisma migrate reset
npm run db:seed
```

### Errori build
```bash
# Rigenera Prisma Client
npx prisma generate
npm run build
```

---

Buona demo! 🎉

