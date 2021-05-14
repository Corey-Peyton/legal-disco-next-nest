FROM node:12.13-alpine

RUN apk add --no-cache --virtual .gyp \
        python \
        make \
        g++ \
    && npm install \
    && apk del .gyp

WORKDIR /

COPY package.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 3100

CMD node dist/server/main.js