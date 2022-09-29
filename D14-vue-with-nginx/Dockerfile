FROM node:lts-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build


FROM nginx

WORKDIR /app
COPY conf.d/* /etc/nginx/conf.d/

COPY --from=0 /app/dist ./dist/

