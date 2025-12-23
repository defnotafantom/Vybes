# 🔐 Guida Configurazione Google OAuth - Passo Passo

Questa guida ti aiuterà a configurare il login con Google in modo semplice e veloce.

---

## 📋 Passo 1: Configura Google Cloud Console

### 1.1 Crea/Accessa il Progetto

1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Seleziona un progetto esistente o crea uno nuovo:
   - Clicca sul selettore progetti in alto
   - Clicca su "New Project"
   - Nome: `Vybes` (o altro nome)
   - Clicca "Create"

### 1.2 Abilita le API Necessarie

1. Vai su **APIs & Services** → **Library**
2. Cerca "Google+ API" o "Google Identity"
3. Clicca su "Enable" se non già abilitata

### 1.3 Configura OAuth Consent Screen

1. Vai su **APIs & Services** → **OAuth consent screen**
2. Scegli **User Type**:
   - **External** (per sviluppo/produzione pubblica) - ⚠️ Richiede verifica Google per produzione
   - **Internal** (solo se hai Google Workspace)
3. Compila i campi richiesti:
   - **App name**: `Vybes`
   - **User support email**: La tua email
   - **Developer contact information**: La tua email
4. Clicca "Save and Continue"
5. Per ora puoi saltare gli scope (non necessari per login base)
6. Aggiungi test users se necessario (solo per External in sviluppo)
7. Clicca "Save and Continue" fino alla fine

### 1.4 Crea Credenziali OAuth

1. Vai su **APIs & Services** → **Credentials**
2. Clicca su **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Seleziona:
   - **Application type**: `Web application`
   - **Name**: `Vybes Web Client`
4. Configura **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   ```
   (Aggiungeremo il dominio produzione dopo)
5. Configura **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
   (Aggiungeremo il dominio produzione dopo)
6. Clicca **CREATE**
7. **IMPORTANTE**: Copia subito:
   - **Your Client ID**: `337788285202-ggq3pnl3ge5lscon33tdpjf68tgt6t7j.apps.googleusercontent.com` (o simile)
   - **Your Client Secret**: Una stringa lunga (es: `GOCSPX-...`)
   - ⚠️ Il Client Secret viene mostrato UNA SOLA VOLTA!

---

## 📝 Passo 2: Configura il File .env.local

1. Crea un file chiamato `.env.local` nella root del progetto (se non esiste già)

2. Aggiungi queste righe (sostituisci con i tuoi valori):

```env
# Google OAuth
GOOGLE_CLIENT_ID=337788285202-ggq3pnl3ge5lscon33tdpjf68tgt6t7j.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-il-tuo-secret-qui
```

**Nota**: 
- Rimuovi le virgolette se ci sono
- Non aggiungere spazi intorno al `=`
- Se il file `.env.local` esiste già, aggiungi solo queste due righe

Esempio completo di `.env.local`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/vybes?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID=337788285202-ggq3pnl3ge5lscon33tdpjf68tgt6t7j.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-il-tuo-secret-qui

# Email (opzionale)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@vybes.com"
```

---

## ✅ Passo 3: Testa la Configurazione

1. **Riavvia il server di sviluppo** (se era già avviato):
   ```bash
   # Ferma il server (Ctrl+C) e riavvialo
   npm run dev
   ```

2. Vai su `http://localhost:3000/auth`

3. Dovresti vedere il bottone **"Continua con Google"**

4. Clicca su **"Continua con Google"**

5. Dovresti essere reindirizzato a Google per il login

6. Dopo aver autorizzato, dovresti essere reindirizzato al dashboard

---

## 🔧 Troubleshooting

### Il bottone "Continua con Google" non appare

**Problema**: Le variabili d'ambiente non sono configurate correttamente

**Soluzione**:
1. Verifica che `.env.local` esista nella root del progetto
2. Verifica che `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` siano presenti
3. Riavvia il server (`npm run dev`)
4. Controlla la console del server per eventuali warning

### Errore: "redirect_uri_mismatch"

