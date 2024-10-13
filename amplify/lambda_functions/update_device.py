import boto3
import json
import uuid

iot = boto3.client('iot')
sts = boto3.client('sts')

def lambda_handler(event, context):
    body = json.loads(event['body'])
    device_name = body['device_name']
    version = body['version']
    account_id = sts.get_caller_identity()["Account"]
    
    job_id = str(uuid.uuid4())
    target = f"arn:aws:iot:us-east-1:{account_id}:thing/{device_name}"
    
    job_document = {
        "operation": "Deploy-ROS-Firmware",
        "jobDocument": {
            "thingName": device_name,
            "attributeUpdate": {
                "attributes": {
                    "firmwareVersion": version
                }
            }
        },
        "version": version
    }
    
    try:
        # Create a job to update the firmware
        response = iot.create_job(
            jobId=job_id,
            targets=[target],
            document=json.dumps(job_document),
            targetSelection='SNAPSHOT',
            description=f"Firmware update to version {version}",
        )
        # Check the response's status code to ensure success
        if response['ResponseMetadata']['HTTPStatusCode'] == 200:
            print("Job created successfully:", response)

            # Update the thing attributes with the new firmware version
            iot.update_thing(
                thingName=device_name,
                attributePayload={
                    'attributes': {
                        'firmwareVersion': version
                    },
                    'merge': True
                }
            )
            print(f"Updated thing attributes for {device_name}")

            return {
                'statusCode': 200,
                'body': json.dumps({'message': 'Update triggered', 'job_id': job_id})
            }
        else:
            # If the create_job response indicates failure
            return {
                'statusCode': 500,
                'body': json.dumps({'message': 'Failed to create job', 'response': response})
            }
        
    except Exception as e:
        print(f"Error: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Internal Server Error', 'error': str(e)})
        }