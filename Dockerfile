FROM node:26.5.0-alpine3.24

ENV TZ="Europe/London"

USER root

RUN apk update && \
    apk upgrade && \
    apk add --no-cache \
    openjdk17-jre-headless \
    curl \
    aws-cli

# Upgrade npm, then patch its bundled brace-expansion and tar, which npm
# ships at vulnerable versions (brace-expansion 5.0.7 / tar 7.5.19) that
# cannot be fixed via package.json overrides on a global install.
RUN npm install -g npm@12.0.1 && \
    NPM_NM=$(npm root -g)/npm/node_modules && \
    cd /tmp && \
    npm pack brace-expansion@5.0.8 && npm pack tar@7.5.22 && \
    rm -rf $NPM_NM/brace-expansion $NPM_NM/tar && \
    mkdir $NPM_NM/brace-expansion $NPM_NM/tar && \
    tar xzf brace-expansion-5.0.8.tgz --strip-components=1 -C $NPM_NM/brace-expansion && \
    tar xzf tar-7.5.22.tgz --strip-components=1 -C $NPM_NM/tar && \
    rm brace-expansion-5.0.8.tgz tar-7.5.22.tgz

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
