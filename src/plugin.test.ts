import cloudStorage from './plugin'
import { mock as mockInterface } from 'jest-mock-extended'
import type { AdapterInterface } from './adapter.d'
import { Config } from 'payload/config'

describe('main plugin', () => {
  let adapter: AdapterInterface<unknown, unknown>
  let fakeConfig: Config

  beforeEach(() => {
    adapter = mockInterface<AdapterInterface<unknown, unknown>>()
    fakeConfig = {
      serverURL: '',
      collections: [
        {
          slug: 'image',
          fields: [],
          upload: {}
        },
        {
          fields: [],
          slug: 'image2'
        }
      ]
    }
  })

  it('returns config unaltered if no collections', () => {
    const cs = cloudStorage(adapter)
    const initialized = cs({ serverURL: '' })

    expect(initialized?.collections?.[0]?.hooks?.beforeChange).toBeUndefined()
  })

  it('attaches hooks to upload collections', () => {
    const cs = cloudStorage(adapter)
    const initialized = cs(fakeConfig)

    const hooks1 = initialized?.collections?.[0]?.hooks || {}
    const hooks2 = initialized?.collections?.[1]?.hooks || {}

    expect(hooks1.beforeChange).toHaveLength(1)
    expect(hooks1.afterDelete).toHaveLength(1)
    expect(hooks1.afterRead).toHaveLength(1)

    expect(hooks2.beforeChange).toBeUndefined()
    expect(hooks2.afterDelete).toBeUndefined()
    expect(hooks2.afterRead).toBeUndefined()
  })

  it('attaches hooks to upload collections where upload is not an object', () => {
    const cs = cloudStorage(adapter)
    const initialized = cs({
      serverURL: '',
      collections: [
        {
          slug: 'image',
          fields: [],
          upload: true
        }
      ]
    })

    expect(initialized?.collections?.[0]?.hooks?.beforeChange).toHaveLength(1)
    expect(initialized?.collections?.[0]?.hooks?.afterDelete).toHaveLength(1)
  })

  it('can disable after endpoint properties', () => {
    const cs = cloudStorage(adapter, { disableEndpointProperty: true })

    const initialized = cs(fakeConfig)
    const upload = initialized?.collections?.[0]?.upload

    expect(initialized?.collections?.[0]?.hooks?.afterRead).toHaveLength(0)
    expect(typeof upload === 'boolean' ? false : upload?.adminThumbnail).toBe(undefined)
  })

  it('can set the admin thumbnail property', () => {
    const cs = cloudStorage(adapter, { endpointPropertyName: 'set via cs' })

    const initialized = cs(fakeConfig)
    const upload = initialized?.collections?.[0]?.upload

    expect(typeof upload === 'boolean' ? 'boolean' : typeof upload?.adminThumbnail).toBe('function')
  })

  it('does not override existing adminThumbnails', () => {
    const cs = cloudStorage(adapter, { endpointPropertyName: 'set via cs' })

    const initialized = cs(
      {
        serverURL: '',
        collections: [
          {
            slug: 'image',
            fields: [],
            upload: {
              adminThumbnail: () => 'set via collection'
            }
          }
        ]
      }
    )

    const upload = initialized?.collections?.[0]?.upload

    expect(typeof upload !== 'boolean' && typeof upload?.adminThumbnail === 'function' && upload?.adminThumbnail({ doc: {} })).toBe('set via collection')
  })
})
