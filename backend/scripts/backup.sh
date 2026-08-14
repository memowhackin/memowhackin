#!/usr/bin/env bash
#
# Dump the CMS: the database and the uploaded images, which are the two things
# that exist nowhere else. Post bodies live only in Postgres, and the files
# under uploads/blog/ are the only copy of every image ever added to an article.
#
#   ./scripts/backup.sh                  # writes to ./backups
#   BACKUP_DIR=/mnt/backups ./scripts/backup.sh
#
# Reads backend/.env for the connection settings, so it needs no arguments and
# no password on the command line. Restore instructions are in README.md.
set -euo pipefail

cd "$(dirname "$0")/.."

if [[ ! -f .env ]]; then
  echo "no backend/.env — nothing to read connection settings from" >&2
  exit 1
fi

# Read the values without executing the file: a .env is data, and sourcing it
# would run whatever a stray backtick happens to contain.
get() {
  local line
  line=$(grep -E "^$1=" .env | tail -1 || true)
  line=${line#*=}
  # Strip surrounding quotes, which dotenv accepts and psql does not.
  line=${line%\"}; line=${line#\"}
  line=${line%\'}; line=${line#\'}
  printf '%s' "$line"
}

DB_HOST=$(get DB_HOST); DB_PORT=$(get DB_PORT); DB_NAME=$(get DB_NAME)
DB_USER=$(get DB_USER); DB_PASSWORD=$(get DB_PASSWORD)
: "${DB_PORT:=5432}"

if [[ -z "$DB_NAME" || -z "$DB_USER" ]]; then
  echo "DB_NAME or DB_USER missing from .env" >&2
  exit 1
fi

# Said plainly, because "command not found" halfway through a backup run reads
# like the backup partly worked.
for tool in pg_dump pg_restore; do
  if ! command -v "$tool" > /dev/null; then
    echo "$tool not found — install the Postgres client tools:" >&2
    echo "  apt install postgresql-client   # or: brew install libpq" >&2
    exit 1
  fi
done

BACKUP_DIR=${BACKUP_DIR:-./backups}
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
mkdir -p "$BACKUP_DIR"

DUMP="$BACKUP_DIR/$DB_NAME-$STAMP.dump"
UPLOADS="$BACKUP_DIR/uploads-$STAMP.tar.gz"

# -Fc is the custom format: compressed, and restorable table by table.
PGPASSWORD="$DB_PASSWORD" pg_dump \
  --host="$DB_HOST" --port="$DB_PORT" \
  --username="$DB_USER" --dbname="$DB_NAME" \
  --format=custom --file="$DUMP"

UPLOAD_DIR=$(get UPLOAD_DIR)
: "${UPLOAD_DIR:=./uploads/blog}"
if [[ -d "$UPLOAD_DIR" ]]; then
  tar -czf "$UPLOADS" -C "$(dirname "$UPLOAD_DIR")" "$(basename "$UPLOAD_DIR")"
else
  echo "note: $UPLOAD_DIR does not exist, skipping images" >&2
fi

# A dump that restores nothing is worse than no dump, because it is trusted.
# pg_restore --list fails on a truncated or corrupt file.
pg_restore --list "$DUMP" > /dev/null

printf 'database: %s (%s)\n' "$DUMP" "$(du -h "$DUMP" | cut -f1)"
[[ -f "$UPLOADS" ]] && printf 'images:   %s (%s)\n' "$UPLOADS" "$(du -h "$UPLOADS" | cut -f1)"

# Keep the last 14 of each, so an unattended cron cannot fill the disk.
ls -1t "$BACKUP_DIR"/"$DB_NAME"-*.dump 2>/dev/null | tail -n +15 | xargs -r rm --
ls -1t "$BACKUP_DIR"/uploads-*.tar.gz 2>/dev/null | tail -n +15 | xargs -r rm --
