import json
def lambda_handler(event, context):
    available_versions = ['1', '2', '3']
    return {
        'statusCode': 200,
        'body': json.dumps(available_versions)
    }
