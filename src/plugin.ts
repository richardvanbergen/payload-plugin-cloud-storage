import { SanitizedConfig } from 'payload/config'
import { UploadedFile } from 'express-fileupload'
import { CollectionBeforeChangeHook, CollectionAfterDeleteHook } from 'payload/types'
// @ts-ignore
import { APIError } from 'payload/errors'
import { AdapterInterface, S3PluginCollectionModifiers } from './payload-plugin-s3'

let adapterInstance: AdapterInterface
const getAdapter = (): AdapterInterface => {
  if (!adapterInstance) {
    throw new APIError("Adapter has not been initialized.")
  }
  return adapterInstance
}

export const uploadHook: CollectionBeforeChangeHook = async (args) => {
  if (args) {
    const { req, data } = args
    if (req?.files?.file) {
      let uploadedFile: UploadedFile
      if (Array.isArray(req.files.file)) {
        uploadedFile = req.files.file[0]
      } else {
        uploadedFile = req.files.file
      }

      const adapter = getAdapter()
      await adapter.upload(data.filename, uploadedFile)
    }

    return data
  }
}

export const deleteHook: CollectionAfterDeleteHook = async (args) => {
  if (args) {
    const { doc } = args
    const adapter = getAdapter()
    await adapter.delete(doc.filename)
  }
}

const cloudStorage = (
  adapter: AdapterInterface,
  uploadCollectionModifiers?: S3PluginCollectionModifiers
) => {
  adapterInstance = adapter
  return (incommingConfig: SanitizedConfig): SanitizedConfig => {
    const config: SanitizedConfig = {
      ...incommingConfig,
      collections: incommingConfig.collections.map(collection => {
        if (typeof collection.upload === 'object') {
          if (Array.isArray(uploadCollectionModifiers?.fields) && uploadCollectionModifiers?.fields.length) {
            collection.fields = [
              ...collection.fields,
              ...uploadCollectionModifiers.fields
            ]
          }

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

          if (uploadCollectionModifiers?.adminThumbnail) {
            collection.upload.adminThumbnail = uploadCollectionModifiers.adminThumbnail
          }
        }

        return collection
      }),
    }

    return config
  }
}

export default cloudStorage
