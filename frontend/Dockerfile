FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /usr/src/app

FROM base AS deps
COPY package.json ./
RUN  npm install

FROM base AS runner
COPY --from=deps /usr/src/app/node_modules ./node_modules

CMD npm run dev