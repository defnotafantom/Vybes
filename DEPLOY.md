# 🚀 Guida al Deploy

## ⚠️ IMPORTANTE: GitHub Pages vs Vercel

**GitHub Pages** supporta **SOLO siti statici** e **NON può eseguire**:
- ❌ API routes (server-side)
- ❌ Database connections
- ❌ Server-side rendering dinamico
- ❌ NextAuth.js (richiede server)

**Il tuo progetto usa tutte queste funzionalità**, quindi **GitHub Pages NON funzionerà**.

## ✅ SOLUZIONE CONSIGLIATA: Vercel (GRATUITO)

Vercel è **gratuito** e **perfetto** per Next.js perché supporta tutte le funzionalità server-side.

### Opzione 1: Deploy Automatico da GitHub (CONSIGLIATO)

1. **Inizializza Git e fai push su GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/TUO-USERNAME/TUO-REPO.git
   git push -u origin main
   ```

2. **Vai su [vercel.com](https://vercel.com)** e fai login con GitHub

3. **Clicca "Add New Project"**

4. **Seleziona il tuo repository**

5. **Vercel rileva automaticamente Next.js** - clicca "Deploy"

6. **Configura le variabili d'ambiente**:
   - `DATABASE_URL` - La tua connessione PostgreSQL
   - `NEXTAUTH_SECRET` - Genera una chiave segreta: `openssl rand -base64 32`
   - `NEXTAUTH_URL` - URL del tuo sito Vercel (es: https://tuo-progetto.vercel.app)
   - `EMAIL_SERVER_HOST`, `EMAIL_SERVER_PORT`, `EMAIL_SERVER_USER`, `EMAIL_SERVER_PASSWORD`, `EMAIL_FROM` - Configurazione email

7. **Redeploy** dopo aver aggiunto le variabili d'ambiente

### Opzione 2: Deploy da CLI

1. **Installa Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Fai login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Per deploy di produzione:**
   ```bash
   vercel --prod
   ```

## 🗄️ Database: PostgreSQL su Cloud

Per il database, puoi usare servizi gratuiti come:
- **Supabase** (gratuito, PostgreSQL gratuito)
- **Railway** (gratuito per iniziare)
- **Neon** (gratuito per PostgreSQL)

### Esempio con Supabase:
1. Vai su [supabase.com](https://supabase.com)
2. Crea un nuovo progetto
3. Copia la connection string
4. Usala come `DATABASE_URL` in Vercel

## 🔧 Setup Variabili d'Ambiente su Vercel

1. Vai su **Settings** > **Environment Variables**
2. Aggiungi tutte le variabili necessarie:
   ```
   DATABASE_URL=postgresql://...
   NEXTAUTH_SECRET=your-secret-key
   NEXTAUTH_URL=https://tuo-progetto.vercel.app
   EMAIL_SERVER_HOST=smtp.gmail.com
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER=your-email@gmail.com
   EMAIL_SERVER_PASSWORD=your-app-password
   EMAIL_FROM=noreply@vybes.com
   ```

## 📋 Checklist Pre-Deploy

- [ ] Tutti i file committati e pushati su GitHub
- [ ] Database configurato e accessibile
- [ ] Variabili d'ambiente configurate su Vercel
- [ ] Test locale funzionante (`npm run build`)
- [ ] Email server configurato (opzionale)

## 🌐 Domini Custom (Opzionale)

Vercel permette di aggiungere domini custom gratuitamente:
1. Vai su **Settings** > **Domains**
2. Aggiungi il tuo dominio
3. Segui le istruzioni per configurare DNS

---

**Nota**: Se hai ancora bisogno di GitHub Pages per qualche motivo specifico, dovresti:
1. Rimuovere tutte le API routes
2. Rimuovere il database
3. Convertire tutto in static site generation
4. Perderesti tutte le funzionalità dinamiche

**Vercel è la scelta migliore per questo progetto!** 🚀

