#!/usr/bin/env bash
set -e

echo "📦 Installing dependencies..."
npm install

echo "🔧 Generating Prisma Client..."
npx prisma generate

echo "🗄️  Running Prisma migration..."
npx prisma migrate deploy

echo "🌱 Seeding database..."
npm run db:seed

echo "✅ Build complete!"