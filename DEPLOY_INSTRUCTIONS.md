# 🚀 Istruzioni Deploy - Progetto Vybes

## ✅ Repository GitHub Configurato

Il codice è stato pushato su: **https://github.com/defnotafantom/new.git**

## 🌐 Deploy su Vercel (CONSIGLIATO - 2 minuti)

### Passo 1: Vai su Vercel
1. Apri [vercel.com/new](https://vercel.com/new)
2. Fai login con GitHub
3. Clicca "Import Git Repository"
4. Seleziona `defnotafantom/new`

### Passo 2: Configurazione Automatica
- Vercel rileva automaticamente Next.js
- Clicca "Deploy" (non serve configurare nulla)

### Passo 3: Aggiungi Variabili d'Ambiente
Dopo il primo deploy, vai su **Settings** > **Environment Variables** e aggiungi:

```
DATABASE_URL=postgresql://user:password@host:5432/database
NEXTAUTH_SECRET=genera-con-openssl-rand-base64-32
NEXTAUTH_URL=https://tuo-progetto.vercel.app
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@vybes.com
```

### Passo 4: Redeploy
Dopo aver aggiunto le variabili, clicca "Redeploy"

## 🗄️ Database PostgreSQL Gratuito

### Opzione 1: Supabase (Consigliato)
1. Vai su [supabase.com](https://supabase.com)
2. Crea account gratuito
3. Crea nuovo progetto
4. Vai su **Settings** > **Database**
5. Copia la **Connection String** (URI)
6. Usala come `DATABASE_URL` in Vercel

### Opzione 2: Railway
1. Vai su [railway.app](https://railway.app)
2. Crea account con GitHub
3. Crea nuovo progetto PostgreSQL
4. Copia la connection string

## 🔐 Genera NEXTAUTH_SECRET

Su Windows PowerShell:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

O usa un generatore online: https://generate-secret.vercel.app/32

## ✅ Checklist Pre-Deploy

- [x] Codice pushato su GitHub
- [ ] Database PostgreSQL configurato
- [ ] Variabili d'ambiente configurate su Vercel
- [ ] Email server configurato (opzionale)
- [ ] Test locale funzionante

## 🎯 Dopo il Deploy

1. Il tuo sito sarà disponibile su: `https://tuo-progetto.vercel.app`
2. Ogni push su GitHub farà automaticamente un nuovo deploy
3. Puoi aggiungere un dominio custom gratuitamente

## ⚠️ Nota su GitHub Pages

**GitHub Pages NON funziona** con questo progetto perché:
- Richiede API routes (server-side)
- Richiede database connection
- Richiede NextAuth.js (server)

**Vercel è la soluzione perfetta e gratuita!** 🚀

---

## 📞 Supporto

Se hai problemi:
1. Controlla i log su Vercel Dashboard
2. Verifica che tutte le variabili d'ambiente siano configurate
3. Assicurati che il database sia accessibile da internet



