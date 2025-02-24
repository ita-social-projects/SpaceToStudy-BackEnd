FROM node:lts-alpine3.20
ARG MONGODB_URL
WORKDIR /app
COPY package.json .
# TODO change to npm ci, need a valid package-lock.json
RUN npm install
COPY . .
EXPOSE 8080
ENV MONGODB_URL=$MONGODB_URL
ENV SERVER_PORT=8080
CMD ["npm", "start"]