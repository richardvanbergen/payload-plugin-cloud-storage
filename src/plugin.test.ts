import cloudStorage from './plugin'
import { mock as mockInterface } from 'jest-mock-extended'
import { UploadedFile } from 'express-fileupload'
import uploadHook from './hooks/uploadHook'
import { AdapterInterface } from './adapter'
import { Config } from 'payload/config'

describe('main plugin', () => {
  let adapter: AdapterInterface
  let fakeConfig: Config 
  const testFile = mockInterface<UploadedFile>({
    name: 'test.image'
  })

  beforeEach(() => {
    adapter = mockInterface<AdapterInterface>()
    fakeConfig = {
      collections: [
        // @ts-ignore
        {
          slug: 'image',
          // @ts-ignore
          upload: {},
        },
        // @ts-ignore
        {
          slug: 'image2',
        }
      ]
    }
  })

  it('attaches hooks to upload collections', () => {
    const cs = cloudStorage(adapter)
    const initialized = cs(fakeConfig)
    
    // @ts-ignore
    expect(initialized?.collections[0]?.hooks?.beforeChange).toHaveLength(1)
    // @ts-ignore
    expect(initialized?.collections[0]?.hooks?.afterDelete).toHaveLength(1)
    // @ts-ignore
    expect(initialized?.collections[0]?.hooks?.afterRead).toHaveLength(1)
    
    // @ts-ignore
    expect(initialized?.collections[1]?.hooks?.beforeChange).toBeUndefined()
    // @ts-ignore
    expect(initialized?.collections[1]?.hooks?.afterDelete).toBeUndefined()
    // @ts-ignore
    expect(initialized?.collections[1]?.hooks?.afterRead).toBeUndefined()
  })

  it('attaches hooks to upload collections where upload is not an object', () => {
    const cs = cloudStorage(adapter)
    // @ts-ignore
    const initialized = cs({
      collections: [
        // @ts-ignore
        {
          slug: 'image',
          // @ts-ignore
          upload: true,
        },
      ]
    })
    
    // @ts-ignore
    expect(initialized?.collections[0]?.hooks?.beforeChange).toHaveLength(1)
    // @ts-ignore
    expect(initialized?.collections[0]?.hooks?.afterDelete).toHaveLength(1)
  })

  it('can disable after endpoint properties', () => {
    const cs = cloudStorage(adapter, { disableEndpointProperty: true })

    // @ts-ignore
    const initialized = cs(fakeConfig)
    
    // @ts-ignore
    expect(initialized?.collections[0]?.hooks?.afterRead).toHaveLength(0)
    // @ts-ignore
    expect(initialized?.collections[0]?.upload?.adminThumbnail).toBe(undefined)
  })

  it('can set the admin thumbnail property', () => {
    const cs = cloudStorage(adapter, { endpointPropertyName: 'set via cs' })

    const initialized = cs(fakeConfig)
    
    // @ts-ignore
    expect(initialized?.collections[0]?.upload?.adminThumbnail).toBe('set via cs')
  })

  it('does not override existing adminThumbnails', () => {
    const cs = cloudStorage(adapter, { endpointPropertyName: 'set via cs' })

    const initialized = cs(
      // @ts-ignore
      {
        collections: [
          // @ts-ignore
          {
            slug: 'image',
            // @ts-ignore
            upload: {
              adminThumbnail: 'set via collection'
            },
          },
        ]
      }
    )
    
    // @ts-ignore
    expect(initialized?.collections[0]?.upload?.adminThumbnail).toBe('set via collection')
  })
})