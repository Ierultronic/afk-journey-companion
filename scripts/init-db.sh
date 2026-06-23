#!/bin/bash
# Initialize the database schema on Supabase
# Usage: SUPABASE_URL=... SUPABASE_SERVICE_KEY=... ./scripts/init-db.sh

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
  echo "Missing SUPABASE_URL or SUPABASE_SERVICE_KEY"
  exit 1
fi

SQL=$(cat supabase/migrations/001_initial.sql)

curl -s -X POST "${SUPABASE_URL}/rest/v1/rpc/" \
  -H "apikey: ${SUPABASE_SERVICE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(echo "$SQL" | jq -Rs .)}" \
  || echo "Run the SQL manually in Supabase SQL editor."
