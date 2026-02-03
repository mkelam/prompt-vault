#!/bin/bash

# BizPrompt Vault - Hostinger Deployment Script
# Usage: ./deploy.sh

set -e

echo "======================================"
echo "  BizPrompt Vault Deployment Script"
echo "======================================"

# Configuration
REMOTE_USER="root"
REMOTE_HOST="141.136.44.168"
REMOTE_PATH="/var/www/html"
LOCAL_BUILD_DIR="out"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Install dependencies
echo -e "${YELLOW}Step 1: Installing dependencies...${NC}"
npm ci --production=false

# Step 2: Run tests
echo -e "${YELLOW}Step 2: Running tests...${NC}"
npm test -- --passWithNoTests

# Step 3: Build the application
echo -e "${YELLOW}Step 3: Building production bundle...${NC}"
npm run build

# Check if build was successful
if [ ! -d "$LOCAL_BUILD_DIR" ]; then
    echo -e "${RED}Error: Build failed - $LOCAL_BUILD_DIR directory not found${NC}"
    exit 1
fi

echo -e "${GREEN}Build successful!${NC}"

# Step 4: Deploy to Hostinger
echo -e "${YELLOW}Step 4: Deploying to Hostinger...${NC}"
echo "Target: ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}"

# Create backup on remote server
echo "Creating backup of current deployment..."
ssh ${REMOTE_USER}@${REMOTE_HOST} "if [ -d ${REMOTE_PATH}/backup ]; then rm -rf ${REMOTE_PATH}/backup; fi && if [ -d ${REMOTE_PATH}/current ]; then mv ${REMOTE_PATH}/current ${REMOTE_PATH}/backup; fi"

# Upload new build
echo "Uploading new build..."
scp -r ${LOCAL_BUILD_DIR}/* ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/

# Set permissions
echo "Setting permissions..."
ssh ${REMOTE_USER}@${REMOTE_HOST} "chmod -R 755 ${REMOTE_PATH}"

echo -e "${GREEN}======================================"
echo "  Deployment Complete!"
echo "======================================${NC}"
echo ""
echo "Your site should now be live at your domain."
echo "If something went wrong, restore the backup with:"
echo "  ssh ${REMOTE_USER}@${REMOTE_HOST} 'rm -rf ${REMOTE_PATH}/* && mv ${REMOTE_PATH}/backup/* ${REMOTE_PATH}/'"
