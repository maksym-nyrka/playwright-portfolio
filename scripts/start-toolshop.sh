#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE=(docker compose -p playwright-ci -f "$ROOT_DIR/docker-compose.ci.yml")

export SPRINT="${SPRINT:-sprint5}"
LOG_PID=""

cleanup() {
  if [ -n "$LOG_PID" ]; then
    kill "$LOG_PID" >/dev/null 2>&1 || true
  fi
  echo "Stopping local Toolshop stack..."
  "${COMPOSE[@]}" down -v --remove-orphans >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

echo "Starting local Toolshop stack..."
"${COMPOSE[@]}" up -d --pull missing

# Stream API logs into Playwright's webServer output so failures are visible.
"${COMPOSE[@]}" logs -f --no-color laravel-api &
LOG_PID=$!

echo "Waiting for MariaDB..."
mariadb_ready=false
for _ in $(seq 1 60); do
  if "${COMPOSE[@]}" exec -T mariadb mysqladmin ping -h localhost -u root -proot --silent >/dev/null 2>&1; then
    mariadb_ready=true
    break
  fi
  sleep 2
done
if [ "$mariadb_ready" != true ]; then
  echo "MariaDB did not become ready"
  "${COMPOSE[@]}" logs --tail=200
  exit 1
fi

echo "Seeding database..."
seed_ok=false
for _ in $(seq 1 5); do
  if "${COMPOSE[@]}" exec -T laravel-api php artisan migrate:refresh --seed --force; then
    seed_ok=true
    break
  fi
  sleep 5
done
if [ "$seed_ok" != true ]; then
  echo "Database seeding failed"
  "${COMPOSE[@]}" logs --tail=200
  exit 1
fi

echo "Waiting for API..."
api_ready=false
for _ in $(seq 1 90); do
  if curl -fsS http://localhost:8091/status >/dev/null 2>&1; then
    api_ready=true
    break
  fi
  sleep 2
done
if [ "$api_ready" != true ]; then
  echo "Toolshop API did not become ready"
  "${COMPOSE[@]}" logs --tail=200
  exit 1
fi

echo "Waiting for Angular UI..."
ui_ready=false
for _ in $(seq 1 120); do
  status="$(curl -s -o /dev/null -w '%{http_code}' http://localhost:4200 || true)"
  if [ "$status" = "200" ]; then
    ui_ready=true
    break
  fi
  sleep 2
done
if [ "$ui_ready" != true ]; then
  echo "Angular UI did not become ready"
  "${COMPOSE[@]}" logs --tail=200
  exit 1
fi

echo "Local Toolshop is ready on http://localhost:4200"

# Keep the process alive so Playwright's webServer does not consider it exited.
while true; do
  sleep 3600
done
