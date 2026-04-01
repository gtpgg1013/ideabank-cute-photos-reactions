FROM node:22-alpine

WORKDIR /app

COPY package.json ./
COPY server.js ./
COPY src ./src
COPY public ./public
COPY tests ./tests
COPY README.md ./
COPY .service-info.json ./

RUN mkdir -p data

ENV PORT=3200
ENV ACCESS_PASSWORD=ideabank2026

EXPOSE 3200

CMD ["node", "server.js"]
