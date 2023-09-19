# Backend Dockerfile

FROM node:18.17.1

WORKDIR /app/backend

COPY package.json package-lock.json ./

RUN npm install
RUN npm install -g typescript

COPY . .

RUN tsc

EXPOSE 3031

CMD ["npm", "start"]
