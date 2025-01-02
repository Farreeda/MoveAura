# Use official Node.js image as the base image
FROM node:14

# Set the working directory
WORKDIR /my-app/

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port that the app will run on
EXPOSE 5000

# Run the application
CMD ["npm", "start"]
