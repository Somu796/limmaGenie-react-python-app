# 1. Use a lightweight Node.js image (LTS version)
FROM node:20-alpine

# 2. Set the working directory
WORKDIR /app

# 3. Copy dependency files first
# This optimizes the build by only re-running 'npm install' if these files change
COPY package*.json ./

# 4. Install dependencies 
# Note: This happens inside the container's own Linux environment
RUN npm install

# 5. Copy the rest of your project files
# (Remember: .dockerignore will filter out node_modules, dist, and .env)
COPY . .

# 6. Expose the port Vite runs on
EXPOSE 5173

# 7. Start the development server
# The --host flag is CRITICAL to allow Windows to access the container's network
CMD ["npm", "run", "dev", "--", "--host"]