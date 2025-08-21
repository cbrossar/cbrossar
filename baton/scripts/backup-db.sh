#!/bin/bash

# Variables for PostgreSQL connection
DB_HOST=$DB_HOST
DB_USER=$DB_USER
DB_NAME=$DB_NAME
DB_PASSWORD=$DB_PASSWORD

# Get the current timestamp (format: YYYY-MM-DD_HH-MM-SS)
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

# Set the filename with the timestamp
FILENAME="backup_${DB_NAME}_${TIMESTAMP}.sql"

# Export the password so that pg_dump doesn't prompt for it
export PGPASSWORD=$DB_PASSWORD

# Create the db-backups directory if it doesn't exist
mkdir -p scripts/db-backups

# Run pg_dump and save the output to the file with the timestamp
pg_dump --host=$DB_HOST --username=$DB_USER $DB_NAME > scripts/db-backups/$FILENAME

# Check if the dump was successful
if [ $? -eq 0 ]; then
    echo "Backup successful: $FILENAME"
else
    echo "Backup failed"
fi