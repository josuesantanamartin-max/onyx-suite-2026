# 🚀 Guía de Deployment - Onyx Suite

Esta guía te muestra cómo desplegar Onyx Suite en diferentes plataformas.

---

## 📋 Pre-requisitos

1. ✅ Cuenta de GitHub con el repositorio
2. ✅ Variables de entorno configuradas
3. ✅ Build de producción funcional: `npm run build`

---

## 🌟 Opción 1: Vercel (RECOMENDADO)

### Por qué Vercel?
- ✅ Deploy automático desde GitHub
- ✅ Preview URLs para cada commit
- ✅ Edge Network global
- ✅ SSL gratis
- ✅ Optimizado para React/Vite
- ✅ **GRATIS** para proyectos personales

### Pasos:

1. **Crear cuenta en Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Regístrate con tu cuenta de GitHub

2. **Importar proyecto**
   ```
   New Project → Import Git Repository → josuesantanamartin-max/Onyx-Suite
   ```

3. **Configurar variables de entorno**
   ```
   Environment Variables:
   - VITE_GEMINI_API_KEY = tu-api-key
   - VITE_SUPABASE_URL = tu-url
   - VITE_SUPABASE_ANON_KEY = tu-key
   ```

4. **Deploy**
   - Click en "Deploy"
   - ¡Listo! Tu app estará en `onyx-suite.vercel.app`

5. **Dominio personalizado (Opcional)**
   - Settings → Domains → Add
   - Conecta tu dominio (ej: `onyx-suite.com`)

### Deploy automático:
```bash
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main
# Vercel detecta el push y hace deploy automáticamente
```

---

## 🌐 Opción 2: Cloudflare Pages

### Por qué Cloudflare?
- ✅ **GRATIS ilimitado** (sin límites de ancho de banda)
- ✅ Más rápido que Vercel
- ✅ CDN global
- ✅ Functions serverless

### Pasos:

1. **Crear cuenta**
   - [dash.cloudflare.com](https://dash.cloudflare.com)

2. **Conectar GitHub**
   ```
   Pages → Create a project → Connect to Git → Onyx-Suite
   ```

3. **Configuración de build**
   ```
   Framework preset: Vite
   Build command: npm run build
   Build output: dist
   ```

4. **Variables de entorno**
   - Añade las mismas variables que en Vercel

5. **Deploy**
   - URL: `onyx-suite.pages.dev`

---

## 🏠 Opción 3: Hostinger (Manual)

### Por qué Hostinger?
- ✅ Muy económico (€2-4/mes)
- ✅ Email incluido
- ✅ cPanel familiar

### Pasos:

1. **Build local**
   ```bash
   npm run build
   # Genera carpeta /dist
   ```

2. **Subir via FTP**
   - Usa FileZilla o el File Manager de cPanel
   - Sube todo el contenido de `/dist` a `/public_html`

3. **Configurar .htaccess** (para SPA)
   
   Crea archivo `.htaccess` en `/public_html`:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

4. **Variables de entorno en Hostinger**
   - Como Hostinger es estático, las variables VITE_ deben estar en el build
   - Crea `.env.production` localmente con tus keys
   - Haz `npm run build` (Vite las incluirá en el bundle)
   - ⚠️ **CUIDADO**: No expongas keys sensibles en el frontend

### Deploy automático con GitHub Actions:

Crea `.github/workflows/deploy-hostinger.yml`:

```yaml
name: Deploy to Hostinger

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        env:
          VITE_GEMINI_API_KEY: ${{ secrets.VITE_GEMINI_API_KEY }}
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
        run: npm run build
      
      - name: Deploy via FTP
        uses: SamKirkland/FTP-Deploy-Action@4.3.0
        with:
          server: ftp.your-domain.com
          username: ${{ secrets.FTP_USERNAME }}
          password: ${{ secrets.FTP_PASSWORD }}
          local-dir: ./dist/
          server-dir: /public_html/
```

Configura los secrets en GitHub:
```
Settings → Secrets → Actions → New repository secret
- FTP_USERNAME
- FTP_PASSWORD
- VITE_GEMINI_API_KEY
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
```

---

## 🐳 Opción 4: Docker (Avanzado)

### Dockerfile:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

### Deploy:

```bash
# Build imagen
docker build -t onyx-suite .

# Run local
docker run -p 8080:80 onyx-suite

# Deploy a Docker Hub
docker tag onyx-suite your-username/onyx-suite
docker push your-username/onyx-suite
```

---

## 📊 Comparación de Opciones

| Característica | Vercel | Cloudflare | Hostinger | Docker |
|----------------|--------|------------|-----------|--------|
| **Precio** | Gratis / $20 | Gratis | €2-4/mes | Variable |
| **Deploy Auto** | ✅ | ✅ | ⚠️ (con Actions) | ❌ |
| **SSL** | ✅ | ✅ | ✅ | ⚠️ |
| **CDN Global** | ✅ | ✅ | ❌ | ❌ |
| **Dificultad** | Fácil | Fácil | Media | Alta |
| **Serverless** | ✅ | ✅ | ❌ | ⚠️ |
| **Email** | ❌ | ❌ | ✅ | ❌ |

---

## 🎯 Recomendación Final

### Para Desarrollo/Beta:
- **Vercel** (gratis, fácil, rápido)

### Para Producción Económica:
- **Cloudflare Pages** (gratis, ilimitado, rápido)

### Para Negocio con Email:
- **Hostinger** + Cloudflare CDN
- Usa Hostinger para email
- Usa Cloudflare Pages para la app

### Para Proyectos Grandes:
- **Vercel Pro** ($20/mes) + dominio custom

---

## 🔧 Troubleshooting

### Error: "404 al recargar página"
**Solución**: Configura redirect para SPA

**Vercel**: Crear `vercel.json`
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

**Cloudflare**: Automático para Vite

**Hostinger**: Usar `.htaccess` (ver arriba)

### Error: "Variables de entorno no funcionan"
**Solución**: 
- En Vite, las variables DEBEN empezar con `VITE_`
- Se compilan en el build (no son secretas en el frontend)
- Para keys sensibles, usa serverless functions

### Error: "Build falla en producción"
```bash
# Testea el build localmente primero
npm run build
npm run preview
```

---

## 📞 Soporte

¿Necesitas ayuda?
1. Revisa los logs de la plataforma
2. Verifica variables de entorno
3. Prueba build local: `npm run build && npm run preview`

---

**Fecha**: Diciembre 2025  
**Versión**: 1.0.0
