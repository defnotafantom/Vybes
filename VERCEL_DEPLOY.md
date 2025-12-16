# 🚀 Deploy su Vercel - Istruzioni Rapide

## Opzione 1: Deploy via Web (CONSIGLIATO - 2 minuti)

### Passo 1: Vai su Vercel
1. Apri [vercel.com/new](https://vercel.com/new)
2. Fai **login con GitHub** (usa lo stesso account di GitHub)
3. Clicca **"Import Git Repository"**
4. Cerca e seleziona il repository: **`defnotafantom/new`**

### Passo 2: Configurazione Progetto
- **Framework Preset**: Vercel rileva automaticamente Next.js ✅
- **Root Directory**: Lascia vuoto (è nella root)
- **Build Command**: `npm run build` (automatico)
- **Output Directory**: `.next` (automatico)
- **Install Command**: `npm install` (automatico)

### Passo 3: Aggiungi Variabili d'Ambiente
Prima di cliccare "Deploy", clicca **"Environment Variables"** e aggiungi:

```
DATABASE_URL=postgresql://user:password@host:5432/database
NEXTAUTH_SECRET=genera-una-chiave-segreta-qui
NEXTAUTH_URL=https://tuo-progetto.vercel.app
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@vybes.com
```

**Nota**: Il `NEXTAUTH_URL` sarà disponibile dopo il primo deploy.

### Passo 4: Deploy!
1. Clicca **"Deploy"**
2. Aspetta 2-3 minuti per il build
3. Vercel ti darà l'URL del tuo sito: `https://tuo-progetto.vercel.app`

### Passo 5: Aggiorna NEXTAUTH_URL
Dopo il primo deploy:
1. Vai su **Settings** > **Environment Variables**
2. Aggiorna `NEXTAUTH_URL` con l'URL reale del tuo progetto
3. Clicca **"Redeploy"**

---

## Opzione 2: Deploy via CLI

### Installazione Vercel CLI
```bash
npm i -g vercel
```

### Login
```bash
vercel login
```

### Deploy
```bash
# Deploy preview
vercel

# Deploy produzione
vercel --prod
```

---

## 🗄️ Database PostgreSQL Gratuito

### Consigliato: Supabase
1. Vai su [supabase.com](https://supabase.com)
2. Crea account gratuito
3. Crea nuovo progetto
4. Vai su **Settings** > **Database**
5. Copia la **Connection String** (URI)
6. Formato: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`
7. Usala come `DATABASE_URL` in Vercel

### Alternativa: Railway
1. Vai su [railway.app](https://railway.app)
2. Login con GitHub
3. New Project > Add PostgreSQL
4. Copia la connection string

---

## 🔐 Genera NEXTAUTH_SECRET

Su PowerShell:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Oppure usa: https://generate-secret.vercel.app/32

---

## ✅ Checklist Pre-Deploy

- [x] Codice pushato su GitHub
- [ ] Database PostgreSQL configurato (Supabase/Railway)
- [ ] NEXTAUTH_SECRET generato
- [ ] Variabili d'ambiente pronte
- [ ] Email server configurato (opzionale per iniziare)

---

## 🎯 Dopo il Deploy

1. **URL del sito**: `https://tuo-progetto.vercel.app`
2. **Deploy automatico**: Ogni push su GitHub fa un nuovo deploy
3. **Preview deployments**: Ogni PR crea un preview URL
4. **Analytics**: Disponibili gratuitamente
5. **Domini custom**: Puoi aggiungere il tuo dominio gratuitamente

---

## 🔧 Setup Database su Supabase

1. Crea progetto su Supabase
2. Copia connection string
3. Esegui migrations:
   ```bash
   # Localmente prima del deploy
   npx prisma db push
   npx prisma generate
   ```
4. Aggiungi `DATABASE_URL` su Vercel
5. Al primo deploy, le tabelle verranno create automaticamente se usi `prisma db push`

---

## 📞 Problemi Comuni

### Build fallisce
- Controlla i log su Vercel Dashboard
- Verifica che tutte le dipendenze siano in `package.json`
- Assicurati che `npm run build` funzioni localmente

### Database connection error
- Verifica che il database sia accessibile da internet
- Controlla che la connection string sia corretta
- Su Supabase, vai su Settings > Database > Connection Pooling

### NextAuth non funziona
- Verifica che `NEXTAUTH_SECRET` sia configurato
- Verifica che `NEXTAUTH_URL` sia corretto (deve essere l'URL Vercel)
- Controlla i log su Vercel per errori specifici

---

## 🎉 Fatto!

Il tuo sito sarà live su Vercel in pochi minuti! 🚀

