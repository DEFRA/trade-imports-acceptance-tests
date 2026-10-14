FROM defradigital/node:latest-24

ENV TZ="Europe/London"

USER root

RUN apk update && \
    apk upgrade && \
    apk add --no-cache \
    openjdk17-jre-headless \
    aws-cli

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json

# npm is only needed to install. Removing it drops the vulnerable packages it bundles, which
# package.json overrides can't reach, so entrypoint.sh runs mocha and allure directly.
RUN npm ci --omit=optional && \
    rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

COPY . .

RUN chown -R node:node /app

USER node

ENTRYPOINT [ "./entrypoint.sh" ]
