import * as AWS from '@aws-sdk/client-s3'
import { AdapterInterface, getEndpointUrl, UploadedFile } from '../adapter'

export type FileOptions = {
  bucket: string
  endpointUrl: string
  acl?: 'private' | 'public-read'
}

export default class S3Adapter implements AdapterInterface {
  instance: AWS.S3
  options: FileOptions
  getEndpointUrlRef: getEndpointUrl

  constructor(s3Configuration: AWS.S3ClientConfig, fileOptions: FileOptions, getEndpoint: getEndpointUrl) {
    this.instance = new AWS.S3(s3Configuration)
    this.options = fileOptions
    this.getEndpointUrlRef = getEndpoint
  }

  getEndpointUrl(filename: string) {
    return `${this.options.endpointUrl}/${filename}`
  }

  async upload(file: UploadedFile): Promise<void> {
    await this.instance.putObject({
      Bucket: this.options.bucket,
      Key: file.name,
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