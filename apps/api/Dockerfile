# Use Node 20 LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend code
COPY . .

# Expose port 8000
EXPOSE 8000

# Start the backend
CMD ["npm", "run", "start:dev"]