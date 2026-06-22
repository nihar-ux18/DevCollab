#!/bin/bash

echo "Deploying DevCollab..."

# Install dependencies
echo "Installing dependencies..."
npm run install:all

# Build frontend
echo "Building frontend..."
npm run build

# Start production server
echo "Starting production server..."
npm start