**Problema**: L'URI di redirect non corrisponde a quello configurato in Google Console

**Soluzione**:
1. Vai su Google Cloud Console → Credentials → Il tuo OAuth Client
2. Verifica che in **Authorized redirect URIs** ci sia esattamente:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
   (con `http://` non `https://`, senza spazi, tutto minuscolo)

### Errore: "invalid_client"

**Problema**: Client ID o Client Secret errati

**Soluzione**:
1. Verifica che non ci siano spazi extra nel `.env.local`
2. Verifica che il CLIENT_ID e CLIENT_SECRET siano corretti
3. Copia di nuovo i valori da Google Cloud Console

### Errore: "access_denied"

**Problema**: L'app non è autorizzata o ci sono problemi con OAuth consent screen

**Soluzione**:
1. Vai su Google Cloud Console → OAuth consent screen
2. Assicurati che lo stato sia "Testing" o "In production"
3. Se è "Testing", aggiungi la tua email come test user

---

## 🚀 Passo 4: Configurazione per Produzione (Vercel)

Quando sei pronto per deployare su Vercel:

### 4.1 Aggiungi Redirect URI di Produzione

1. Vai su Google Cloud Console → Credentials → Il tuo OAuth Client
2. In **Authorized JavaScript origins**, aggiungi:
   ```
   https://your-app.vercel.app
   ```
3. In **Authorized redirect URIs**, aggiungi:
   ```
   https://your-app.vercel.app/api/auth/callback/google
   ```
4. Sostituisci `your-app.vercel.app` con il tuo dominio Vercel reale

### 4.2 Aggiungi Variabili d'Ambiente su Vercel

1. Vai su [Vercel Dashboard](https://vercel.com/dashboard)
2. Seleziona il tuo progetto
3. Vai su **Settings** → **Environment Variables**
4. Aggiungi:
   - **Name**: `GOOGLE_CLIENT_ID`
   - **Value**: Il tuo Client ID
   - **Environment**: Production, Preview, Development (seleziona tutti)
5. Aggiungi:
   - **Name**: `GOOGLE_CLIENT_SECRET`
   - **Value**: Il tuo Client Secret
   - **Environment**: Production, Preview, Development (seleziona tutti)
6. Clicca "Save"
7. Riscarica il deployment per applicare le modifiche

### 4.3 Se l'App è "External" in OAuth Consent Screen

Se hai scelto "External" come User Type, Google richiederà la verifica dell'app per la produzione. Per testare:
1. Mantieni l'app in stato "Testing"
2. Aggiungi gli utenti di test nell'OAuth consent screen
3. Quando sei pronto per produzione pubblica, invia la richiesta di verifica a Google

---

## ✅ Checklist Finale

- [ ] Progetto creato su Google Cloud Console
- [ ] OAuth consent screen configurato
- [ ] Credenziali OAuth create (Client ID e Client Secret salvati)
- [ ] Redirect URIs configurati in Google Console (localhost per sviluppo)
- [ ] `.env.local` creato con `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`
- [ ] Server riavviato
- [ ] Test login funzionante su localhost
- [ ] (Per produzione) Redirect URIs di produzione aggiunti
- [ ] (Per produzione) Variabili d'ambiente configurate su Vercel

---

## 💡 Note Importanti

1. **NON committare mai** il file `.env.local` nel repository (è già nel `.gitignore`)
2. Il **Client Secret** viene mostrato solo una volta - se lo perdi, devi crearne uno nuovo
3. Per produzione, assicurati che l'OAuth consent screen sia verificato da Google
4. I redirect URIs devono corrispondere **esattamente** (case-sensitive, con/senza trailing slash)

---

## 🆘 Hai bisogno di aiuto?

Se qualcosa non funziona:
1. Controlla la console del browser (F12) per errori JavaScript
2. Controlla la console del server per errori o warning
3. Verifica che tutte le variabili d'ambiente siano configurate correttamente
4. Assicurati che i redirect URIs corrispondano esattamente

Buona configurazione! 🎉

