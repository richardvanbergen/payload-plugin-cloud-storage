import { CollectionAfterDeleteHook } from 'payload/types'
import { AdapterInterface } from '../plugin'

export const deleteHook = (adapter: AdapterInterface) => {
  const afterDelete: CollectionAfterDeleteHook = async (args) => {
    if (args) {
      const { doc } = args
      await adapter.delete(doc.filename)
    }
  }

  return afterDelete
}

export default deleteHook