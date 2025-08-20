#!/bin/bash

# Vercel Build Script for CareConnect AI Platform
set -e

echo "🚀 Starting Vercel build for CareConnect AI Platform..."

# Install pnpm if not available
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm@8.15.0
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
cd apps/web
pnpm prisma generate
cd ../..

# Build the application
echo "🔨 Building application..."
pnpm run build

echo "✅ Build completed successfully!"
