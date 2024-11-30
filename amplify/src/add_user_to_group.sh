#!/bin/bash

# Ensure the script exits on error
set -e

# Hardcoded group name
GROUP_NAME="ROS-OTA-AuthorizedUsers"

# Path to amplify_outputs.json
AMPLIFY_OUTPUTS_FILE="./amplify_outputs.json"

# Function to display usage
usage() {
    echo "Usage: $0 -u <username>"
    exit 1
}

# Parse arguments
while getopts ":u:" opt; do
    case ${opt} in
        u) USERNAME=$OPTARG ;;
        *) usage ;;
    esac
done

# Check if username is provided
if [[ -z "$USERNAME" ]]; then
    usage
fi

# Verify amplify_outputs.json exists
if [[ ! -f "$AMPLIFY_OUTPUTS_FILE" ]]; then
    echo "Error: amplify_outputs.json not found at $AMPLIFY_OUTPUTS_FILE."
    exit 1
fi

# Extract user_pool_id from amplify_outputs.json
USER_POOL_ID=$(jq -r '.auth.user_pool_id' "$AMPLIFY_OUTPUTS_FILE")

# Check if user_pool_id is valid
if [[ -z "$USER_POOL_ID" || "$USER_POOL_ID" == "null" ]]; then
    echo "Error: Could not extract user_pool_id from $AMPLIFY_OUTPUTS_FILE."
    exit 1
fi

# Add the user to the group
echo "Adding user '$USERNAME' to group '$GROUP_NAME' in user pool '$USER_POOL_ID'..."
aws cognito-idp admin-add-user-to-group \
    --user-pool-id "$USER_POOL_ID" \
    --username "$USERNAME" \
    --group-name "$GROUP_NAME"

if [[ $? -eq 0 ]]; then
    echo "User '$USERNAME' successfully added to group '$GROUP_NAME'."
else
    echo "Failed to add user '$USERNAME' to group '$GROUP_NAME'."
fi
