import aws_cdk as core
import aws_cdk.assertions as assertions

from amplify.amplify_stack import AmplifyStack

# example tests. To run these tests, uncomment this file along with the example
# resource in amplify/amplify_stack.py
def test_sqs_queue_created():
    app = core.App()
    stack = AmplifyStack(app, "amplify")
    template = assertions.Template.from_stack(stack)

#     template.has_resource_properties("AWS::SQS::Queue", {
#         "VisibilityTimeout": 300
#     })
