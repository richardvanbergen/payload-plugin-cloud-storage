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
  const autoAddFields = uploadCollectionModifiers?.fields !== false

  return (incommingConfig: Config): Config => {
    if (!incommingConfig.collections) {
      return incommingConfig
    }

    const fieldDefaults = autoAddFields ? [getCloudStorageUrlField(adapter)] : []
    const additionalFields = uploadCollectionModifiers?.fields || fieldDefaults

    const config: Config = {
      ...incommingConfig,
      collections: incommingConfig.collections.map(collection => {
        if (collection.upload === true) {
          collection.upload = {}
        }

        if (typeof collection.upload === 'object' && collection.upload !== null && !Array.isArray(collection.upload)) {
          collection.fields = collection.fields || []
          collection.fields = [
            ...collection.fields,
            ...additionalFields
          ]

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
