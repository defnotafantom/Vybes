# 🔐 Setup OAuth (Google) - Guida Completa

## 📋 Panoramica

Per abilitare il login con Google, devi configurare le variabili d'ambiente e registrare la tua applicazione con Google.

---

## 🔵 Google OAuth Setup

### 1. Crea un Progetto Google Cloud

1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuovo progetto o seleziona uno esistente
3. Attiva l'API "Google+ API" o "Google Identity"

### 2. Crea Credenziali OAuth 2.0

1. Vai su **APIs & Services** → **Credentials**
2. Clicca su **Create Credentials** → **OAuth client ID**
3. Se è la prima volta, configura la **OAuth consent screen**:
   - User Type: **External** (per sviluppo) o **Internal** (per Google Workspace)
   - Compila le informazioni richieste (Nome app, email supporto, ecc.)
4. Crea OAuth Client ID:
   - Application type: **Web application**
   - Name: `Vybes Web Client`
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (per sviluppo)
     - `https://your-domain.vercel.app` (per produzione)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google` (per sviluppo)
     - `https://your-domain.vercel.app/api/auth/callback/google` (per produzione)
5. Copia **Client ID** e **Client Secret**

### 3. Aggiungi al .env

```env
GOOGLE_CLIENT_ID=337788285202-ggq3pnl3ge5lscon33tdpjf68tgt6t7j.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

---

## ✅ Verifica Configurazione

### Controlla Variabili d'Ambiente

Assicurati che nel file `.env` (locale) e nelle Environment Variables di Vercel (produzione) siano presenti:

```env
# Google
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

### Test Locale

1. Avvia il server: `npm run dev`
2. Vai su `/auth`
3. Clicca su "Continua con Google"
4. Dovresti essere reindirizzato al provider OAuth

---

## 🔧 Troubleshooting

### Google

**Errore: "redirect_uri_mismatch"**
- Verifica che l'URI di redirect in Google Cloud Console corrisponda esattamente a quello usato (incluse http/https)
- Assicurati che l'URI sia nella lista "Authorized redirect URIs"

**Errore: "invalid_client"**
- Verifica che CLIENT_ID e CLIENT_SECRET siano corretti
- Assicurati che non ci siano spazi extra nel .env

---

## 🚀 Per Produzione (Vercel)

1. Vai su Vercel Dashboard → Il tuo progetto → Settings → Environment Variables
2. Aggiungi le variabili OAuth:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
3. Assicurati che i redirect URI siano configurati con il dominio Vercel corretto
4. Ricrea il deployment

---

## ⚠️ Note Importanti

1. **Redirect URIs**: Devono corrispondere esattamente (incluse maiuscole/minuscole)
2. **Sicurezza**: Non committare mai i secret nel repository
3. **Testing**: Testa sempre in locale prima di deployare in produzione

---

## 📝 Quick Start

Per iniziare velocemente:

1. Configura Google OAuth (vedi sopra)
2. Aggiungi al `.env`:
   ```env
   GOOGLE_CLIENT_ID=your-id
   GOOGLE_CLIENT_SECRET=your-secret
   ```
3. Riavvia il server
4. Testa su `/auth`

---

## ✅ Checklist

- [ ] Google OAuth configurato
- [ ] Variabili Google aggiunte al .env
- [ ] Redirect URIs configurati in Google Console
- [ ] Test locale funzionante
- [ ] Variabili configurate su Vercel (produzione)
- [ ] Redirect URIs di produzione configurati

---

Buona configurazione! 🎉
