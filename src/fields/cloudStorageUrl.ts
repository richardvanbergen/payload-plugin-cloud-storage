import { Field } from 'payload/types'
import { AdapterInterface } from '../adapter'

const getCloudStorageUrlField = (adapter: AdapterInterface): Field => {
  return {
    label: 'Cloud Storage URL',
    name: 'cloudStorageUrl',
    type: 'text',
    admin: {
      readOnly: true,
    },
    hooks: {
      beforeChange: [
        (): undefined => undefined,
      ],
      afterRead: [
        ({ data }): string => adapter.getEndpointUrl(data)
      ],
    },
  }
}

export default getCloudStorageUrlField
