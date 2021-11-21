import { GetAdminThumbnail } from 'payload/dist/uploads/types'
import isImage from '../validation/isImage'

type Sizes = {
  [key: string]: {
    [key: string]: string
  }
}

const initAdminThumbnail = (endpointPropertyName: string, existingValue: unknown): GetAdminThumbnail => {
  return (args) => {
    if (args?.doc && isImage(args.doc?.mimeType)) {
      const { doc } = args
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

export default initAdminThumbnail
