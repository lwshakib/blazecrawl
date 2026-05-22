import { ListObjectsV2Command, DeleteObjectsCommand, DeleteBucketCommand } from "@aws-sdk/client-s3"
import { s3Client } from "./bucket-setup.js"
import { AWS_S3_BUCKET_NAME } from "../envs.js"
import logger from "../logger/winston.logger.js"

export async function teardownBucket() {
  if (!AWS_S3_BUCKET_NAME) {
    logger.warn("[S3 Teardown] AWS_S3_BUCKET_NAME is not set, skipping teardown.")
    return
  }

  try {
    logger.info(`[S3 Teardown] Cleaning up objects in bucket "${AWS_S3_BUCKET_NAME}"...`)
    
    // 1. List all objects
    const listResponse = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: AWS_S3_BUCKET_NAME,
      })
    )

    const objects = listResponse.Contents

    // 2. Delete all objects if any exist
    if (objects && objects.length > 0) {
      const deleteParams = {
        Bucket: AWS_S3_BUCKET_NAME,
        Delete: {
          Objects: objects.map((obj) => ({ Key: obj.Key })),
        },
      }
      logger.info(`[S3 Teardown] Deleting ${objects.length} objects...`)
      await s3Client.send(new DeleteObjectsCommand(deleteParams))
      logger.info(`[S3 Teardown] All objects deleted successfully.`)
    } else {
      logger.info(`[S3 Teardown] Bucket is already empty.`)
    }

    // 3. Delete the bucket
    logger.info(`[S3 Teardown] Deleting bucket "${AWS_S3_BUCKET_NAME}"...`)
    await s3Client.send(new DeleteBucketCommand({ Bucket: AWS_S3_BUCKET_NAME }))
    logger.info(`[S3 Teardown] Bucket "${AWS_S3_BUCKET_NAME}" deleted successfully.`)
  } catch (error: any) {
    // If the bucket was not found, treat it as a success/noop
    if (error.name === "NoSuchBucket" || error.$metadata?.httpStatusCode === 404) {
      logger.info(`[S3 Teardown] Bucket "${AWS_S3_BUCKET_NAME}" does not exist, nothing to delete.`)
      return
    }
    logger.error(`[S3 Teardown] Failed to tear down bucket: ${error.message || error}`)
    throw error
  }
}

// Self-execute if called directly via CLI
if (process.argv[1]?.includes("bucket-teardown")) {
  teardownBucket()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}
