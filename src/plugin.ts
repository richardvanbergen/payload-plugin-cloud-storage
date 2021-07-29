import { SanitizedConfig } from 'payload/config'
import { UploadedFile } from 'express-fileupload'
import { SanitizedCollectionConfig, CollectionBeforeChangeHook, CollectionAfterDeleteHook, Field } from 'payload/types'
import { APIError } from 'payload/errors'
import { AdapterInterface } from './payload-plugin-s3'


function isUploadedFile (object: unknown): object is UploadedFile {
  if (object !== null && typeof object === 'object') {
    return 'mimetype' in object
  }

  return false
}

let adapterInstance: AdapterInterface
const getAdapter = (): AdapterInterface => {
  if (!adapterInstance) {
    throw new APIError("Adapter has not been initialized.")
  }
  return adapterInstance
}

export const uploadHook: CollectionBeforeChangeHook = async ({ data, req }) => {
  if (req?.files?.file) {
    let uploadedFile: UploadedFile
    if (isUploadedFile(req.files.file)) {
      uploadedFile = req.files.file
    } else {
      uploadedFile = req.files.file[0]
    }

    const adapter = getAdapter()
    await adapter.upload(data.filename, uploadedFile)
  }

  return data
}

export const deleteHook: CollectionAfterDeleteHook = async ({ doc }) => {
  const adapter = getAdapter()
  await adapter.delete(doc.filename)
}


const cloudStorage = (
  adapter: AdapterInterface,
  aditionalFields: Field[]
) => {
  adapterInstance = adapter

  return (incommingConfig: SanitizedConfig): SanitizedConfig => {
    const config: SanitizedConfig = {
      ...incommingConfig,
      collections: incommingConfig.collections.map(collection => {
        if (typeof collection.upload === 'object') {
          collection.fields = [
            ...collection.fields,
          ]

          const {
            beforeChange = [],
            afterDelete = [],
          } = collection.hooks || {}

          collection.hooks = {
            ...collection.hooks,
            beforeChange: [
              ...beforeChange,
              uploadHook,
            ],
            afterDelete: [
              ...afterDelete,
              deleteHook,
            ],
          }

          collection.upload.adminThumbnail = ({ doc }: { doc: { cloudStorageUrl: string } }) => doc.cloudStorageUrl
        }

        return collection
      }),
    }

    return config
  }
}

export default cloudStorage
