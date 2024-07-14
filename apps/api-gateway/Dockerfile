# Stage 1: Prepare the build environment
FROM node:16 as build-env
# Set the working directory
WORKDIR /build
# Copy the entire project into the build environment
COPY ../../ /build
# Set the working directory to the api-gateway directory
WORKDIR /build/apps/api-gateway
# Copy package.json and package-lock.json to the working directory
COPY package*.json ./
# Copy tsconfig.json to the working directory
COPY tsconfig.json ./
# Install dependencies
RUN npm install
# Build the application
RUN npm run app:build
# Stage 2: Create the final image
FROM node:16
# Set the working directory
WORKDIR /usr/src/app

RUN ls -alh /usr/src/app
# Copy the built application from the previous stage
# COPY --from=build-env /build/apps/api-gateway .
COPY --from=build-env /build/apps/api-gateway/dist ./dist
# Expose the port the app runs on
EXPOSE 3000
# Command to run the application
CMD ["npm", "run", "start:prod"]





# # Use the official Node.js 14 image as the base image
# FROM node:16

# # Set the working directory in the container
# WORKDIR /usr/src/app

# # Copy package.json and package-lock.json (if available) to the working directory
# COPY package*.json ./

# # Debugging step to list the contents of the directory
# RUN ls -alh ../../packages/

# # Copy the local @common/app-lib package into the Docker image
# COPY packages/app-lib /packages/app-lib

# # Update package.json to reference the local @common/app-lib package correctly
# RUN sed -i 's|"@common/app-lib": "file:../../../../packages/app-lib"|"@common/app-lib": "file:./packages/app-lib"|' package.json

# # Install dependencies
# RUN npm install

# # Copy the rest of the application code
# COPY . .

# # Build the application
# RUN npm run app:build

# # Expose the port the app runs on
# EXPOSE 3000

# # Command to run the application
# CMD ["npm", "run", "start:prod"]