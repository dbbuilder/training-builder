# Training Builder UI - Deployment Guide

Complete guide for deploying the Training Builder Web UI to various platforms.

## Quick Deploy to Vercel (Recommended)

### Prerequisites
- GitHub account
- Vercel account (sign up at vercel.com)
- Project pushed to GitHub repository

### Steps

1. **Push to GitHub**
   ```bash
   cd /mnt/d/dev2/claude-agent-sdk/training-builder-ui
   git init
   git add .
   git commit -m "Initial commit: Training Builder UI v1.0"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/training-builder-ui.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI
   npm install -g vercel

   # Login to Vercel
   vercel login

   # Deploy
   vercel

   # Production deployment
   vercel --prod
   ```

3. **Configure via Vercel Dashboard**
   - Go to vercel.com/dashboard
   - Select your project
   - Settings → Environment Variables
   - Add variables from `.env.example`

4. **Done!**
   Your app will be live at: `https://your-project.vercel.app`

---

## Alternative: Deploy to Netlify

### Steps

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build the project**
   ```bash
   npm run build
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod
   ```

4. **Configure**
   - Build command: `npm run build`
   - Publish directory: `.next`

---

## Docker Deployment

### Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Build and Run

```bash
# Build image
docker build -t training-builder-ui .

# Run container
docker run -p 3000:3000 training-builder-ui

# With environment variables
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_APP_NAME="Training Builder" \
  training-builder-ui
```

---

## AWS Amplify Deployment

### Steps

1. **Connect Repository**
   - Go to AWS Amplify Console
   - Click "New app" → "Host web app"
   - Connect your GitHub repository

2. **Configure Build**
   - Build command: `npm run build`
   - Base directory: (leave empty)
   - Artifacts: `.next`

3. **Environment Variables**
   Add from `.env.example` in Amplify Console

4. **Deploy**
   - Amplify will auto-deploy on git push

---

## Self-Hosted (VPS/Server)

### Prerequisites
- Ubuntu 20.04+ or similar
- Node.js 18+ installed
- Nginx installed
- Domain name (optional)

### Steps

1. **Install Dependencies**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs nginx
   ```

2. **Clone and Build**
   ```bash
   cd /var/www
   git clone https://github.com/YOUR_USERNAME/training-builder-ui.git
   cd training-builder-ui
   npm install
   npm run build
   ```

3. **Configure PM2 (Process Manager)**
   ```bash
   sudo npm install -g pm2
   pm2 start npm --name "training-builder-ui" -- start
   pm2 save
   pm2 startup
   ```

4. **Configure Nginx**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **Enable and Restart**
   ```bash
   sudo ln -s /etc/nginx/sites-available/training-builder /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. **SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

## Environment Variables

### Required (BYOK Mode)
None - API keys stored client-side

### Optional (Future Backend)
```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_WS_URL=wss://api.your-domain.com

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Pusher
NEXT_PUBLIC_PUSHER_KEY=your-key
NEXT_PUBLIC_PUSHER_CLUSTER=us2
PUSHER_APP_ID=your-app-id
PUSHER_SECRET=your-secret

# AI Providers (Server-side generation)
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-proj-...
GOOGLE_API_KEY=AIza...
```

---

## Performance Optimization

### 1. Enable Caching
```javascript
// next.config.js
module.exports = {
  // ...
  headers: async () => [
    {
      source: '/:all*(svg|jpg|png|woff|woff2)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],
};
```

### 2. Image Optimization
Use Next.js Image component:
```tsx
import Image from 'next/image';

<Image
  src="/logo.png"
  width={200}
  height={50}
  alt="Training Builder"
/>
```

### 3. Enable Compression
Vercel/Netlify handle this automatically. For self-hosted:
```nginx
# In nginx config
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

---

## Monitoring & Analytics

### Vercel Analytics
```bash
npm install @vercel/analytics
```

```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Error Tracking (Sentry)
```bash
npm install @sentry/nextjs
```

```javascript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

---

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Monaco Editor Not Loading
Ensure webpack config in `next.config.js` includes:
```javascript
webpack: (config, { isServer }) => {
  if (!isServer) {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
    };
  }
  return config;
}
```

### Tailwind Styles Not Working
1. Check `tailwind.config.js` content paths
2. Ensure `globals.css` is imported in `layout.tsx`
3. Clear `.next` cache and rebuild

---

## Production Checklist

- [ ] Environment variables configured
- [ ] Build successful locally (`npm run build`)
- [ ] All pages load correctly
- [ ] Mobile responsive tested
- [ ] Error boundaries in place
- [ ] Analytics configured
- [ ] SSL certificate installed
- [ ] Custom domain configured
- [ ] Backup strategy implemented
- [ ] Monitoring/alerts set up

---

## Scaling Considerations

### Horizontal Scaling
- Deploy multiple instances behind load balancer
- Use sticky sessions for WebSocket connections

### Database
- Use managed PostgreSQL (Neon, Supabase, AWS RDS)
- Enable connection pooling
- Set up read replicas for heavy read loads

### CDN
- Serve static assets from CDN
- Use Next.js Image Optimization API
- Cache API responses when possible

---

## Cost Estimates

### Vercel (Hobby)
- **Free tier:** Up to 100GB bandwidth/month
- **Pro:** $20/month - Unlimited bandwidth

### Netlify (Starter)
- **Free tier:** 100GB bandwidth/month
- **Pro:** $19/month - 400GB bandwidth

### AWS Amplify
- **Build minutes:** $0.01/min
- **Hosting:** $0.15/GB stored, $0.15/GB transferred

### Self-Hosted (DigitalOcean)
- **Droplet:** $6-12/month (1-2GB RAM)
- **Database:** $15/month (managed)
- **Total:** ~$20-30/month

---

## Support & Resources

- **Documentation:** /docs
- **GitHub:** github.com/your-repo
- **Issues:** github.com/your-repo/issues
- **Discord:** discord.gg/your-server

---

## License

MIT License - See LICENSE file for details
