FROM node:12.16.0-alpine
WORKDIR /app
COPY ./package*.json ./
COPY ./yarn.lock ./

RUN npm i -g yarn
RUN yarn

COPY . .
CMD ["npm", "run", "start"]