# Deploy VipuDevAI Studio on Render

## Quick Deployment Steps

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "VipuDevAI Studio"
git branch -M main
git remote add origin https://github.com/yourusername/vipudevai-studio.git
git push -u origin main
```

### 2. Create Neon Database

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project
3. Copy your connection string:
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### 3. Deploy on Render

1. Go to [render.com](https://render.com) and sign up with GitHub
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `vipudevai-studio` |
| **Environment** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start` |
| **Plan** | `Free` |

### 4. Set Environment Variables

In Render dashboard → **Environment** tab, add:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Your Neon connection string |
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_PASSWORD` | `admin123` |
| `NODE_ENV` | `production` |

### 5. Initialize Database

After first deploy, run the database migration:
- In Render Shell or locally with Neon URL:
```bash
npm run db:push
```

Or run this SQL in Neon SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(36) PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  language TEXT DEFAULT 'javascript',
  code TEXT,
  status TEXT DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS code_executions (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL,
  language TEXT NOT NULL,
  output TEXT,
  status TEXT DEFAULT 'pending',
  executed_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_config (
  id SERIAL PRIMARY KEY,
  theme TEXT DEFAULT 'dark',
  editor_font_size INTEGER DEFAULT 14,
  auto_save BOOLEAN DEFAULT true
);
```

### 6. Access Your App

Your app will be live at:
```
https://vipudevai-studio.onrender.com
```

Login with:
- **Username**: admin
- **Password**: admin123

---

## Notes

- **Free tier**: App may spin down after 15 min of inactivity (first request takes ~30s to wake)
- **Auto-deploy**: Pushes to `main` branch trigger automatic redeploys
- **Custom domain**: Add in Render Settings → Custom Domains
