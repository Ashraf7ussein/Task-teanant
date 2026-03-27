# Use Node 20 LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy frontend code
COPY . .

# Expose port 3000
EXPOSE 3000

# Start frontend dev server
CMD ["npm", "run", "dev"]