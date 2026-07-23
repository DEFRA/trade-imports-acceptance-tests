FROM node:26.5.0-alpine3.24

ENV TZ="Europe/London"

USER root

RUN apk update && \
    apk upgrade && \
    apk add --no-cache \
    openjdk17-jre-headless \
    curl \
    aws-cli

# Upgrade npm to fix vulnerabilities in bundled tar and brace-expansion
RUN npm install -g npm@12.0.1

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json

# esbuild has multiple vulnerabilities, unfixed
RUN npm install --omit=optional && \
   rm -f node_modules/esbuild/bin/esbuild && \
   rm -f node_modules/esbuild/lib/downloaded-* && \
   rm -rf node_modules/@esbuild

COPY . .

ENTRYPOINT [ "./entrypoint.sh" ]
