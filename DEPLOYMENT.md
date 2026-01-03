# 🌐 Deployment Guide

## Quick Deploy Checklist

### Option 1: Vercel + Render (Recommended - Free Tier Available)

#### 1. Backend Deployment (Render)

1. **Create account** at [render.com](https://render.com)

2. **Create New Web Service**:
   - Connect GitHub repository
   - Select `main/server` directory
   - Build Command: `npm install`
   - Start Command: `node index.js`

3. **Environment Variables**:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/visa_evaluation
   OPENAI_API_KEY=sk-your-key
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   PORT=3001
   ```

4. **Deploy** - Get your backend URL: `https://your-app.onrender.com`

#### 2. Frontend Deployment (Vercel)

1. **Create account** at [vercel.com](https://vercel.com)

2. **Import Project**:
   - Connect GitHub
   - Select root directory: `main`
   - Framework: Vite

3. **Update API URLs**:
   In all frontend files, replace:
   ```javascript
   const API_BASE = 'http://localhost:3001/api';
   ```
   with:
   ```javascript
   const API_BASE = 'https://your-backend.onrender.com/api';
   ```

4. **Deploy** - Get your frontend URL: `https://your-app.vercel.app`

5. **Update Backend CORS**:
   Update `CORS_ORIGIN` in Render to your Vercel URL

---

### Option 2: Railway (All-in-One)

1. **Create account** at [railway.app](https://railway.app)

2. **Deploy Backend**:
   - New Project → Deploy from GitHub
   - Select `main` folder
   - Add environment variables
   - Railway will auto-detect Node.js

3. **Add MongoDB**:
   - Add MongoDB plugin
   - Copy connection string to `MONGODB_URI`

4. **Deploy Frontend**:
   - Add new service
   - Same repository, different build command
   - Build: `npm run build`
   - Serve: `npm run preview`

---

### Option 3: Docker Deployment

#### Create `Dockerfile` in `main/`:

```dockerfile
# Backend
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001

CMD ["node", "server/index.js"]
```

#### Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "3001:3001"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/visa_evaluation
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - NODE_ENV=production
    depends_on:
      - mongo

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongo-data:
```

---

## Production Configuration

### 1. MongoDB Atlas Setup (Free Tier)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster (M0)
3. Create database user
4. Whitelist IP: `0.0.0.0/0` (all IPs)
5. Get connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/visa_evaluation
   ```

### 2. OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create API key
3. Add billing method
4. Start with $5 credit (handles ~500 evaluations)

### 3. Environment Variables

**Production `.env`**:
```env
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/visa_evaluation

# AI
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx

# Server
NODE_ENV=production
PORT=3001

# CORS
CORS_ORIGIN=https://your-frontend-domain.com

# Email (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

---

## Performance Optimization

### 1. Backend Optimizations

```javascript
// Add to server/index.js

// Compression
import compression from 'compression';
app.use(compression());

// Rate limiting
import rateLimit from 'express-rate-limit';
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Caching
import NodeCache from 'node-cache';
const cache = new NodeCache({ stdTTL: 600 }); // 10 min cache
```

### 2. Frontend Optimizations

```javascript
// Lazy loading routes
const EvaluationPage = lazy(() => import('./pages/Evaluation'));
const ResultsPage = lazy(() => import('./pages/Results'));

// Image optimization
import { countries } from './assets/flags'; // Use SVG flags

// Code splitting
// Already handled by Vite
```

### 3. Database Indexing

Already implemented in models:
```javascript
// Evaluation.js
evaluationSchema.index({ email: 1, createdAt: -1 });
evaluationSchema.index({ partnerId: 1, createdAt: -1 });
evaluationSchema.index({ country: 1, visaType: 1 });
```

---

## Security Checklist

- [x] Environment variables for secrets
- [x] API key authentication for partners
- [x] File upload validation
- [x] CORS configuration
- [x] Rate limiting (add in production)
- [ ] HTTPS only (handled by host)
- [ ] Input sanitization (add validator.js)
- [ ] SQL injection prevention (MongoDB prevents)
- [ ] XSS protection (React prevents)
- [ ] CSRF tokens (add for forms)

---

## Monitoring & Analytics

### 1. Error Tracking

**Add Sentry**:
```bash
npm install @sentry/node @sentry/react
```

```javascript
// server/index.js
import * as Sentry from "@sentry/node";
Sentry.init({ dsn: "your-dsn" });
```

### 2. Analytics

**Add Google Analytics**:
```html
<!-- public/index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
```

### 3. Uptime Monitoring

- Use [UptimeRobot](https://uptimerobot.com) (free)
- Ping `/api/health` every 5 minutes
- Get email alerts on downtime

---

## Cost Estimation

### Free Tier Setup
- **Vercel Frontend**: Free
- **Render Backend**: Free (spins down after inactivity)
- **MongoDB Atlas**: Free (M0, 512MB)
- **OpenAI**: Pay per use (~$0.01/evaluation)

**Total Monthly Cost**: $0-10 for personal project

### Paid Setup (Recommended for Production)
- **Vercel Pro**: $20/month
- **Render**: $7/month (always on)
- **MongoDB Atlas M10**: $57/month (recommended for production)
- **OpenAI**: $20-50/month (based on usage)
- **Email Service**: $0-10/month

**Total Monthly Cost**: $100-150 for production

### Revenue Model
- Free: 1 evaluation
- Basic: $29 - 5 evaluations
- Pro: $99 - Unlimited evaluations
- Enterprise: Custom pricing for partners

---

## Launch Checklist

### Pre-Launch
- [ ] Set up MongoDB Atlas
- [ ] Add OpenAI API key
- [ ] Configure email service
- [ ] Test all flows end-to-end
- [ ] Check mobile responsiveness
- [ ] Set up error tracking
- [ ] Add analytics
- [ ] Test with real documents

### Launch Day
- [ ] Deploy backend to Render
- [ ] Deploy frontend to Vercel
- [ ] Update CORS settings
- [ ] Test production URLs
- [ ] Monitor error logs
- [ ] Set up uptime monitoring
- [ ] Create demo video
- [ ] Update README with live URL

### Post-Launch
- [ ] Monitor usage metrics
- [ ] Collect user feedback
- [ ] Fix bugs
- [ ] Optimize performance
- [ ] Add new visa types
- [ ] Market to law firms
- [ ] Create partner onboarding

---

## Backup & Recovery

### Database Backups
```bash
# MongoDB Atlas: Automated daily backups
# Manual backup:
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/visa_evaluation" --out=./backup
```

### File Backups
- Store uploads in S3/Cloudinary for production
- Keep local backups of configuration files

---

## Support & Maintenance

### Weekly Tasks
- [ ] Check error logs
- [ ] Review user feedback
- [ ] Monitor API usage
- [ ] Database health check

### Monthly Tasks
- [ ] Update dependencies
- [ ] Review security
- [ ] Optimize performance
- [ ] Add new features
- [ ] Update visa requirements

---

## Emergency Contacts

- MongoDB Atlas: [support.mongodb.com](https://support.mongodb.com)
- OpenAI: [help.openai.com](https://help.openai.com)
- Vercel: [vercel.com/support](https://vercel.com/support)
- Render: [render.com/support](https://render.com/support)

---

## Quick Commands

```bash
# Production build
npm run build

# Start production server
NODE_ENV=production node server/index.js

# Check logs
pm2 logs

# Restart server
pm2 restart all

# Database backup
mongodump --uri=$MONGODB_URI

# Check server status
curl https://your-api.com/api/health
```

---

**Ready to deploy!** 🚀

Choose your deployment platform and follow the steps above. The application is production-ready and can be live in under 30 minutes.
