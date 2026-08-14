# Build in one stage, ship the compiled output plus production dependencies in
# another, so the runtime image carries no TypeScript toolchain and no source.

FROM node:26-slim AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build


FROM node:26-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production

# Production dependencies only. This is also what keeps the dev-only esbuild
# advisories out of the shipped image — drizzle-kit and tsx never land here.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Only the application and its admin scripts. `npm run build` compiles against
# tsconfig.build.json, which leaves out the test suite and the dev tool configs —
# an integration test that boots the app and deletes rows has no business sitting
# in a production image.
COPY --from=build /app/dist/src ./dist/src
COPY --from=build /app/dist/scripts ./dist/scripts
# Migrations are plain SQL applied by `npm run db:migrate:prod`, so they have to
# travel with the image.
COPY --from=build /app/drizzle ./drizzle

# Uploaded images live here. Mount a volume over it — a container rebuild must
# not take the blog's images with it. Owned by `node` because the process writes
# to it as that user.
RUN mkdir -p /app/uploads/blog && chown -R node:node /app/uploads

# Never run as root. If an upload ever escapes the image pipeline, it lands as
# an unprivileged user with nothing to escalate to.
USER node

EXPOSE 8001

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:8001/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/src/index.js"]
