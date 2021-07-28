import * as AWS from '@aws-sdk/client-s3'
import { UploadedFile } from 'express-fileupload';
import { AdapterInterface } from "../payload-plugin-s3";

export type FileOptions = {
  bucket: string;
  acl?: 'private' | 'public-read';
}

export class S3Adapter implements AdapterInterface {
  instance: AWS.S3 = null
  options: FileOptions = null

  constructor(s3Configuration: AWS.S3ClientConfig, fileOptions: FileOptions) {
    this.instance = new AWS.S3(s3Configuration)
    this.options = fileOptions
  }

  async upload(filename: string, file: UploadedFile): Promise<void> {
    await this.instance.putObject({
      Bucket: this.options.bucket,
      Key: String(filename),
      Body: file.data,
      ACL: this.options.acl,
      ContentType: file.mimetype,
    })
  }

  async delete(filename: string): Promise<void> {
    await this.instance.deleteObject({
      Bucket: process.env.SPACES_NAME,
      Key: String(filename),
    })
  }
}