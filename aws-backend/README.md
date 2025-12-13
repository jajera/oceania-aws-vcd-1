# AWS Backend Deployment Instructions

This directory contains the simple Python serverless backend to save attendee registrations to DynamoDB.

## Prerequisites

- An AWS Account
- Access to AWS Console

## Step 1: Create DynamoDB Table

1. Go to **DynamoDB** service in AWS Console.
2. Click **Create table**.
3. **Table name**: `AWSCommunityDayRegistrations`
4. **Partition key**: `id` (String).
5. Leave defaults and click **Create table**.

## Step 2: Create Lambda Function

1. Go to **Lambda** service.
2. Click **Create function**.
3. **Function name**: `SaveRegistration`
4. **Runtime**: `Python 3.12` (or latest).
5. Click **Create function**.
6. Copy the content of `lambda_function.py` from this directory.
7. Paste it into the **Code source** editor in AWS Console (replacing default code).
8. Click **Deploy**.

## Step 3: Grant Permissions

1. In the Lambda function view, go to **Configuration** -> **Permissions**.
2. Click the execution role name to open IAM.
3. Click **Add permissions** -> **Attach policies**.
4. Search for `AmazonDynamoDBFullAccess` (or create a scoped policy for just your table) and attach it.

## Step 4: Enable Function URL

1. In the Lambda function view, go to **Configuration** -> **Function URL**.
2. Click **Create function URL**.
3. **Auth type**: `NONE` (for public access from your website).
4. **CORS**: Check **Configure cross-origin resource sharing (CORS)**.
    - **Allow origin**: `*`
    - **Allow methods**: `POST`, `OPTIONS`
    - **Allow headers**: `content-type`
5. Click **Save**.

## Step 5: Update Frontend

1. Copy the **Function URL** you just created (e.g., `https://xyz...lambda-url.region.on.aws/`).
2. Open `data.json` in your website code.
3. Replace `YOUR_AWS_LAMBDA_URL_HERE` with your actual Function URL.

## Done

Your registration form will now save data to your DynamoDB table.
