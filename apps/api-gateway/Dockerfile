# Use the official Node.js 14 image as the base image
FROM node:16

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available) to the working directory
COPY package*.json ./

# Copy the local @common/app-lib package into the Docker image
COPY /../../../packages/app-lib /packages/app-lib

# Update package.json to reference the local @common/app-lib package correctly
RUN sed -i 's|"@common/app-lib": "file:../../../../packages/app-lib"|"@common/app-lib": "file:./packages/app-lib"|' package.json

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run app:build

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "start:prod"]