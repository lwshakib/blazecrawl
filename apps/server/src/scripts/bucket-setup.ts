import { S3Client, HeadBucketCommand, CreateBucketCommand, PutBucketCorsCommand } from "@aws-sdk/client-s3"
import { AWS_REGION, AWS_ENDPOINT, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET_NAME } from "../envs.js"
import logger from "../logger/winston.logger.js"

export const s3Client = new S3Client({
  region: AWS_REGION,
  endpoint: AWS_ENDPOINT,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
})

export async function setupBucket() {
  if (!AWS_S3_BUCKET_NAME) {
    logger.warn("[S3 Setup] AWS_S3_BUCKET_NAME is not set, skipping setup.")
    return
  }
  
  try {
    logger.info(`[S3 Setup] Checking if bucket "${AWS_S3_BUCKET_NAME}" exists...`)
    let exists = true
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: AWS_S3_BUCKET_NAME }))
      logger.info(`[S3 Setup] Bucket "${AWS_S3_BUCKET_NAME}" already exists.`)
    } catch (err: any) {
      // Check for NotFound error name or status code
      if (err.name === "NotFound" || err.$metadata?.httpStatusCode === 404) {
        exists = false
      } else {
        throw err
      }
    }

    if (!exists) {
      logger.info(`[S3 Setup] Creating bucket "${AWS_S3_BUCKET_NAME}"...`)
      await s3Client.send(new CreateBucketCommand({ Bucket: AWS_S3_BUCKET_NAME }))
      logger.info(`[S3 Setup] Bucket "${AWS_S3_BUCKET_NAME}" created successfully.`)
    }

    logger.info(`[S3 Setup] Applying CORS configuration to "${AWS_S3_BUCKET_NAME}"...`)
    await s3Client.send(
      new PutBucketCorsCommand({
        Bucket: AWS_S3_BUCKET_NAME,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedHeaders: ["*"],
              AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
              AllowedOrigins: ["*"],
              ExposeHeaders: [],
              MaxAgeSeconds: 3000,
            },
          ],
        },
      })
    )
    logger.info(`[S3 Setup] CORS configuration applied successfully.`)
  } catch (error: any) {
    logger.error(`[S3 Setup] Failed to set up bucket: ${error.message || error}`)
    throw error
  }
}

// Self-execute if called directly via CLI
if (process.argv[1]?.includes("bucket-setup")) {
  setupBucket()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}
