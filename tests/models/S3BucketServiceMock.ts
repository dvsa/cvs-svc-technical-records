/* istanbul ignore file */

import S3, {Metadata} from "aws-sdk/clients/s3";
import {AWSError, Response} from "aws-sdk";
import {Readable} from "stream";
import {PromiseResult} from "aws-sdk/lib/request";
import {ManagedUpload} from "aws-sdk/lib/s3/managed_upload";
import * as fs from "fs";
import * as path from "path";

interface IBucket {
  bucketName: string;
  files: string[];
}

/**
 * Service for mocking the S3BucketService
 */
class S3BucketServiceMock {
  public static buckets: IBucket[] = [{bucketName: "cvs-local-adr-pdfs", files: []}];
  public readonly s3Client: S3 = new S3();

  /**
   * Uploads a file to an S3 bucket
   * @param bucketName - the bucket to upload to
   * @param fileName - the name of the file
   * @param content - contents of the file
   * @param metadata - optional metadata
   */
  public async upload(bucketName: string, fileName: string, content: Buffer|Uint8Array|Blob|string|Readable, metadata?: Metadata): Promise<ManagedUpload.SendData> {
    const bucket: IBucket | undefined = S3BucketServiceMock.buckets.find((currentBucket: IBucket) => {
      return currentBucket.bucketName === bucketName;
    });

    if (!bucket) {
      const error: Error = new Error();
      Object.assign(error, {
        message: "The specified bucket does not exist.",
        code: "NoSuchBucket",
        statusCode: 404,
        retryable: false
      });

      throw error;
    }
    const response: ManagedUpload.SendData = {
      Location: `http://localhost:7000/${bucketName}/${fileName}`,
      ETag: "621c9c14d75958d4c3ed8ad77c80cde1",
      Bucket: bucketName,
      Key: `${process.env.BRANCH}/${fileName}`
    };

    return Promise.resolve(response);
  }

  /**
   * Downloads a file from an S3 bucket
   * @param bucketName - the bucket from which to download
   * @param fileName - the name of the file
   */
  public async download(bucketName: string, fileName: string): Promise<PromiseResult<S3.Types.GetObjectOutput, AWSError>> {
    const bucket: IBucket | undefined = S3BucketServiceMock.buckets.find((currentBucket: IBucket) => {
      return currentBucket.bucketName === bucketName;
    });

    if (!bucket) {
      const error: Error = new Error();
      Object.assign(error, {
        message: "The specified bucket does not exist.",
        code: "NoSuchBucket",
        statusCode: 404,
        retryable: false
      });

      throw error;
    }

    const bucketKey: string | undefined = bucket.files.find((currentFileName: string) => {
      return currentFileName === fileName;
    });

    if (!bucketKey) {
      const error: Error = new Error();
      Object.assign(error, {
        message: "The specified key does not exist.",
        code: "NoSuchKey",
        statusCode: 404,
        retryable: false
      });

      throw error;
    }

    const file: Buffer = fs.readFileSync(path.resolve(__dirname, `../resources/signatures/${bucketKey}`));
    const data: S3.Types.GetObjectOutput = {
      Body: file,
      ContentLength: file.length,
      ETag: "621c9c14d75958d4c3ed8ad77c80cde1",
      LastModified: new Date(),
      Metadata: {}
    };

    const response = new Response<S3.Types.GetObjectOutput, AWSError>();
    Object.assign(response, { data });

    return Promise.resolve({
      $response: response,
      ...data
    });
  }
}

export default S3BucketServiceMock;
