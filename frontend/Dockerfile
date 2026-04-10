FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Expose port 3000
EXPOSE 3000

# Start the app in development mode with hot reload
CMD ["npm", "start"]
