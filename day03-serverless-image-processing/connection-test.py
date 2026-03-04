import json
import boto3

s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('ImageInventory')

def lambda_handler(event, context):
    for record in event['Records']:
        body = json.loads(record['body'])
        bucket = body['bucket']
        key = body['key']
        image_id = body.get('id', 'unknown')

        # Update DB to Processing
        table.put_item(Item={'ImageId': image_id, 'Status': 'PROCESSING'})

        # Copy file to processed/ as a connectivity test
        new_key = key.replace('uploads/', 'processed/').replace('raw_', 'test_')
        s3.copy_object(Bucket=bucket, CopySource={'Bucket': bucket, 'Key': key}, Key=new_key)

        # Update DB to Completed
        table.update_item(
            Key={'ImageId': image_id},
            UpdateExpression="set #s = :s",
            ExpressionAttributeNames={'#s': 'Status'},
            ExpressionAttributeValues={':s': 'COMPLETED'}
        )
    return {'statusCode': 200}