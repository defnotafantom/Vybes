# ⚡ Quick Start - Deploy su Vercel (2 minuti)

## 🚀 3 Passi per il Deploy

### 1️⃣ Vai su Vercel
👉 **https://vercel.com/new**

### 2️⃣ Importa Repository
- Login con GitHub
- Seleziona: **`defnotafantom/new`**
- Clicca **"Import"**

### 3️⃣ Configura e Deploy

**Aggiungi queste variabili d'ambiente** (prima di cliccare Deploy):

```
DATABASE_URL=postgresql://... (da Supabase/Railway)
NEXTAUTH_SECRET=genera-con-node---e-console-log-require-crypto-randomBytes-32-toString-base64
NEXTAUTH_URL=https://tuo-progetto.vercel.app (aggiorna dopo primo deploy)
```

**Poi clicca "Deploy"!** ✅

---

## 🗄️ Database Gratuito (Supabase)

1. Vai su **supabase.com**
2. Crea progetto
3. Settings > Database > Copia Connection String
4. Usala come `DATABASE_URL`

---

## ✨ Fatto!

Il tuo sito sarà live su: `https://tuo-progetto.vercel.app`

Ogni push su GitHub = nuovo deploy automatico! 🎉

