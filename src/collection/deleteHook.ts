import { CollectionAfterDeleteHook } from 'payload/types'
import type { AdapterInterface } from '../adapter.d'

export const deleteHook = (adapter: AdapterInterface<unknown, unknown>) => {
  const afterDelete: CollectionAfterDeleteHook = async (args) => {
    const { doc } = args
    await adapter.delete(doc.filename)
  }

  return afterDelete
}

export default deleteHook
