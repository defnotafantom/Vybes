# ⚡ Quick Setup - vybeshub.art

## 🎯 4 Passi Veloci

### 1️⃣ Deploy su Vercel
👉 https://vercel.com/new
- Importa: `defnotafantom/new`
- Aggiungi variabili d'ambiente (vedi sotto)
- Deploy!

### 2️⃣ Aggiungi Dominio
- Vercel Dashboard > Settings > Domains
- Aggiungi: `vybeshub.art`
- Aggiungi: `www.vybeshub.art` (opzionale)

### 3️⃣ Configura DNS sul Registrar

**Aggiungi questi record:**

```
A Record:
Type: A
Name: @
Value: 76.76.21.21

CNAME Record:
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 4️⃣ Aggiorna NEXTAUTH_URL
- Vercel > Settings > Environment Variables
- Imposta: `NEXTAUTH_URL=https://vybeshub.art`
- Redeploy

---

## 🔑 Variabili d'Ambiente Necessarie

```
DATABASE_URL=postgresql://... (da Supabase)
NEXTAUTH_SECRET=genera-chiave-32-carat
NEXTAUTH_URL=https://vybeshub.art
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@vybeshub.art
```

---

## ⏱️ Attendi 15-30 minuti

SSL si attiva automaticamente! ✅

**Il tuo sito sarà su:** https://vybeshub.art 🎉

Per dettagli completi: vedi `VYBESHUB_ART_SETUP.md`

