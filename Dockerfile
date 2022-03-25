FROM node:lts-slim
ARG DISCORD_TOKEN
ENV DISCORD_TOKEN ${DISCORD_TOKEN}
ARG GUILD_ID
ENV GUILD_ID ${GUILD_ID}
ARG CLIENT_ID
ENV CLIENT_ID ${CLIENT_ID}
COPY *.json /
COPY scripts /scripts
RUN mkdir data
RUN npm install
RUN node scripts/deploy-commands.js
RUN node scripts/updateCardJson.js
COPY *.js / 
COPY modules modules
ENTRYPOINT ["node", "."]

