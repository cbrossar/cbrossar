#!/usr/bin/env python3

import os
import sys
import subprocess
from pathlib import Path
from urllib.parse import urlparse
from logger import logger


def run_restore_tables():
    """Run restore tables"""
    backup_file = "scripts/db-backups/backup_verceldb_2025-08-31_19-06-14.sql"
    tables_to_restore = ["fantasy_player_gameweeks"]
    restore_specific_tables(backup_file, tables_to_restore)
    return True


def parse_database_url(database_url):
    """Parse DATABASE_URL to extract connection parameters"""
    parsed = urlparse(database_url)
    return {
        "host": parsed.hostname,
        "port": parsed.port or 5432,
        "database": parsed.path[1:],
        "user": parsed.username,
        "password": parsed.password,
    }


def extract_table_from_backup(backup_file: Path, table_name: str):
    """Extract specific table from backup file"""
    if not backup_file.exists():
        logger.error(f"Backup file not found: {backup_file}")
        return None

    extracted_lines = []
    in_target_table = False
    table_section = None  # 'structure' or 'data'
    found_table = False

    logger.info(f"Searching for table: {table_name}")

    with open(backup_file, "r") as f:
        for line_num, line in enumerate(f, 1):
            line_stripped = line.strip()

            # Check for table structure section (pg_dump format)
            if f"-- Name: {table_name}; Type: TABLE;" in line_stripped:
                logger.info(
                    f"Found table structure at line {line_num}: {line_stripped}"
                )
                in_target_table = True
                table_section = "structure"
                found_table = True
                extracted_lines.append(line.rstrip())
                continue

            # Check for table data section (pg_dump format)
            if f"-- Data for Name: {table_name}; Type: TABLE DATA;" in line_stripped:
                logger.info(f"Found table data at line {line_num}: {line_stripped}")
                in_target_table = True
                table_section = "data"
                found_table = True
                extracted_lines.append(line.rstrip())
                continue

            # End of current table section
            if (
                line_stripped.startswith("-- Name: ")
                and f"; Type: TABLE;" in line_stripped
                and table_name not in line_stripped
            ):
                if in_target_table:
                    logger.info(f"Ending table section at line {line_num}")
                in_target_table = False
                table_section = None
                continue

            if (
                line_stripped.startswith("-- Data for Name: ")
                and f"; Type: TABLE DATA;" in line_stripped
                and table_name not in line_stripped
            ):
                if in_target_table:
                    logger.info(f"Ending data section at line {line_num}")
                in_target_table = False
                table_section = None
                continue

            # Include lines for target table
            if in_target_table:
                if table_section == "structure":
                    # Include all structure-related lines including DROP TABLE
                    if (
                        line_stripped.startswith("DROP TABLE")
                        or line_stripped.startswith("CREATE TABLE")
                        or line_stripped.startswith("ALTER TABLE")
                        or line_stripped.startswith("ADD CONSTRAINT")
                        or line_stripped.startswith("OWNER TO")
                        or line_stripped == ""
                        or line_stripped.startswith("--")
                        or line_stripped.startswith("(")
                        or line_stripped.startswith(")")
                        or line_stripped.endswith(",")
                        or line_stripped.endswith(";")
                        or not line_stripped.startswith("--")
                    ):
                        extracted_lines.append(line.rstrip())

                elif table_section == "data":
                    # Include COPY statements and data
                    if (
                        line_stripped.startswith("COPY ")
                        or line_stripped.startswith("\\.")
                        or line_stripped == ""
                        or line_stripped.startswith("--")
                        or (not line_stripped.startswith("--") and line_stripped)
                    ):
                        extracted_lines.append(line.rstrip())

    if not found_table:
        logger.error(f"Table '{table_name}' not found in backup file")
        # Let's search for any tables that contain this name
        with open(backup_file, "r") as f:
            for line_num, line in enumerate(f, 1):
                if f"Name: {table_name}" in line:
                    logger.info(f"Found similar line at {line_num}: {line.strip()}")

    logger.info(f"Extracted {len(extracted_lines)} lines for table {table_name}")
    return extracted_lines


def restore_specific_tables(backup_file: str, table_names: list):
    """Restore specific tables from backup file"""

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

    backup_path = Path(backup_file)
    if not backup_path.exists():
        logger.error(f"Backup file not found: {backup_path}")
        sys.exit(1)

    # Create temporary restore file
    temp_file = Path(f"temp_restore_{'_'.join(table_names)}.sql")

    try:
        # Extract all specified tables
        all_extracted_lines = []
        for table_name in table_names:
            logger.info(f"Extracting table: {table_name}")
            extracted_lines = extract_table_from_backup(backup_path, table_name)

            if not extracted_lines:
                logger.error(f"Could not find table {table_name} in backup file")
                continue

            all_extracted_lines.extend(extracted_lines)
            all_extracted_lines.append("")  # Add blank line between tables

        if not all_extracted_lines:
            logger.error("No tables found to restore")
            sys.exit(1)

        # Write extracted SQL to temporary file
        with open(temp_file, "w") as f:
            f.write(f"-- Restored tables: {', '.join(table_names)}\n")
            f.write(f"-- From backup: {backup_path.name}\n\n")

            # Add DROP TABLE statements for each table
            for table_name in table_names:
                f.write(f"DROP TABLE IF EXISTS public.{table_name} CASCADE;\n")
            f.write("\n")

            f.write("\n".join(all_extracted_lines))

        logger.info(f"Created restore file: {temp_file}")

        # Debug: Show first few lines of the restore file
        logger.info("=== RESTORE FILE PREVIEW ===")
        with open(temp_file, "r") as f:
            lines = f.readlines()
            for i, line in enumerate(lines[:10]):
                logger.info(f"Line {i+1}: {line.rstrip()}")
            if len(lines) > 10:
                logger.info(f"... and {len(lines)-10} more lines")
        logger.info("=== END PREVIEW ===")

        # Build psql command
        cmd = [
            "psql",
            "--host",
            conn_params["host"],
            "--port",
            str(conn_params["port"]),
            "--username",
            conn_params["user"],
            "--dbname",
            conn_params["database"],
            "--no-password",
            "--file",
            str(temp_file),
        ]

        # Set environment variables for psql
        env = os.environ.copy()
        env["PGPASSWORD"] = conn_params["password"]

        # Execute restore
        logger.info(f"Restoring tables: {', '.join(table_names)}")
        result = subprocess.run(cmd, env=env, capture_output=True, text=True)

        if result.returncode == 0:
            logger.info(f"Successfully restored tables: {', '.join(table_names)}")
        else:
            logger.error(f"Restore failed with return code {result.returncode}")
            logger.error(f"Error output: {result.stderr}")
            sys.exit(1)

    except Exception as e:
        logger.error(f"Restore failed: {e}")
        sys.exit(1)
    finally:
        # Clean up temporary file
        if temp_file.exists():
            temp_file.unlink()
            logger.info(f"Cleaned up temporary file: {temp_file}")
