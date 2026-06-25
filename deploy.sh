#!/bin/bash
# BrainRotBattle Deploy Script für Hetzner Server
# Usage: ./deploy.sh

set -e

echo "🧠 BrainRotBattle — Deploying to Hetzner..."

# 1. Pull latest code (falls via Git)
# git pull origin main

# 2. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 3. Build production
echo "🔨 Building production bundle..."
npm run build

# 4. Reload nginx
echo "🔄 Reloading nginx..."
sudo nginx -t && sudo systemctl reload nginx

echo ""
echo "✅ Deployed! Game läuft auf:"
echo "   http://46.4.204.162"
echo "   https://brainrotbattle.io (falls SSL konfiguriert)"
echo ""
