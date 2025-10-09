FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose the port
EXPOSE 4000

# Start the server with nodemon for hot-reloading (optional)
# If you want hot-reloading, install nodemon: npm install --save-dev nodemon
# And add to package.json: "scripts": { "dev": "nodemon server.js" }
# Then use: CMD ["npm", "run", "dev"]
# 
# For now, standard node:
CMD ["node", "server.js"]