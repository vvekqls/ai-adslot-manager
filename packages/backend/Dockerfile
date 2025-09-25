FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

RUN npm install && npm run build

EXPOSE 4000

CMD ["npm", "run", "start"]
