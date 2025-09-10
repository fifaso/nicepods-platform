#!/bin/bash
set -e

echo ">>> Iniciando script de post-creación del Codespace..."

# Verifica que los secretos existen antes de intentar usarlos.
if [ -z "$SUPABASE_AUTH_JWT_SECRET" ] || [ -z "$GOOGLE_CLIENT_ID" ] || [ -z "$GOOGLE_CLIENT_SECRET" ]; then
  echo ">>> ERROR: Uno o más secretos (SUPABASE_AUTH_JWT_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET) no están definidos en los Secretos de Codespaces de GitHub."
  exit 1
fi

# Crea el archivo supabase/.env con los secretos inyectados por el devcontainer.
echo ">>> Creando archivo supabase/.env..."
echo "SUPABASE_AUTH_JWT_SECRET=\"$SUPABASE_AUTH_JWT_SECRET\"
GOOGLE_CLIENT_ID=\"$GOOGLE_CLIENT_ID\"
GOOGLE_CLIENT_SECRET=\"$GOOGLE_CLIENT_SECRET\"" > supabase/.env

echo ">>> Archivo supabase/.env creado con éxito."
echo ">>> El entorno está listo para 'supabase start'."