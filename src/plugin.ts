import { Config } from 'payload/config'
import uploadHook from './collection/uploadHook'
import deleteHook from './collection/deleteHook'
import readHook from './collection/readHook'
import type { AdapterInterface } from './adapter.d'
import initAdminThumbnail from './collection/adminThumbnail'
import shouldApplyAdminThumbnail from './validation/shouldApplyAdminThumbnail'

export type CloudStoragePluginOptions = {
  disableEndpointProperty?: boolean
  endpointPropertyName?: string
  disableLocalStorage?: boolean
}

const cloudStorage = (
  adapter: AdapterInterface<unknown, unknown>,
  options?: CloudStoragePluginOptions
) => {
  const endpointFieldName = options?.endpointPropertyName ?? 'cloudStorageUrl'
  const disableLocalStorage = options?.disableLocalStorage ?? true

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
              uploadHook(adapter)
            ],
            afterDelete: [
              ...afterDelete,
              deleteHook(adapter)
            ],
            afterRead: composedReadHooks
          }

          if (options?.disableEndpointProperty !== true && shouldApplyAdminThumbnail(collection?.upload?.adminThumbnail)) {
            collection.upload.adminThumbnail = initAdminThumbnail(endpointFieldName, collection.upload.adminThumbnail)
          }

          collection.upload.disableLocalStorage = disableLocalStorage
        }

        return collection
      })
    }

    return config
  }
}

export default cloudStorage
