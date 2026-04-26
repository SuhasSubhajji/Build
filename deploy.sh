#!/bin/bash

# Ensure the script is run as root (or with sudo privileges)
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root or with sudo" 
   exit 1
fi

export DEBIAN_FRONTEND=noninteractive

DOMAIN="subhajjisuhas.me"
EMAIL="suhas4341@gmail.com"
APP_DIR="/opt/sutra-app"

# 1. Install Docker and Docker Compose
echo "Installing Docker and Docker Compose..."

# Update package index
apt-get update

# Install required dependencies
apt-get install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker's official GPG key and repository
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" -y

# Install Docker
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose (latest version)
curl -L "https://github.com/docker/compose/releases/download/$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep -Po '"tag_name": "\K.*?(?=")')/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version

# 2. Install Nginx and Certbot for SSL
echo "Installing NGINX and Certbot for SSL..."

apt-get install -y nginx
apt-get install -y certbot python3-certbot-nginx

# Start and enable NGINX
systemctl start nginx
systemctl enable nginx

# 3. Create directories for App setup
echo "Setting up directories for the Application..."

mkdir -p $APP_DIR

# Copy the current directory contents (the app) to the deployment directory
echo "Copying application files to $APP_DIR..."
cp -r ./* $APP_DIR/
cd $APP_DIR

# 4. Create Dockerfile
echo "Creating Dockerfile..."

cat <<EOF > Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for the build step)
RUN npm install

# Copy application code
COPY . .

# Build the frontend (Vite)
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the Node.js server
CMD ["npx", "tsx", "server.ts"]
EOF

# 5. Docker Compose Setup for the App
echo "Creating Docker Compose configuration..."

cat <<EOF > docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    container_name: sutra-app
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      # - GEMINI_API_KEY=your_api_key_here # Uncomment and add your API key if needed
    restart: always
    networks:
      - app_network

networks:
  app_network:
    driver: bridge
EOF

# 6. Set up Nginx as Reverse Proxy
echo "Setting up NGINX reverse proxy..."

cat <<EOF > /etc/nginx/sites-available/sutra-app
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Port \$server_port;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/sutra-app /etc/nginx/sites-enabled/
# Remove default nginx config to avoid conflicts
rm -f /etc/nginx/sites-enabled/default

# Test NGINX configuration
nginx -t

# Reload NGINX
systemctl reload nginx

# 7. Obtain SSL certificate from Let's Encrypt using Certbot
echo "Obtaining SSL certificate from Let's Encrypt..."

certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m $EMAIL || echo "WARNING: Certbot failed (likely DNS not propagated). Skipping SSL. Site available on HTTP."

# 8. Restart NGINX to apply SSL
echo "Restarting NGINX..."
systemctl restart nginx

# 9. Run the App using Docker Compose
echo "Building and starting the application with Docker Compose..."

docker-compose up -d --build

echo "Setup Complete. You should be able to access your app at https://$DOMAIN"
