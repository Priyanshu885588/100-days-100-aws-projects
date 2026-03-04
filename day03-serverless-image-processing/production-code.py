import json
import boto3
import os
from PIL import Image

s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('ImageInventory')

def lambda_handler(event, context):
    for record in event['Records']:
        body = json.loads(record['body'])
        bucket = body['bucket']
        key = body['key']
        image_id = body.get('id', 'unknown')

        # Local paths for processing
        download_path = f"/tmp/{os.path.basename(key)}"
        upload_path = f"/tmp/thumb-{os.path.basename(key)}"

        try:
            # 1. Download
            s3.download_file(bucket, key, download_path)

            # 2. Process (Thumbnail)
            with Image.open(download_path) as img:
                img.thumbnail((128, 128))
                img.save(upload_path)

            # 3. Upload Result
            new_key = key.replace('uploads/', 'processed/').replace('raw_', 'thumb_')
            s3.upload_file(upload_path, bucket, new_key)

            # 4. Update Metadata
            table.update_item(
                Key={'ImageId': image_id},
                UpdateExpression="set #s = :s, #p = :p",
                ExpressionAttributeNames={'#s': 'Status', '#p': 'ProcessedPath'},
                ExpressionAttributeValues={
                    ':s': 'RESIZED_COMPLETED',
                    ':p': f"s3://{bucket}/{new_key}"
                }
            )
        except Exception as e:
            print(f"Error: {str(e)}")
            raise e

    return {'statusCode': 200}