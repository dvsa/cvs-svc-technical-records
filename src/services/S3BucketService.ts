import S3, {Metadata} from "aws-sdk/clients/s3";
import {AWSError, config as AWSConfig} from "aws-sdk";
import {Readable} from "stream";
import Configuration from "../utils/Configuration";
import {IS3Config} from "../../@Types/Configuration";
import {ManagedUpload} from "aws-sdk/lib/s3/managed_upload";
import {PromiseResult} from "aws-sdk/lib/request";
/* tslint:disable */
const AWSXRay = require("aws-xray-sdk");
/* tslint:enable */

/**
 * Service class for communicating with Simple Storage Service
 */
class S3BucketService {
  public readonly s3Client: S3;

  constructor(s3Client: S3) {
    const config: IS3Config = Configuration.getInstance().getS3Config();
    this.s3Client = AWSXRay.captureAWSClient(s3Client);
    AWSConfig.s3 = config;
  }

  /**
   * Uploads a file to an S3 bucket
   * @param bucketName - the bucket to upload to
   * @param fileName - the name of the file
   * @param content - contents of the file
   * @param metadata - optional metadata
   */
  public upload(bucketName: string, fileName: string, content: Buffer|Uint8Array|Blob|string|Readable, metadata?: Metadata): Promise<ManagedUpload.SendData> {
    return this.s3Client.upload({
      Bucket: bucketName,
      Key: `${process.env.BRANCH}/${fileName}`,
      Body: content,
      Metadata: metadata
    }).promise();
  }

  /**
   * Downloads a file from an S3 bucket
   * @param bucketName - the bucket from which to download
   * @param fileName - the name of the file
   */
  public download(bucketName: string, fileName: string): Promise<PromiseResult<S3.Types.GetObjectOutput, AWSError>> {
    return this.s3Client.getObject({
      Bucket: bucketName,
      Key: `${process.env.BRANCH}/${fileName}`,
    }).promise();
  }
}

export default S3BucketService;
