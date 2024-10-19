FROM node:22-slim

WORKDIR /asset

RUN mkdir -p ./node_modules

WORKDIR /src

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build -- --outdir='/asset' && node scripts/copy-package /asset sharp


