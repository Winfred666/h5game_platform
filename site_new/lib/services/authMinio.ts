"server-only"

// provide authentication services of MinIO to admin. (temp 1h session)
import { STS } from 'aws-sdk'; // MinIO兼容STS API

// 生成管理员临时访问凭据
async function generateAdminToken(userId: string, bucket: string) {
  const sts = new STS({
    endpoint: 'http://minio:9000',
    accessKeyId: 'ADMIN_ROOT_KEY',
    secretAccessKey: 'ADMIN_ROOT_SECRET'
  });
  
  // 创建具有有限权限的会话
  const session = await sts.assumeRole({
    RoleArn: `arn:minio:iam:::role/AdminTempRole-${bucket}`,
    RoleSessionName: `audit-session-${userId}`,
    DurationSeconds: 3600, // 1小时有效期
    Policy: JSON.stringify({
      Version: "2012-10-17",
      Statement: [{
        Action: ["s3:*"],
        Effect: "Allow",
        Resource: [
          `arn:aws:s3:::${bucket}`,
          `arn:aws:s3:::${bucket}/*`
        ]
      }]
    })
  }).promise();
  
  // 返回客户端可直接使用的凭证
  return {
    accessKey: session.Credentials?.AccessKeyId,
    secretKey: session.Credentials?.SecretAccessKey,
    sessionToken: session.Credentials?.SessionToken,
    expiration: session.Credentials?.Expiration
  };
}
