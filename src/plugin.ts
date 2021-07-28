import * as AWS from '@aws-sdk/client-s3'
import { SanitizedConfig } from 'payload/config'
import { withS3Storage, FileOptions } from './s3'

const withS3 = (
  s3Configuration: AWS.S3ClientConfig,
  fileOptions: FileOptions,
  getUrl: (filename: string) => string,
) => {
  return (incommingConfig: SanitizedConfig): SanitizedConfig => {
    const config: SanitizedConfig = {
      ...incommingConfig,
      collections: incommingConfig.collections.map(collection => {
        if (typeof collection.upload === 'object') {
          return withS3Storage(s3Configuration, fileOptions, collection, getUrl)
        }

        return collection
      }),
    }

    return config
  }
}

export default withS3
