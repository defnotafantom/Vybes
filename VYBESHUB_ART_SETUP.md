# 🌐 Configurazione vybeshub.art su Vercel

## 🎯 Dominio: vybeshub.art

### 📋 Checklist Setup

- [ ] Deploy progetto su Vercel
- [ ] Aggiungi dominio `vybeshub.art` su Vercel
- [ ] Configura DNS records sul registrar
- [ ] Aggiorna `NEXTAUTH_URL` con `https://vybeshub.art`
- [ ] Attendi propagazione DNS (5-30 minuti)

---

## 🚀 Passo 1: Deploy su Vercel

1. Vai su [vercel.com/new](https://vercel.com/new)
2. Importa repository: `defnotafantom/new`
3. Aggiungi variabili d'ambiente:
   ```
   DATABASE_URL=postgresql://...
   NEXTAUTH_SECRET=genera-chiave-32-caratteri
   NEXTAUTH_URL=https://vybeshub.art
   EMAIL_SERVER_HOST=smtp.gmail.com
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER=your-email@gmail.com
   EMAIL_SERVER_PASSWORD=your-app-password
   EMAIL_FROM=noreply@vybeshub.art
   ```
4. Clicca **"Deploy"**

---

## 🔧 Passo 2: Aggiungi Dominio su Vercel

1. Vai sul tuo progetto su Vercel Dashboard
2. Clicca **"Settings"**
3. Vai su **"Domains"**
4. Inserisci: `vybeshub.art`
5. Clicca **"Add"**
6. Aggiungi anche: `www.vybeshub.art` (opzionale)

Vercel ti mostrerà i record DNS da configurare.

---

## 📝 Passo 3: Configura DNS Records

Vai sul pannello DNS del tuo registrar (dove hai acquistato vybeshub.art) e aggiungi:

### Record A (per dominio root)
```
Type: A
Name: @ (o lascia vuoto per root domain)
Value: 76.76.21.21
TTL: 3600 (o Auto)
```

### Record CNAME (per www)
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600 (o Auto)
```

### Record AAAA (opzionale - per IPv6)
```
Type: AAAA
Name: @
Value: (Vercel ti fornirà questo se necessario)
```

---

## ⚙️ Passo 4: Aggiorna NEXTAUTH_URL

1. Vercel Dashboard > Tuo Progetto > **Settings** > **Environment Variables**
2. Modifica `NEXTAUTH_URL`:
   ```
   NEXTAUTH_URL=https://vybeshub.art
   ```
3. Se vuoi supportare anche www, puoi usare:
   ```
   NEXTAUTH_URL=https://www.vybeshub.art
   ```
4. Clicca **"Save"**
5. Vai su **Deployments** e clicca **"Redeploy"** (icona ⋮ > Redeploy)

---

## 🔒 SSL/HTTPS (Automatico)

- Vercel emette **automaticamente** certificati SSL gratuiti
- SSL si attiva dopo la propagazione DNS (5-30 minuti)
- HTTPS sarà disponibile su `https://vybeshub.art`
- Rinnovo automatico

---

## ⏱️ Attesa Propagazione DNS

- **Minimo**: 5-10 minuti
- **Tipico**: 15-30 minuti
- **Massimo**: 24-48 ore (raro)

Puoi verificare la propagazione su:
- [whatsmydns.net](https://www.whatsmydns.net/#A/vybeshub.art)
- [dnschecker.org](https://dnschecker.org/#A/vybeshub.art)

---

## ✅ Verifica Configurazione

### 1. Controlla DNS su Vercel
- Dashboard > Settings > Domains
- Dovresti vedere **"Valid Configuration"** ✅
- Se vedi errori, clicca "Refresh"

### 2. Testa il sito
- Vai su `https://vybeshub.art`
- Dovrebbe caricare il sito
- Verifica che HTTPS sia attivo (lucchetto verde)

### 3. Verifica NEXTAUTH
- Prova a fare login
- Se ci sono errori, controlla che `NEXTAUTH_URL` sia corretto

---

## 🌍 Registrar Specifici

### Se il dominio è su:
- **GoDaddy**: My Products > DNS > Manage DNS
- **Namecheap**: Domain List > Manage > Advanced DNS
- **Cloudflare**: DNS > Records (consigliato per performance)
- **Aruba**: Pannello > Domini > Gestione DNS
- **Registro.it**: Area Clienti > DNS Management

### Configurazione Cloudflare (Consigliato)
Se usi Cloudflare:
1. Aggiungi il dominio su Cloudflare
2. Cambia nameserver sul registrar
3. In Cloudflare: DNS > Records
4. Aggiungi i record A e CNAME di Vercel
5. **Disattiva Proxy** (icona grigia) per i record DNS di Vercel
   - O usa "DNS only" (non "Proxied")
6. Attiva SSL/TLS > Full (strict)

---

## 🔧 Configurazione Next.js (Opzionale)

Se vuoi configurare redirects o rewrites per il dominio, aggiungi in `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  // Redirect www to non-www (opzionale)
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.vybeshub.art',
          },
        ],
        destination: 'https://vybeshub.art/:path*',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
```

---

## ⚠️ Problemi Comuni

### DNS non si propaga
- Attendi fino a 24-48 ore
- Verifica che i record siano corretti
- Controlla con [whatsmydns.net](https://www.whatsmydns.net)

### SSL non attiva
- DNS deve essere completamente propagato
- Clicca "Refresh" su Vercel > Settings > Domains
- Vercel riproverà ad emettere il certificato

### Dominio non funziona
1. Verifica record DNS sul registrar
2. Verifica che il dominio sia su Vercel
3. Controlla i log su Vercel Dashboard
4. Assicurati che `NEXTAUTH_URL=https://vybeshub.art`

### Errore "Domain not verified"
- Verifica che i record DNS siano corretti
- Clicca "Refresh" nella pagina Domains
- Attendi la propagazione completa

---

## 📧 Email Configuration

Se vuoi usare email dal dominio `vybeshub.art`:

### Opzione 1: Google Workspace / Microsoft 365
- Configura email professionali
- Usa SMTP del provider

### Opzione 2: SendGrid / Mailgun
- Servizi email transazionali
- Configura SMTP nei settings

### Opzione 3: Gmail SMTP (per test)
- Usa Gmail temporaneamente
- Per produzione, usa servizio professionale

---

## 🎉 Risultato Finale

Il tuo sito sarà disponibile su:
- **https://vybeshub.art** ✅
- **https://www.vybeshub.art** ✅ (se configurato)

Tutto con SSL/HTTPS automatico e gratuito! 🚀

---

## 📞 Supporto

- Vercel Docs: https://vercel.com/docs/concepts/projects/domains
- Vercel Support: support@vercel.com
- Verifica DNS: https://www.whatsmydns.net/#A/vybeshub.art

