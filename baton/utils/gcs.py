from pathlib import Path
from logger import logger
from google.cloud import storage


def upload_to_gcs(file_path: Path, bucket_name: str = "baton-db-backups"):
    """Upload backup file to Google Cloud Storage"""

    try:
        # Initialize GCS client
        storage_client = storage.Client()

        # Get bucket
        bucket = storage_client.bucket(bucket_name)

        blob_name = f"{file_path.name}"
        blob = bucket.blob(blob_name)

        # Upload file
        logger.info(f"Uploading {file_path.name} to gs://{bucket_name}/{blob_name}")
        blob.upload_from_filename(str(file_path))

        logger.info(f"Successfully uploaded to gs://{bucket_name}/{blob_name}")
        return True

    except Exception as e:
        logger.error(f"Failed to upload to GCS: {e}")
        return False
