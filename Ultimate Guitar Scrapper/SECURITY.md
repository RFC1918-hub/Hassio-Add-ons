# Security Best Practices

## Before Going Public:

### 1. **Use Environment Variables**
```bash
cp .env.example .env
# Edit .env with your actual values
```

Never commit `.env` to git! Add it to `.gitignore`:
```
.env
```

### 2. **Update Docker Run Command**
```bash
docker run -d -p 3000:3000 \
  -e N8N_WEBHOOK_URL="your-webhook-url" \
  -e ALLOWED_ORIGINS="https://yourdomain.com" \
  --name ultimate-guitar-app \
  ultimate-guitar-app
```

### 3. **Use HTTPS**
- Deploy behind a reverse proxy (nginx, Caddy, Cloudflare)
- Get SSL certificates (Let's Encrypt)
- Never expose HTTP publicly

### 4. **Additional Security Layers**

#### Add Authentication (Recommended)
Install: `npm install express-basic-auth`

```javascript
const basicAuth = require('express-basic-auth');

app.use(basicAuth({
    users: { 'admin': process.env.ADMIN_PASSWORD },
    challenge: true
}));
```

#### Use a Firewall
- Only allow traffic from known IPs
- Use Cloudflare or similar CDN with DDoS protection

#### Monitor Logs
- Set up logging (Winston, Morgan)
- Monitor for suspicious activity
- Set up alerts

### 5. **Update CORS Origins**
In your `.env` file, set:
```
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 6. **Keep Dependencies Updated**
```bash
npm audit
npm audit fix
```

### 7. **Don't Expose Internal Services**
- Your n8n webhook should also be behind authentication
- Consider using API keys or OAuth

## Current Security Features:
✅ CORS restricted to allowed origins
✅ Rate limiting (100 requests per 15 min)
✅ Strict rate limiting on uploads (10 per 15 min)
✅ Input validation and sanitization
✅ Command injection protection
✅ Request timeout (10s)
✅ Payload size limit (1MB)
✅ Environment variable configuration

## Still Missing:
❌ Authentication/Authorization
❌ HTTPS enforcement
❌ Request logging
❌ Security headers (helmet.js)
❌ IP whitelisting
❌ API key validation
