# =============================================================================
# zero-waste-frontend — production image
# Multi-stage: build SPA with Vite, serve static files via nginx.
#
# Build-time env (passed via --build-arg or compose `args:`):
#   VITE_API_URL, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY,
#   VITE_GOOGLE_MAPS_API_KEY, VITE_VAPID_PUBLIC_KEY
# =============================================================================

# ---------- 1. Build ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Install deps in their own layer for fast cached rebuilds.
COPY package.json package-lock.json* ./
RUN npm ci

# Vite reads `VITE_*` at build time. We accept them as ARGs and re-expose as
# ENVs so the SPA bundle is baked with the right values per environment.
ARG VITE_API_URL
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_GOOGLE_MAPS_API_KEY
ARG VITE_VAPID_PUBLIC_KEY
ENV VITE_API_URL=${VITE_API_URL} \
    VITE_SUPABASE_URL=${VITE_SUPABASE_URL} \
    VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY} \
    VITE_GOOGLE_MAPS_API_KEY=${VITE_GOOGLE_MAPS_API_KEY} \
    VITE_VAPID_PUBLIC_KEY=${VITE_VAPID_PUBLIC_KEY}

COPY . .
RUN npm run build

# ---------- 2. Serve ----------
FROM nginx:1.27-alpine AS runtime
RUN apk add --no-cache wget

# Replace the default site with our SPA config (try_files → index.html etc.)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the compiled assets
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:80/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
