import * as AWS from '@aws-sdk/client-s3'
import { UploadedFile } from 'express-fileupload'
import { SanitizedCollectionConfig, CollectionBeforeChangeHook, CollectionAfterDeleteHook } from 'payload/types'
import { IncomingUploadType } from 'payload/dist/uploads/types'
import { APIError } from 'payload/errors'

function isUploadedFile (object: unknown): object is UploadedFile {
  if (object !== null && typeof object === 'object') {
    return 'data' in object
  }

  return false
}

let instance: AWS.S3
const getCurrentS3Instance = (): AWS.S3 => {
  if (!instance) {
    throw new APIError("S3 has not been initialized. Ensure you're calling `init()` with your S3 credentials before using these hooks.")
  }
  return instance
}

const options: FileOptions = {
  bucket: null,
  acl: 'private',
}

const getBucketName = (): string => {
  if (options.bucket === null) {
    throw new APIError("Bucket name has not been initialized. Ensure you're calling `init()` with your S3 credentials and file options before using these hooks.")
  }
  return options.bucket
}

export const uploadToS3: CollectionBeforeChangeHook = async ({ data, req }) => {
  if (req?.files?.file) {
    let uploadedFile: UploadedFile
    if (isUploadedFile(req.files.file)) {
      uploadedFile = req.files.file
    } else {
      uploadedFile = req.files.file[0]
    }

    const s3 = getCurrentS3Instance()
    const bucket = getBucketName()
    await s3.putObject({
      Bucket: bucket,
      Key: String(data.filename),
      Body: uploadedFile.data,
      ACL: 'public-read',
      ContentType: uploadedFile.mimetype,
    })
  }

  return data
}

export const deleteFromS3: CollectionAfterDeleteHook = async ({ doc }) => {
  const s3 = getCurrentS3Instance()
  await s3.deleteObject({
    Bucket: process.env.SPACES_NAME,
    Key: String(doc.filename),
  })
}

export type FileOptions = {
  bucket: string;
  acl?: 'private' | 'public-read';
}

type Doc = {
  doc: { s3Url: string }
}

export function init (s3Configuration: AWS.S3ClientConfig, fileOptions: FileOptions): void {
  instance = new AWS.S3(s3Configuration)
  options.bucket = fileOptions.bucket

  if (fileOptions.acl) {
    options.acl = fileOptions.acl
  }
}

function isUploadObject (arg: unknown): arg is IncomingUploadType {
  return typeof arg === 'object'
}

export function withS3Storage (
  s3Configuration: AWS.S3ClientConfig,
  fileOptions: FileOptions,
  collection: SanitizedCollectionConfig,
  getUrl: (filename: string) => string,
): SanitizedCollectionConfig {
  init(s3Configuration, fileOptions)

  collection.fields = [
    ...collection.fields,
    {
      label: 'S3 URL',
      name: 's3Url',
      type: 'text',
      admin: {
        readOnly: true,
      },
      hooks: {
        beforeChange: [
          (): undefined => undefined,
        ],
        afterRead: [
          ({ data }): string => {
            return getUrl(String(data.filename))
          },
        ],
      },
    },
  ]

  const {
    beforeChange = [],
    afterDelete = [],
  } = collection.hooks || {}

  collection.hooks = {
    ...collection.hooks,
    beforeChange: [
      ...beforeChange,
      uploadToS3,
    ],
    afterDelete: [
      ...afterDelete,
      deleteFromS3,
    ],
  }

  if (isUploadObject(collection.upload)) {
    collection.upload.adminThumbnail = ({ doc }: Doc) => doc.s3Url
  }

  return collection
}
