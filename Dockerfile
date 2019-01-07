FROM node:lts-alpine

RUN apk add docker

WORKDIR /app
COPY . .

RUN yarn install && \
    yarn run build

ENV NAIAD_DISCORD_TOKEN=

CMD ["npm", "start"]
