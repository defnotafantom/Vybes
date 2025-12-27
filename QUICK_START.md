# 🚀 Quick Start - Vybes

Guida rapida per iniziare con Vybes in pochi minuti.

## 📋 Prerequisiti

- Node.js 18+ installato
- npm o yarn installato
- Un database PostgreSQL (locale o online)

## ⚡ Setup Rapido (5 minuti)

### 1. Installa le dipendenze

```bash
npm install
```

### 2. Configura le variabili d'ambiente

Copia il file template e compilalo:

```bash
# Windows PowerShell
Copy-Item env.template .env.local

# Linux/Mac
cp env.template .env.local
```

Poi modifica `.env.local` e inserisci:

**RICHIESTO:**
- `DATABASE_URL` - Connection string del tuo database PostgreSQL
- `NEXTAUTH_SECRET` - Genera una chiave segreta:
  ```powershell
  # Windows PowerShell
  [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
  
  # Linux/Mac
  openssl rand -base64 32
  ```

**OPZIONALE:**
- `NEXTAUTH_URL` - URL dell'app (default: http://localhost:3000)
- `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` - Per login Google
- Configurazione email per verifica account

### 3. Configura il Database

```bash
# Genera il Prisma Client
npm run db:generate

# Crea le tabelle nel database
npm run db:push

# (Opzionale) Popola dati iniziali
npm run db:seed
```

### 4. Avvia il server

```bash
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000) nel browser.

## 🗄️ Opzioni Database

### Opzione A: Database Online (Consigliato per sviluppo)

Usa un servizio gratuito:
- **Supabase**: https://supabase.com (gratuito)
- **Neon**: https://neon.tech (gratuito)
- **Railway**: https://railway.app (gratuito con crediti)

Copia la connection string e incollala in `DATABASE_URL`.

### Opzione B: PostgreSQL Locale

1. Installa PostgreSQL
2. Crea un database:
   ```sql
   CREATE DATABASE vybes;
   ```
3. Aggiorna `DATABASE_URL` in `.env.local`

### Opzione C: SQLite (Solo per test rapidi)

Modifica `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

Poi esegui:
```bash
npm run db:push
npm run db:generate
```

## ✅ Verifica Setup

1. ✅ Server avviato senza errori
2. ✅ Pagina principale carica correttamente
3. ✅ Puoi registrare un nuovo account
4. ✅ Puoi fare login

## 🆘 Problemi Comuni

### Errore: "DATABASE_URL is required"
- Verifica che `.env.local` esista nella root del progetto
- Controlla che `DATABASE_URL` sia presente e corretto

### Errore: "Cannot connect to database"
- Verifica che PostgreSQL sia avviato (se locale)
- Controlla username, password e nome database nella connection string
- Verifica che il database esista

### Errore: "Prisma Client not initialized"
```bash
npm run db:generate
```

### Il login non funziona
- Verifica che `NEXTAUTH_SECRET` sia configurato
- Controlla i log della console per errori
- Assicurati che l'utente esista nel database

## 📚 Documentazione Completa

- **Setup Database**: Vedi [SETUP.md](./SETUP.md)
- **Google OAuth**: Vedi [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)
- **Deploy**: Vedi [DEPLOY.md](./DEPLOY.md)

## 🎯 Prossimi Passi

1. Crea un account utente
2. Esplora la dashboard
3. Crea un post o evento
4. Personalizza il tuo profilo

Buon divertimento! 🎨

