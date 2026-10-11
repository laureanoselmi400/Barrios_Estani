# BARRIO STREET — E-commerce

Tienda online de indumentaria urbana. Next.js 15 (App Router + RSC), Tailwind CSS, Prisma + PostgreSQL, Zustand, Mercado Pago (Checkout Pro) y GO Cuotas.

## Puesta en marcha

```bash
npm install
cp .env.example .env        # completar variables
npx prisma db push          # crea las tablas
npm run db:seed             # productos de ejemplo (opcional)
npm run dev                 # http://localhost:3000
```

Panel admin: `http://localhost:3000/admin` (usa `ADMIN_EMAIL` / `ADMIN_PASSWORD` del `.env`).

### SQLite en local (sin instalar PostgreSQL)
En `prisma/schema.prisma` cambiar `provider = "sqlite"` y en `.env` `DATABASE_URL="file:./dev.db"`.
La búsqueda de texto usa `mode: "insensitive"`, que solo existe en PostgreSQL: en SQLite quitar esa opción en `src/lib/queries.ts`.

## Estructura

```
prisma/            schema.prisma, seed.ts
src/
  middleware.ts    protege /admin y /api/admin (JWT en cookie httpOnly)
  store/cart.ts    carrito (Zustand + localStorage)
  lib/             auth, prisma, queries, mercadopago, gocuotas, whatsapp, format, constants
  components/      Navbar, ProductCard, FilterSidebar, CartDrawer, WhatsAppButton, Footer, ...
  app/
    (shop)/        /, /productos, /productos/[slug], /nosotros, /contacto, /checkout, /checkout/resultado
    admin/         login + panel (ABM de productos)
    api/           checkout, webhooks (mercadopago, gocuotas), products/[id]/view, admin/upload
```

## Pagos

**Mercado Pago**: crear una aplicación en https://www.mercadopago.com.ar/developers, copiar el *Access Token* a `MP_ACCESS_TOKEN` y configurar el webhook `https://TU-DOMINIO/api/webhooks/mercadopago` (evento *Pagos*); copiar la clave secreta a `MP_WEBHOOK_SECRET`. Con `localhost` el pago funciona pero el webhook no llega (usar un túnel tipo ngrok).

**GO Cuotas**: pedir credenciales al comercio (sandbox/producción) y completarlas en `GOCUOTAS_*`. Los campos exactos del request y la verificación del webhook deben validarse contra la documentación que GO Cuotas entrega al dar de alta el comercio (`src/lib/gocuotas.ts` y `src/app/api/webhooks/gocuotas/route.ts`).

Los precios se recalculan siempre en el servidor desde la base de datos; el cliente nunca define el monto.

## Despliegue en Vercel (Neon + Cloudinary)

### 1. Base de datos en Neon
1. Crear un proyecto en https://neon.tech y copiar las dos connection strings:
   - **Pooled** → `DATABASE_URL` (la app la usa desde funciones serverless).
   - **Direct** → `DIRECT_URL` (la usan las migraciones de Prisma).
2. Con esas URLs en el entorno local, crear las tablas y cargar datos:
   ```bash
   npx prisma db push     # crea las tablas en Neon
   npm run db:seed        # productos de ejemplo (opcional)
   ```

### 2. Imágenes en Cloudinary
1. Crear una cuenta en https://cloudinary.com y copiar `API Key`, `API Secret` y `Cloud Name`
   (Dashboard > API Keys). Completar `CLOUDINARY_*` en `.env`.
2. Migrar las fotos que ya están en el repo y actualizar la base:
   ```bash
   npm run images:migrate
   ```
   Sube `public/uploads/*` (y reemplaza `/uploads/xxx` en `ProductImage` por la URL de
   Cloudinary) y además sube las fotos de `Documentación/fotos ropa` y `Documentación/Logos`,
   imprimiendo sus URLs para asignarlas a los productos desde el panel admin.

### 3. Vercel
1. Subir el repo a GitHub e importarlo en https://vercel.com (framework detectado: Next.js).
2. En *Settings > Environment Variables* cargar todas las variables del `.env`:
   `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SITE_URL` (dominio final), `ADMIN_EMAIL`,
   `ADMIN_PASSWORD`, `AUTH_SECRET`, `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`,
   `GOCUOTAS_*`, `NEXT_PUBLIC_WHATSAPP_NUMBER` y las `CLOUDINARY_*`.
3. Deploy. El comando de build ya ejecuta `prisma generate` (también en `postinstall`).
4. Actualizar en Mercado Pago / GO Cuotas los webhooks a `https://TU-DOMINIO/api/webhooks/...`.

## Antes de publicar

- Reemplazar imágenes de ejemplo (picsum) por fotos reales, y completar `SITE` en `src/lib/constants.ts` (dirección, teléfono, horarios), el número de WhatsApp y el texto de `/nosotros`.
- Subida de imágenes: las imágenes se guardan en **Cloudinary** (`src/app/api/admin/upload/route.ts`). Configurar `CLOUDINARY_*` y correr `npm run images:migrate` una vez para subir las fotos existentes.
- Usar una `ADMIN_PASSWORD` fuerte y un `AUTH_SECRET` aleatorio (`openssl rand -base64 32`).
- El stock no está modelado (solo talles disponibles); si se necesita, agregar `stock` por talle en `ProductSize`.
