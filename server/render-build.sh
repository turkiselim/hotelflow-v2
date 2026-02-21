#!/usr/bin/env bash
set -e

echo "📦 Installing dependencies..."
npm install

echo "🗄️  Running Prisma migration..."
npx prisma migrate deploy

echo "🌱 Seeding database..."
npm run db:seed

echo "✅ Build complete!"