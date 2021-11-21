import deleteHook from './deleteHook'
import type { AdapterInterface } from '../adapter.d'
import { mock as mockInterface } from 'jest-mock-extended'

describe('deleteHook', () => {
  let adapter: AdapterInterface<void, void>

  beforeEach(() => {
    adapter = mockInterface<AdapterInterface<void, void>>()
  })

  it('can make a hook that calls adapters delete method', () => {
    const initializedHook = deleteHook(adapter)
    // @ts-expect-error don't need whole object for this test
    initializedHook({ doc: { filename: 'test.jpg' } })
    expect(adapter.delete).toBeCalledTimes(1)
  })
})
