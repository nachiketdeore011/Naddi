#!/usr/bin/env bash
set -euo pipefail

if ! command -v railway >/dev/null 2>&1; then
  echo "Railway CLI is required. Install it from https://docs.railway.com/guides/cli"
  exit 1
fi

if ! railway whoami >/dev/null 2>&1; then
  echo "Log in to Railway first with: railway login"
  exit 1
fi

if ! railway status >/dev/null 2>&1; then
  echo "Link this repository to a Railway project first with: railway link"
  exit 1
fi

echo "Deploying Nadi backend to Railway..."
railway up
echo "Deployment submitted. Check status with: railway logs"
