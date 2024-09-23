# Dockerfile for React frontend

# Use the official Node.js image as the base image
FROM node:16 AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Set environment variable for the API URL
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build

# Use a lightweight server to serve the app
FROM node:16

# Install serve to serve the static files
RUN npm install -g serve

# Set the working directory
WORKDIR /app

# Copy the build output from the previous stage
COPY --from=build /app/build .

# Expose port 3000
EXPOSE 30000

# Start the server
CMD ["serve", "-s", ".", "-l", "30000"]
