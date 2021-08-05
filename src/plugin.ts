import { Config } from 'payload/config'
import { Field } from 'payload/types'
import { GetAdminThumbnail } from 'payload/dist/uploads/types'
import uploadHook from './hooks/uploadHook'
import deleteHook from './hooks/deleteHook'
import { AdapterInterface } from './adapter'
import getCloudStorageUrlField, { cloudStorageFieldName } from './fields/cloudStorageUrl'

export type CloudStorageCollectionModifiers = {
  fields?: Field[],
  adminThumbnail?: string | GetAdminThumbnail
}

const cloudStorage = (
  adapter: AdapterInterface,
  uploadCollectionModifiers?: CloudStorageCollectionModifiers | false
) => {
  let fields: Field[] = []
  let adminThumbnail: GetAdminThumbnail | string
  if (uploadCollectionModifiers !== false) {
    fields = uploadCollectionModifiers?.fields ?? [getCloudStorageUrlField(adapter)]
    adminThumbnail = uploadCollectionModifiers?.adminThumbnail ?? cloudStorageFieldName
  }

  return (incomingConfig: Config): Config => {
    if (!incomingConfig.collections) {
      return incomingConfig
    }

    const config: Config = {
      ...incomingConfig,
      collections: incomingConfig.collections.map(collection => {
        if (collection.upload === true) {
          collection.upload = {}
        }

        if (typeof collection.upload === 'object' && collection.upload !== null && !Array.isArray(collection.upload)) {
          collection.fields = collection.fields || []
          collection.fields = [
            ...collection.fields,
            ...fields
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

          const existingAT = collection.upload.adminThumbnail
          collection.upload.adminThumbnail = (typeof existingAT === 'string' || typeof existingAT === 'function')
            ? collection.upload.adminThumbnail
            : adminThumbnail
        }

        return collection
      }),
    }

    return config
  }
}

export default cloudStorage
