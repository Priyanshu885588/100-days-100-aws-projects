import json
import boto3
import time

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("tasks")

def handler(event, context):

    # Detect HTTP method safely
    method = event.get("requestContext", {}).get("http", {}).get("method")

    # If running Lambda test manually
    if not method:
        method = event.get("httpMethod")

    # ---------------- GET TASKS ----------------
    if method == "GET":

        response = table.scan()

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps(response.get("Items", []))
        }

    # ---------------- CREATE TASK ----------------
    if method == "POST":

        body = event.get("body")

        if body:
            body = json.loads(body)
        else:
            body = {}

        item = {
            "taskId": str(int(time.time())),
            "task": body.get("task", "No Task Provided"),
            "status": "pending"
        }

        table.put_item(Item=item)

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({
                "message": "Task created",
                "task": item
            })
        }

    return {
        "statusCode": 400,
        "body": json.dumps({"message": "Unsupported method"})
    }