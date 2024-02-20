# ---- Base Node ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --verbose
COPY . .
RUN npm run build

# ---- Release ----
FROM node:20 AS release
WORKDIR /app
COPY --from=build /app ./
COPY ./global-bundle.pem /app/global-bundle.pem
EXPOSE 80
CMD [ "node", "./dist/server.js" ]