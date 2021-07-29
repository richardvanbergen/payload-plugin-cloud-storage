import { SanitizedConfig } from 'payload/config'
import { UploadedFile } from 'express-fileupload'
import { CollectionBeforeChangeHook, CollectionAfterDeleteHook } from 'payload/types'
import { AdapterInterface, S3PluginCollectionModifiers } from './payload-plugin-s3'

export const uploadHook = (adapter: AdapterInterface) => {
  const beforeChange: CollectionBeforeChangeHook = async (args) => {
    if (args) {
      const { req, data } = args
      if (req?.files?.file) {
        let uploadedFile: UploadedFile
        if (Array.isArray(req.files.file)) {
          uploadedFile = req.files.file[0]
        } else {
          uploadedFile = req.files.file
        }

        await adapter.upload(data.filename, uploadedFile)
      }

      return data
    }
  }

  return beforeChange
}

export const deleteHook = (adapter: AdapterInterface) => {
  const afterDelete: CollectionAfterDeleteHook = async (args) => {
    if (args) {
      const { doc } = args
      await adapter.delete(doc.filename)
    }
  }

  return afterDelete
}

const cloudStorage = (
  adapter: AdapterInterface,
  uploadCollectionModifiers?: S3PluginCollectionModifiers
) => {
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
              uploadHook(adapter),
            ],
            afterDelete: [
              ...afterDelete,
              deleteHook(adapter),
            ],
          }

          if (uploadCollectionModifiers?.adminThumbnail && typeof collection?.upload?.adminThumbnail === 'undefined') {
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
