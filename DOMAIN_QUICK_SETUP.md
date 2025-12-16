# ⚡ Quick Setup Dominio - Vercel

## 🎯 Setup Rapido (5 minuti)

### 1️⃣ Aggiungi Dominio su Vercel
1. Dashboard Vercel > Tuo Progetto > **Settings** > **Domains**
2. Inserisci: `tuodominio.com`
3. Clicca **"Add"**

### 2️⃣ Configura DNS sul Registrar

**Aggiungi questi record:**

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
```

### 3️⃣ Aggiorna NEXTAUTH_URL
1. Vercel > Settings > **Environment Variables**
2. Aggiorna: `NEXTAUTH_URL=https://tuodominio.com`
3. **Redeploy**

### 4️⃣ Attendi DNS (5-30 minuti)

SSL viene attivato automaticamente! ✅

---

**Il tuo sito sarà su:** `https://tuodominio.com` 🎉

Per dettagli completi: vedi `DOMAIN_SETUP.md`

