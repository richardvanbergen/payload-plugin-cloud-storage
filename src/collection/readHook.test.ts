import readHook from './readHook'
import { AdapterInterface, UploadedFile } from '../adapter'
import { mock as mockInterface } from 'jest-mock-extended'

describe('readHook', () => {
  let adapter: AdapterInterface

  beforeEach(() => {
    adapter = mockInterface<AdapterInterface>({
      getEndpointUrl: (filename: string): string => {
        return `path/${filename}`
      }
    })
  })

  it('does not alter if filename missing', async () => {
    const initializedHook = readHook(adapter, 'testProperty')

    // @ts-ignore
    const result = await initializedHook({
      doc: {
      }
    })

    expect(result.testProperty).toBeUndefined()
  })

  it('can add a property to main upload object', async () => {
    const initializedHook = readHook(adapter, 'testProperty')

    // @ts-ignore
    const result = await initializedHook({
      doc: {
        filename: 'test.file'
      }
    })

    expect(result.testProperty).toBe('path/test.file')
  })

  it('can return endpoint for sizes', async () => {
    const initializedHook = readHook(adapter, 'testProperty')

    // @ts-ignore
    const result = await initializedHook({
      doc: {
        filename: 'test.file',
        sizes: {
          mobile: {
            filename: 'resized.file'
          }
        }
      }
    })

    expect(result.testProperty).toBe('path/test.file')
    expect(result.sizes.mobile.testProperty).toBe('path/resized.file')
  })
})
