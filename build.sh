#!/bin/bash

# CareConnect AI Platform Build Script for Vercel
set -e

echo "🚀 Starting CareConnect AI Platform build..."

# Ensure we're in the root directory
cd /vercel/path0

# Install dependencies (already done by Vercel)
echo "📦 Dependencies already installed"

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
cd apps/web
npx prisma generate --schema=../../prisma/schema.prisma
cd ../..

# Build the web application
echo "🔨 Building web application..."
cd apps/web
pnpm run build

echo "✅ Build completed successfully!"
