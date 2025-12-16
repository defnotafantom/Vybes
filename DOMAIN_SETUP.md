# 🌐 Configurazione Dominio Custom su Vercel

## 📋 Panoramica

Vercel supporta domini custom **gratuitamente**! Puoi aggiungere il tuo dominio durante o dopo il deploy.

---

## 🚀 Passo 1: Deploy su Vercel (se non l'hai già fatto)

1. Vai su [vercel.com/new](https://vercel.com/new)
2. Importa il repository `defnotafantom/new`
3. Fai il deploy

---

## 🔧 Passo 2: Aggiungi Dominio su Vercel

### Opzione A: Durante il Deploy
1. Nella schermata di configurazione progetto
2. Nella sezione **"Domains"**
3. Inserisci il tuo dominio (es: `tuodominio.com` o `www.tuodominio.com`)
4. Clicca "Add"

### Opzione B: Dopo il Deploy
1. Vai sul tuo progetto su Vercel Dashboard
2. Clicca su **"Settings"**
3. Vai su **"Domains"**
4. Inserisci il tuo dominio
5. Clicca **"Add"**

---

## 🔐 Passo 3: Configura DNS

Vercel ti mostrerà i record DNS da aggiungere. Ci sono 2 modi:

### Metodo 1: Record A (Consigliato - più veloce)

Aggiungi questi record DNS presso il tuo registrar (GoDaddy, Namecheap, etc.):

```
Type: A
Name: @ (o lascia vuoto per dominio root)
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Metodo 2: Record CNAME (Alternativa)

```
Type: CNAME
Name: @ (dominio root - solo se supportato dal tuo registrar)
Value: cname.vercel-dns.com

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

## 📝 Istruzioni per Registrar Comuni

### GoDaddy
1. Login su GoDaddy
2. Vai su **"My Products"** > **"DNS"**
3. Clicca su **"Manage DNS"** per il tuo dominio
4. Aggiungi i record DNS mostrati da Vercel
5. Salva

### Namecheap
1. Login su Namecheap
2. Vai su **"Domain List"**
3. Clicca **"Manage"** accanto al tuo dominio
4. Vai su **"Advanced DNS"**
5. Aggiungi i record DNS
6. Salva

### Cloudflare (Consigliato per performance)
1. Aggiungi il dominio su Cloudflare
2. Cambia i nameserver sul tuo registrar
3. Vai su **DNS** > **Records**
4. Aggiungi i record DNS di Vercel
5. Attiva **"Proxy"** (icona arancione) per CDN

---

## ⚙️ Passo 4: Configura NEXTAUTH_URL

Dopo aver configurato il dominio:

1. Vai su Vercel Dashboard > **Settings** > **Environment Variables**
2. Aggiorna `NEXTAUTH_URL` con il tuo dominio:
   ```
   NEXTAUTH_URL=https://tuodominio.com
   ```
   O se vuoi supportare sia www che non-www:
   ```
   NEXTAUTH_URL=https://www.tuodominio.com
   ```
3. Clicca **"Save"**
4. Vai su **Deployments** e clicca **"Redeploy"** per applicare le modifiche

---

## 🔒 Passo 5: SSL/HTTPS (Automatico)

Vercel **emette automaticamente certificati SSL gratuiti** tramite Let's Encrypt!

- SSL viene attivato automaticamente dopo la propagazione DNS (5-30 minuti)
- Rinnovo automatico
- HTTPS forzato per tutti i domini

---

## ✅ Verifica Configurazione

1. **Controlla DNS Propagation**:
   - Vai su [whatsmydns.net](https://www.whatsmydns.net)
   - Inserisci il tuo dominio
   - Verifica che punti agli IP di Vercel

2. **Verifica su Vercel**:
   - Dashboard > Settings > Domains
   - Dovresti vedere **"Valid Configuration"** ✅

3. **Testa il sito**:
   - Vai su `https://tuodominio.com`
   - Dovrebbe funzionare!

---

## 🌍 Domini Multiple (www e non-www)

Vercel supporta automaticamente sia `tuodominio.com` che `www.tuodominio.com`:

1. Aggiungi entrambi i domini in Vercel:
   - `tuodominio.com`
   - `www.tuodominio.com`

2. Configura DNS per entrambi (vedi sopra)

3. Vercel reindirizza automaticamente uno all'altro

---

## 🔧 Redirect e Rewrites

Se vuoi configurare redirect (es: da HTTP a HTTPS, da www a non-www):

Aggiungi in `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/old-page',
        destination: '/new-page',
        permanent: true,
      },
    ]
  },
  // ... resto della config
}

module.exports = nextConfig
```

---

## ⚠️ Problemi Comuni

### DNS non si propaga
- **Attendi 24-48 ore** per la propagazione completa
- Alcuni registrar impiegano più tempo
- Usa [whatsmydns.net](https://www.whatsmydns.net) per verificare

### SSL non attiva
- Aspetta che DNS si propaghi completamente
- Vai su Settings > Domains e clicca "Refresh"
- Vercel riproverà ad emettere il certificato

### Dominio non funziona
1. Verifica che i record DNS siano corretti
2. Verifica che il dominio sia aggiunto correttamente su Vercel
3. Controlla i log su Vercel Dashboard
4. Assicurati che `NEXTAUTH_URL` sia aggiornato

### Errore "Domain not verified"
- Vercel deve verificare il dominio
- Assicurati che i record DNS siano configurati correttamente
- Clicca "Refresh" nella pagina Domains su Vercel

---

## 📞 Supporto

Se hai problemi:
- Documentazione Vercel: https://vercel.com/docs/concepts/projects/domains
- Supporto Vercel: support@vercel.com
- Community: https://github.com/vercel/vercel/discussions

---

## 🎉 Fatto!

Il tuo dominio sarà attivo e funzionante con HTTPS automatico! 🚀

