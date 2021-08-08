import { CollectionAfterReadHook } from 'payload/types'
import { AdapterInterface } from '../adapter'

const readHook = (adapter: AdapterInterface, propertyName: string) => {
  const afterReadHook: CollectionAfterReadHook = async ({ doc }) => {
    if (typeof doc.filename === 'string') {
      doc[propertyName] = adapter.getEndpointUrl(doc.filename)
    }

    if (typeof doc.sizes === 'object' && doc.sizes !== null && !Array.isArray(doc.sizes)) {
      for (const i in doc.sizes) {
        doc.sizes[i][propertyName] = adapter.getEndpointUrl(doc.filename)
      }
    }

    return doc
  }

  return afterReadHook
}

export default readHook
