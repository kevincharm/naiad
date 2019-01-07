FROM node:lts-alpine

WORKDIR /app
COPY . .

RUN yarn install && \
    yarn run build

ENV NAIAD_DISCORD_TOKEN=

CMD ["npm", "start"]
