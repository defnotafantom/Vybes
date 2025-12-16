# Setup Database - Guida Rapida

## Problema: "Non mi fa registrare"

Se la registrazione non funziona, probabilmente il database non è configurato. Segui questi passaggi:

## 1. Crea il file `.env.local`

Crea un file chiamato `.env.local` nella root del progetto con questo contenuto:

```env
# Database - IMPORTANTE: Sostituisci con i tuoi dati
DATABASE_URL="postgresql://user:password@localhost:5432/vybes?schema=public"

# NextAuth - Genera una chiave segreta
NEXTAUTH_SECRET="genera-una-chiave-segreta-qui"
NEXTAUTH_URL="http://localhost:3000"

# Email (Opzionale - per la verifica email)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@vybes.com"
```

### Per generare NEXTAUTH_SECRET:
```bash
# Su Windows PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Su Linux/Mac:
openssl rand -base64 32
```

## 2. Configura il Database PostgreSQL

### Opzione A: PostgreSQL Locale
1. Installa PostgreSQL sul tuo computer
2. Crea un database:
   ```sql
   CREATE DATABASE vybes;
   ```
3. Aggiorna `DATABASE_URL` in `.env.local` con le tue credenziali

### Opzione B: Database Online (Consigliato per sviluppo)
Usa un servizio gratuito come:
- **Supabase**: https://supabase.com (gratuito)
- **Neon**: https://neon.tech (gratuito)
- **Railway**: https://railway.app (gratuito con crediti)

Copia la connection string e incollala in `DATABASE_URL`

## 3. Inizializza il Database

Dopo aver configurato `.env.local`, esegui:

```bash
# Genera il Prisma Client
npm run db:generate

# Crea le tabelle nel database
npm run db:push

# (Opzionale) Popola le quest iniziali
npm run db:seed
```

## 4. Verifica che tutto funzioni

```bash
# Avvia il server
npm run dev
```

Ora prova a registrarti di nuovo. I toast ti mostreranno esattamente dove si blocca il processo.

## Troubleshooting

### Errore: "Database non configurato"
- Verifica che `.env.local` esista nella root del progetto
- Controlla che `DATABASE_URL` sia presente e corretto

### Errore: "Impossibile connettersi al database"
- Verifica che PostgreSQL sia avviato (se locale)
- Controlla che la connection string sia corretta
- Verifica username, password e nome database

### Errore: "Schema database non aggiornato"
- Esegui: `npm run db:push`
- Poi: `npm run db:generate`

### Errore: "Prisma Client not initialized"
- Esegui: `npm run db:generate`

## Test Rapido senza Database (Solo per sviluppo)

Se vuoi testare velocemente senza configurare un database, puoi usare SQLite modificando `prisma/schema.prisma`:

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

