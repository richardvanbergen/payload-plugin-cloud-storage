import { Config } from 'payload/config'
import { GetAdminThumbnail } from 'payload/dist/uploads/types'
import uploadHook from './collection/uploadHook'
import deleteHook from './collection/deleteHook'
import readHook from './collection/readHook'
import { AdapterInterface } from './adapter'
import isImage from './validation/isImage'
import shouldApplyAdminThumbnail from './validation/shouldApplyAdminThumbnail'

export type CloudStoragePluginOptions = {
  disableEndpointProperty?: boolean
  endpointPropertyName?: string
}

type Sizes = {
  [key: string]: {
    [key: string]: string
  }
}

const getAdminThumbnailFn = (endpointPropertyName: string, existingValue: unknown): GetAdminThumbnail => {
  return ({ doc }) => {
    if (isImage(doc?.mimeType)) {
      const sizes = doc?.sizes as Sizes
      if (typeof existingValue === 'string') {
        const targetSize = sizes?.[existingValue]?.[endpointPropertyName]
        if (targetSize) {
          return targetSize
        }
      }

      return doc[endpointPropertyName] as string
    }

    return ''
  }
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

          // if has string or empty thumbnail property
          if (options?.disableEndpointProperty !== true && shouldApplyAdminThumbnail(collection?.upload?.adminThumbnail)) {
            collection.upload.adminThumbnail = getAdminThumbnailFn(endpointFieldName, collection.upload.adminThumbnail)
          }
        }

        return collection
      }),
    }

    return config
  }
}

export default cloudStorage
