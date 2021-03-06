import { CollectionAfterReadHook } from 'payload/types'
import type { AdapterInterface } from '../adapter.d'

const readHook = (adapter: AdapterInterface<unknown, unknown>, propertyName: string) => {
  const afterReadHook: CollectionAfterReadHook = async ({ doc }) => {
    if (typeof doc.filename === 'string') {
      doc[propertyName] = adapter.getEndpointUrl(doc.filename)
    }

    if (typeof doc.sizes === 'object' && doc.sizes !== null && !Array.isArray(doc.sizes)) {
      for (const i in doc.sizes) {
        if (typeof doc.sizes[i].filename === 'string') {
          doc.sizes[i][propertyName] = adapter.getEndpointUrl(doc.sizes[i].filename)
        }
      }
    }

    return doc
  }

  return afterReadHook
}

export default readHook
