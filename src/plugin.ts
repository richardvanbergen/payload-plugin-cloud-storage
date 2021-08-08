import { Config } from 'payload/config'
import { Field } from 'payload/types'
import { GetAdminThumbnail } from 'payload/dist/uploads/types'
import uploadHook from './hooks/uploadHook'
import deleteHook from './hooks/deleteHook'
import readHook from './hooks/readHook'
import { AdapterInterface } from './adapter'

export type CloudStoragePluginOptions = {
  disableEndpointProperty?: boolean
  endpointPropertyName?: string
}

const cloudStorage = (
  adapter: AdapterInterface,
  options?: CloudStoragePluginOptions
) => {
  let endpointFieldName = options?.endpointPropertyName ?? 'cloudStorageUrl'

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
          const {
            beforeChange = [],
            afterDelete = [],
            afterRead = []
          } = collection.hooks || {}

          const composedReadHooks = options?.disableEndpointProperty === true
            ? afterRead
            : [...afterRead, readHook(adapter, endpointFieldName)]

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
            afterRead: composedReadHooks
          }

          const hasExistingAdminThumbnail = typeof collection.upload.adminThumbnail === 'string' || typeof collection.upload.adminThumbnail === 'function'
          if (options?.disableEndpointProperty !== true && !hasExistingAdminThumbnail) {
            collection.upload.adminThumbnail = endpointFieldName
          }
        }

        return collection
      }),
    }

    return config
  }
}

export default cloudStorage
