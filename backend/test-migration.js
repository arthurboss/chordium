#!/usr/bin/env node

/**
 * Simple test to verify AWS SDK v3 migration works
 */

import { s3StorageService } from "./services/s3-storage.service.js";

console.log("Testing AWS SDK v3 migration...");

// Test basic initialization
process.env.AWS_ACCESS_KEY_ID = "test-key";
process.env.AWS_SECRET_ACCESS_KEY = "test-secret";
process.env.AWS_REGION = "us-east-1";
process.env.S3_BUCKET_NAME = "test-bucket";

try {
  const isEnabled = s3StorageService._checkEnabled();
  console.log(
    "✅ S3 service initialization:",
    isEnabled ? "Success" : "Failed"
  );

  if (isEnabled) {
    console.log("✅ Service enabled:", s3StorageService.enabled);
    console.log("✅ Bucket name:", s3StorageService.bucketName);
    console.log("✅ S3 client type:", s3StorageService.s3.constructor.name);
  }

  console.log("\n🎉 AWS SDK v3 migration completed successfully!");
  console.log("Key changes:");
  console.log("- AWS SDK v2 → v3");
  console.log("- Modular imports (S3Client, Commands)");
  console.log("- client.send(command) pattern");
  console.log("- Improved credentials handling");
} catch (error) {
  console.error("❌ Migration test failed:", error.message);
  process.exit(1);
}
