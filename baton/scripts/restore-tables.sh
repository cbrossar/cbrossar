#!/bin/bash

# Variables for PostgreSQL connection
DB_HOST=$DB_HOST
DB_USER=$DB_USER
DB_NAME=$DB_NAME
DB_PASSWORD=$DB_PASSWORD

# Specify which tables to restore
TABLE1="fantasy_players"
TABLE2="fantasy_player_gameweeks"
BACKUP_FILE="db-backups/backup_verceldb_2025-07-27_13-21-48.sql"

# Export the password
export PGPASSWORD=$DB_PASSWORD

# For text format dumps, use psql instead of pg_restore
# First, drop the existing tables if they exist
psql --host=$DB_HOST --username=$DB_USER --dbname=$DB_NAME -c "DROP TABLE IF EXISTS $TABLE1, $TABLE2 CASCADE;"

# Extract and restore only the specified tables using psql
psql --host=$DB_HOST --username=$DB_USER --dbname=$DB_NAME -f $BACKUP_FILE

echo "Restored tables: $TABLE1, $TABLE2"