// file: lib/minio-sts.ts (or wherever your server-side function lives)
"use server";

import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";

export async function generateTemporaryMinioCredentials(
  userId: string,
  bucketName: string
) {
  // Configure the STS Client to connect to your MinIO server
  const stsClient = new STSClient({
    endpoint: process.env.MINIO_ENDPOINT,
    credentials: {
      accessKeyId: process.env.MINIO_STS_ACCESS_KEY!,
      secretAccessKey: process.env.MINIO_STS_SECRET_KEY!,
    },
    region: "us-east-1",
    // REMOVED: forcePathStyle: true, as it's not a valid property for STSClient
  });

  // Define the inline policy for the temporary session
  const temporaryPolicy = JSON.stringify({
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Action: ["s3:*"],
        Resource: [
          `arn:aws:s3:::${bucketName}`,
          `arn:aws:ss3:::${bucketName}/*`,
        ],
      },
    ],
  });

  // Create the command to assume a role
  const command = new AssumeRoleCommand({
    RoleArn: "arn:aws:iam::123456789012:role/S3Access",
    RoleSessionName: `client-session-${userId}-${Date.now()}`,
    Policy: temporaryPolicy,
    DurationSeconds: 3600,
  });

  try {
    const { Credentials } = await stsClient.send(command);

    if (!Credentials) {
      throw new Error("Failed to assume role, credentials not returned.");
    }

    console.log("Successfully generated temporary credentials for bucket:", bucketName);

    // Return the credentials for the client to use
    return {
      accessKeyId: Credentials.AccessKeyId,
      secretAccessKey: Credentials.SecretAccessKey,
      sessionToken: Credentials.SessionToken,
      expiration: Credentials.Expiration,
    };
  } catch (error) {
    console.error("Error assuming role with MinIO STS:", error);
    throw new Error("Could not generate temporary access token.");
  }
}