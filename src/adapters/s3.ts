import * as AWS from '@aws-sdk/client-s3'
import { AdapterInterface, UploadedFile, UploadMeta, UploadResponse } from '../adapter'

export type FileOptions = {
  bucket: string
  endpointUrl: string
  acl?: 'private' | 'public-read'
}

export default class S3Adapter implements AdapterInterface {
  instance: AWS.S3
  options: FileOptions

  constructor (s3Configuration: AWS.S3ClientConfig, fileOptions: FileOptions) {
    this.instance = new AWS.S3(s3Configuration)
    this.options = fileOptions
  }

  getEndpointUrl (uploadMeta: UploadMeta) {
    return uploadMeta?.endpointUrl
  }

  async upload (file: UploadedFile, id?: string): Promise<UploadResponse> {
    await this.instance.putObject({
      Bucket: this.options.bucket,
      Key: file.name,
      Body: file.data,
      ACL: this.options.acl,
      ContentType: file.mimetype
    })

    return {
      uploadId: id,
      uploadMeta: {
        awsKey: file.name,
        endpointUrl: `${this.options.endpointUrl}`
      }
    }
  }

  async delete (uploadMeta: UploadMeta): Promise<void> {
    await this.instance.deleteObject({
      Bucket: process.env.SPACES_NAME,
      Key: String(uploadMeta?.endpointUrl)
    })
  }
}
