import deleteHook from './deleteHook'
import { AdapterInterface } from '../adapter'
import { mock as mockInterface } from 'jest-mock-extended'

describe('deleteHook', () => {
  let adapter: AdapterInterface

  beforeEach(() => {
    adapter = mockInterface<AdapterInterface>()
  })

  it('can make a hook that calls adapters delete method', () => {
    const initializedHook = deleteHook(adapter)
    // @ts-expect-error don't need whole object for this test
    initializedHook({ doc: { filename: 'test.jpg' } })
    expect(adapter.delete).toBeCalledTimes(1)
  })
})
