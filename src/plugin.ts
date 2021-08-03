import { Config } from 'payload/config'
import { Field } from 'payload/types'
import { GetAdminThumbnail } from 'payload/dist/uploads/types'
import uploadHook from './hooks/uploadHook'
import deleteHook from './hooks/deleteHook'
import { AdapterInterface } from './adapter'
import getCloudStorageUrlField from './fields/cloudStorageUrl'

export type CloudStorageCollectionModifiers = {
  fields?: Field[] | false | undefined,
  adminThumbnail?: string | GetAdminThumbnail | false | undefined
}

const cloudStorage = (
  adapter: AdapterInterface,
  uploadCollectionModifiers?: CloudStorageCollectionModifiers
) => {
  return (incommingConfig: Config): Config => {
    if (!incommingConfig.collections) {
      return incommingConfig
    }

    let additionalFields: Field[] = []
    if (uploadCollectionModifiers?.fields !== false) {
      additionalFields = uploadCollectionModifiers?.fields ?? [getCloudStorageUrlField(adapter)]
    }

    const config: Config = {
      ...incommingConfig,
      collections: incommingConfig.collections.map(collection => {
        if (typeof collection.upload === 'object') {
          if (Array.isArray(uploadCollectionModifiers?.fields) && uploadCollectionModifiers?.fields.length) {
            collection.fields = [
              ...collection.fields,
              ...additionalFields
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
