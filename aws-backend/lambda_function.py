import json
import boto3
import uuid
import os
from datetime import datetime

# Initialize DynamoDB resource
# Expects a table named 'AWSCommunityDayRegistrations' by default
dynamodb = boto3.resource('dynamodb')
TABLE_NAME = os.environ.get('TABLE_NAME', 'AWSCommunityDayRegistrations')
table = dynamodb.Table(TABLE_NAME)

def lambda_handler(event, context):
    print("Received event:", json.dumps(event))
    
    # Enable CORS
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    # Handle OPTIONS request (CORS Preflight)
    if event.get('requestContext', {}).get('http', {}).get('method') == 'OPTIONS':
         return {
            'statusCode': 200,
            'headers': headers,
            'body': ''
        }
    
    try:
        # Parse Body
        body = json.loads(event.get('body', '{}'))
        
        # Validation
        if not body.get('email'):
             return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'message': 'Email is required'})
            }

        # Item to save
        item = {
            'id': str(uuid.uuid4()),
            'email': body.get('email'),
            'name': body.get('name'),
            'role': body.get('role'),
            'timestamp': body.get('timestamp') or datetime.utcnow().isoformat(),
            'createdAt': datetime.utcnow().isoformat()
        }

        # Save to DynamoDB
        table.put_item(Item=item)

        return {
            'statusCode': 201,
            'headers': headers,
            'body': json.dumps({'message': 'Registration successful', 'id': item['id']})
        }

    except Exception as e:
        print("Error:", str(e))
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'message': 'Internal Server Error', 'error': str(e)})
        }
