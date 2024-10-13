from aws_cdk import (
    Stack,
    aws_lambda as _lambda,
    aws_apigateway as apigateway,
    aws_iam as iam,
)
from constructs import Construct

class AmplifyStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # Lambda function to list devices and their firmware versions
        list_devices_lambda = _lambda.Function(
            self, "ListDevicesFunction",
            runtime=_lambda.Runtime.PYTHON_3_8,
            handler="list_devices.lambda_handler",
            code=_lambda.Code.from_asset("lambda_functions")
        )

        # Attach IoT ListThings permission to the Lambda role
        list_devices_lambda.add_to_role_policy(
            iam.PolicyStatement(
                actions=["iot:ListThings", "iot:DescribeThing"],
                resources=["*"] 
            )
        )

        # Lambda function to list available firmware versions
        list_versions_lambda = _lambda.Function(
            self, "ListVersionsFunction",
            runtime=_lambda.Runtime.PYTHON_3_8,
            handler="list_versions.lambda_handler",
            code=_lambda.Code.from_asset("lambda_functions")
        )

        # Lambda function to trigger firmware updates
        update_device_lambda = _lambda.Function(
            self, "UpdateDeviceFunction",
            runtime=_lambda.Runtime.PYTHON_3_8,
            handler="update_device.lambda_handler",
            code=_lambda.Code.from_asset("lambda_functions")
        )

        update_device_lambda.add_to_role_policy(
            iam.PolicyStatement(
                actions=["iot:CreateJob", "iot:UpdateThing"],
                resources=["*"]
            )
        )

        # Define API Gateway to expose Lambda functions
        api = apigateway.RestApi(self, "DeviceApi",
            rest_api_name="Device Service",
            description="API for managing IoT devices and firmware versions.",
            default_cors_preflight_options={
                "allow_origins": ["http://localhost:3000"],  # Restrict to localhost only
                "allow_methods": apigateway.Cors.ALL_METHODS,  # Allow all methods, you can specify ['GET', 'POST'] as needed
                "allow_headers": ["Content-Type", "X-Amz-Date", "Authorization", "X-Api-Key", "X-Amz-Security-Token"],
            }
        )

        # Add resources and methods to API Gateway
        devices = api.root.add_resource("devices")
        devices.add_method("GET", apigateway.LambdaIntegration(list_devices_lambda))

        versions = api.root.add_resource("versions")
        versions.add_method("GET", apigateway.LambdaIntegration(list_versions_lambda))

        update = api.root.add_resource("update-device")
        update.add_method("POST", apigateway.LambdaIntegration(update_device_lambda))
