import sys
import os

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from player_gameweeks import run_player_gameweeks
from logger import logger
from datetime import datetime

def lambda_handler(event, context):
    try:
        success = run_player_gameweeks()
        
        if not success:
            return {
                'statusCode': 500,
                'body': 'Task failed'
            }
            
        return {
            'statusCode': 200,
            'body': 'Successfully completed'
        }
    except Exception as e:
        logger.error(f"Error in lambda_handler: {str(e)}")
        return {
            'statusCode': 500,
            'body': str(e)
        } 