#!/bin/sh
set -e

echo "Aplicando migrations do banco de dados..."
npx prisma migrate deploy

if [ -n "$ADMIN_EMAIL" ] && [ -n "$ADMIN_PASSWORD" ]; then
  echo "Garantindo usuário admin..."
  npx prisma db seed || true
fi

exec "$@"
