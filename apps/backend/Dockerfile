# Production image for the Urban Men shop backend (Medusa).
# Used by Google Cloud Run (`gcloud run deploy --source .`) or any host that runs containers. See docs/08-cloud-run.md.
#
# Secrets are NOT baked in: DATABASE_URL, JWT_SECRET and the rest are given to the running container as environment variables.

# ---- build: compile the API and the admin dashboard ----
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx medusa build

# ---- run: only what the server needs ----
FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
# Cloud Run sends traffic to the port in $PORT (8080); Medusa listens on it.
ENV PORT=8080
COPY --from=build /app/.medusa/server ./
RUN npm ci --omit=dev && npm cache clean --force
EXPOSE 8080
# Database changes are applied separately (npx medusa db:migrate from your computer), never on start-up:
# start-up has to be fast, and two instances must not migrate at the same time.
CMD ["npx", "medusa", "start"]
