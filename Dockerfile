FROM node:latest

ENV NODE_ENV development
ENV PORT 8080

WORKDIR /

COPY . .

RUN npm install

CMD [ "node", "server.js" ]

EXPOSE $PORT
