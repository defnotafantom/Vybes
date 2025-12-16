# Vybes - Piattaforma di Diffusione Culturale Artistica

Una piattaforma moderna per connettere artisti, recruiter e appassionati d'arte.

## Funzionalità Principali

- 🎨 Gestione multi-utente (Default, Artista, Recruiter)
- 📱 Dashboard interattiva con feed sociale
- 🗺️ Mappa real-time con markers per eventi e annunci
- 💬 Chat real-time (minichat + inbox)
- 🎮 Sistema di gamification con livelli e quest
- 🌙 Dark mode
- 🌍 Multilingua (IT/EN)
- ✉️ Verifica email

## Tecnologie

- Next.js 14 (App Router)
- TypeScript
- Prisma ORM
- NextAuth.js
- Tailwind CSS
- Socket.io
- Leaflet Maps

## Setup

1. Installa le dipendenze:
```bash
npm install
```

2. Configura le variabili d'ambiente (crea `.env.local`):
```
DATABASE_URL="postgresql://user:password@localhost:5432/vybes?schema=public"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@vybes.com"
```

3. Configura il database:
```bash
npm run db:push
npm run db:generate
npm run db:seed
```

4. Avvia il server di sviluppo:
```bash
npm run dev
```

Visita [http://localhost:3000](http://localhost:3000)

## Struttura del Progetto

- `/app` - Pagine e route Next.js
- `/components` - Componenti React riutilizzabili
- `/lib` - Utilities e configurazioni
- `/prisma` - Schema database e migrations
- `/public` - File statici

## Ruoli Utente

- **DEFAULT**: Visualizzatore, può vedere contenuti e interagire
- **ARTIST**: Artista, può pubblicare portfolio, collaborare e partecipare a eventi
- **RECRUITER**: Reclutatore, può creare eventi e ingaggiare artisti

