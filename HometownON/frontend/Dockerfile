# Stage 1: Build the React Native web application
FROM node:20-alpine AS build

WORKDIR /app

# Install Expo CLI
RUN npm install -g expo-cli

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the web application
# This command bundles the app for web and outputs to /app/web-build
RUN npx expo export:web

# Stage 2: Serve the static files with Nginx
FROM nginx:1.25-alpine

# Copy the built files from the build stage
COPY --from=build /app/web-build /usr/share/nginx/html

# Copy a custom Nginx configuration if needed, otherwise use default
# For a Single Page Application (SPA), we need to redirect all paths to index.html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for Nginx
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
