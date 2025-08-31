#!/usr/bin/env python3

import os
import sys
import subprocess
from datetime import datetime
from urllib.parse import urlparse
from pathlib import Path
from logger import logger
from utils.gcs import upload_to_gcs

def parse_database_url(database_url):
    """Parse DATABASE_URL to extract connection parameters"""
    parsed = urlparse(database_url)
    return {
        'host': parsed.hostname,
        'port': parsed.port or 5432,
        'database': parsed.path[1:],  # Remove leading slash
        'user': parsed.username,
        'password': parsed.password
    }

def run_backup_db():
    """Create a database backup using pg_dump via subprocess"""
    
    # Get database URL from environment
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        logger.error("DATABASE_URL environment variable not set")
        sys.exit(1)
    
    # Parse connection parameters
    try:
        conn_params = parse_database_url(database_url)
    except Exception as e:
        logger.error(f"Failed to parse DATABASE_URL: {e}")
        sys.exit(1)
    
    # Get current timestamp
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    db_name = conn_params['database']
    filename = f"backup_{db_name}_{timestamp}.sql"
    
    # Create db-backups directory if it doesn't exist
    backup_dir = Path("scripts/db-backups")
    backup_dir.mkdir(parents=True, exist_ok=True)
    
    backup_path = backup_dir / filename
    
    # Build pg_dump command
    cmd = [
        'pg_dump',
        '--host', conn_params['host'],
        '--port', str(conn_params['port']),
        '--username', conn_params['user'],
        '--dbname', conn_params['database'],
        '--no-password',  # Use environment variable instead
        '--verbose',
        '--clean',
        '--create'
    ]
    
    # Set environment variables for pg_dump
    env = os.environ.copy()
    env['PGPASSWORD'] = conn_params['password']
    
    try:
        logger.info(f"Creating backup: {filename}")
        logger.info(f"Connecting to database: {db_name} on {conn_params['host']}:{conn_params['port']}")
        
        # Run pg_dump
        with open(backup_path, 'w') as backup_file:
            result = subprocess.run(
                cmd,
                stdout=backup_file,
                stderr=subprocess.PIPE,
                env=env,
                text=True
            )
        
        if result.returncode == 0:
            logger.info(f"Backup successful: {filename}")
            logger.info(f"Backup saved to: {backup_path.absolute()}")
            upload_to_gcs(backup_path)
        else:
            logger.error(f"pg_dump failed with return code {result.returncode}")
            logger.error(f"Error output: {result.stderr}")
            sys.exit(1)
            
    except FileNotFoundError:
        logger.error("pg_dump command not found. Please ensure PostgreSQL client tools are installed.")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Backup failed: {e}")
        sys.exit(1)
