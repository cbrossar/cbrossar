import os
from pathlib import Path
from logger import logger
from google.cloud import storage
from datetime import datetime


def upload_to_gcs(file_path: Path):
    """Upload backup file to Google Cloud Storage"""
    
    bucket_name = "baton-db-backups"
    
    try:
        # Initialize GCS client
        storage_client = storage.Client()
        
        # Get bucket
        bucket = storage_client.bucket(bucket_name)
        
        # Create blob name with folder structure
        folder = "db-backups"
        blob_name = f"{folder}/{file_path.name}"
        blob = bucket.blob(blob_name)
        
        # Upload file
        logger.info(f"Uploading {file_path.name} to gs://{bucket_name}/{blob_name}")
        blob.upload_from_filename(str(file_path))
        
        # Set metadata
        blob.metadata = {
            'backup_date': datetime.now().isoformat(),
            'database_name': file_path.stem.split('_')[1] if '_' in file_path.stem else 'unknown'
        }
        blob.patch()
        
        logger.info(f"Successfully uploaded to gs://{bucket_name}/{blob_name}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to upload to GCS: {e}")
        return False