import { Field } from 'payload/types'
import { AdapterInterface } from '../adapter'

export const cloudStorageFieldName = 'cloudStorageUrl'

const getCloudStorageUrlField = (adapter: AdapterInterface): Field => {
  return {
    label: 'Cloud Storage URL',
    name: cloudStorageFieldName,
    type: 'text',
    admin: {
      readOnly: true,
    },
    hooks: {
      beforeChange: [
        (): undefined => undefined,
      ],
      afterRead: [
        ({ data }) => {
          if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
            return adapter.getEndpointUrl(data)
          }
        }
      ],
    },
  }
}

export default getCloudStorageUrlField
