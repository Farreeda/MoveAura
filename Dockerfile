# Base image with Python and Node.js
FROM python:3.9-slim

# Set the working directory
WORKDIR /app

# Install Node.js
RUN apt-get update && apt-get install -y curl \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean

# Install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Install Node.js dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the project files into the container
COPY . .

# Expose necessary ports (e.g., 5000 for Flask, 3000 for React)
EXPOSE 5000 3000

# Command to run the application (change as needed)
CMD ["bash"]
