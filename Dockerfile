FROM node:lts-slim
COPY *.json /
COPY scripts /scripts
RUN mkdir data
RUN npm install
RUN node scripts/deploy-commands.js
RUN node scripts/updateCardJson.js
COPY *.js / 
ENTRYPOINT ["node", "."]

