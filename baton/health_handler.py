from health import run_health_check
from logger import logger

def lambda_handler(event, context):
    try:
        success = run_health_check()
        
        if not success:
            return {
                'statusCode': 500,
                'body': 'Health check failed'
            }
            
        return {
            'statusCode': 200,
            'body': 'Health check passed'
        }
    except Exception as e:
        logger.error(f"Error in lambda_handler: {str(e)}")
        return {
            'statusCode': 500,
            'body': str(e)
        }