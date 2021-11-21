import * as AWS from '@aws-sdk/client-s3'
import { AdapterInterface, getEndpointUrl, UploadedFile } from '../adapter'

export type FileOptions = {
  bucket: string
  endpointUrl: string
  acl?: 'private' | 'public-read'
}

export default class S3Adapter implements AdapterInterface<AWS.PutObjectCommandOutput, AWS.DeleteObjectCommandOutput> {
  instance: AWS.S3
  options: FileOptions
  getEndpointUrlRef: getEndpointUrl | undefined

  constructor (s3Configuration: AWS.S3ClientConfig, fileOptions: FileOptions, getEndpoint?: getEndpointUrl) {
    this.instance = new AWS.S3(s3Configuration)
    this.options = fileOptions
    if (getEndpoint) {
      this.getEndpointUrlRef = getEndpoint
    }
  }

  getEndpointUrl (filename: string) {
    if (this.getEndpointUrlRef) {
      return this.getEndpointUrlRef(this.options.endpointUrl, filename)
    }

    return `${this.options.endpointUrl}/${filename}`
  }

  async upload (file: UploadedFile): Promise<AWS.PutObjectCommandOutput> {
    return await this.instance.putObject({
      Bucket: this.options.bucket,
      Key: file.name,
      Body: file.data,
      ACL: this.options.acl,
      ContentType: file.mimetype
    })
  }

  async delete (filename: string): Promise<AWS.DeleteObjectCommandOutput> {
    return await this.instance.deleteObject({
      Bucket: process.env.SPACES_NAME,
      Key: String(filename)
    })
  }
}
