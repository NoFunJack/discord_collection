FROM node:buster
ARG DISCORD_TOKEN
ENV DISCORD_TOKEN ${DISCORD_TOKEN}
ARG GUILD_ID
ENV GUILD_ID ${GUILD_ID}
ARG CLIENT_ID
ENV CLIENT_ID ${CLIENT_ID}
run mkdir /app
COPY package.json /app
COPY scripts /app/scripts
RUN npm install --prefix app
COPY build /app
RUN mkdir /app/data
RUN node /app/scripts/deploy-commands.js
#RUN node scripts/updateCardJson.js /app/data
ENTRYPOINT ["node","--es-module-specifier-resolution=node", "app/index.js"]

