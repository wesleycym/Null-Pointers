FROM node:18

ENV NODE_ENV=development
ENV PORT=8080

WORKDIR /app

COPY package*.json ./

RUN apt-get update && \
    apt-get install -y libmcrypt-dev && \
    npm install && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY . .

EXPOSE $PORT

CMD ["node", "server.js"]