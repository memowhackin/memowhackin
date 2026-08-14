# Build the static site with Node, then serve it from nginx. The runtime image
# carries no Node, no toolchain and no source — only the compiled bundle.

FROM node:26-slim AS build

WORKDIR /app

# Dependencies first, so a source-only change reuses this layer.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Chromium, for the prerender pass. It is heavy (~150 MB plus apt packages) but
# lives only in this stage — the runtime image below is nginx and the compiled
# bundle, nothing else. Without it the container would serve a client-rendered
# page that crawlers see as empty.
RUN npx playwright install --with-deps chromium

# Where the browser should send API calls.
#
# Empty (the default) means same-origin: the bundle calls /api/..., nginx proxies
# it to the backend, and no cross-origin request is ever made. Override only when
# the API is served from a different host than the site.
#
# Declared after the Chromium layer: a different build-arg must not throw away a
# 150 MB download that does not depend on it.
ARG VITE_CMS_API_URL=""
ENV VITE_CMS_API_URL=$VITE_CMS_API_URL

# Renders every route to real HTML and emits sitemap.xml, the RSS feed and
# robots.txt.
#
# Articles come from the CMS, which is NOT running during an image build —
# compose builds images before it starts any service. The prerender step warns
# and carries on: the marketing pages are prerendered, and the blog renders in
# the browser instead. Readers see it either way; crawlers do not.
#
# To get the blog into the static HTML as well, build with the CMS reachable and
# pass its address, e.g.
#   docker build --build-arg VITE_CMS_API_URL=https://cms.assistsec.nl frontend
# or run `npm run build:static` in CI where the backend is up, which is what the
# static-host deployment does.
RUN npm run build:static


FROM nginx:1.31-alpine AS runtime

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
