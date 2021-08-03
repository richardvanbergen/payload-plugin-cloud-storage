import { AdapterInterface } from './payload-plugin-s3'
import cloudStorage, { deleteHook, uploadHook } from './plugin'
import { mock as mockInterface } from 'jest-mock-extended'
import { UploadedFile } from 'express-fileupload'

describe('main plugin', () => {
  let adapter: AdapterInterface
  const testFile = mockInterface<UploadedFile>({
    name: 'test.image'
  })

  beforeEach(() => {
    adapter = mockInterface<AdapterInterface>()
  })

  it('can make a hook that calls adapters delete method', () => {
    const initializedHook = deleteHook(adapter)
    initializedHook({ doc: { filename: 'test.jpg' } })
    expect(adapter.delete).toBeCalledTimes(1)
  })

  it('can make a hook that calls adapters upload method', () => {
    const initializedHook = uploadHook(adapter)
    const data = {
      filename: 'filename.image'
    }

    const req = {
      files: {
        file: testFile
      }
    }

    initializedHook({
      data,
      req
    })

    expect(adapter.upload).toBeCalledWith('filename.image', testFile)
    expect(adapter.upload).toBeCalledTimes(1)
  })

  it('can fetch first file from array of files', () => {
    const initializedHook = uploadHook(adapter)
    const data = {
      filename: 'filename.image'
    }

    const testFile2 = mockInterface<UploadedFile>({
      name: 'test.image'
    })

    const req = {
      files: {
        file: [
          testFile2,
          testFile,
        ]
      }
    }

    initializedHook({
      data,
      req
    })

    expect(adapter.upload).toBeCalledWith('filename.image', testFile2)
    expect(adapter.upload).toBeCalledTimes(1)
  })

  it('attaches hooks to upload collections', () => {
    const cs = cloudStorage(adapter)
    // @ts-ignore
    const initialized = cs({
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
    })
    
    expect(initialized?.collections[0]?.hooks?.beforeChange).toHaveLength(1)
    expect(initialized?.collections[0]?.hooks?.afterDelete).toHaveLength(1)
    
    expect(initialized?.collections[1]?.hooks?.beforeChange).toBeUndefined()
    expect(initialized?.collections[1]?.hooks?.afterDelete).toBeUndefined()
  })

  it('appends fields to uploadCollectionModifiers', () => {
    const cs = cloudStorage(adapter, {
      fields: [
        {
          name: 'extra field',
          type: 'text',
        }
      ]
    })

    // @ts-ignore
    const initialized = cs(
      {
        collections: [
          // @ts-ignore
          {
            slug: 'image',
            // @ts-ignore
            upload: {},
            fields: [
              // @ts-ignore
              {
                name: 'test'
              }
            ]
          },
        ]
      }
    )
    
    expect(initialized?.collections[0]?.fields[1]?.name).toBe('extra field')
  })

  it('sets the adminThumbnail', () => {
    const cs = cloudStorage(adapter, {
      adminThumbnail: () => 'set via cs'
    })

    // @ts-ignore
    const initialized = cs(
      {
        collections: [
          // @ts-ignore
          {
            slug: 'image',
            // @ts-ignore
            upload: {
            },
            fields: [
            ]
          },
        ]
      }
    )
    
    // @ts-ignore
    expect(initialized?.collections[0]?.upload?.adminThumbnail()).toBe('set via cs')
  })

  it('does not override exisint adminThumbnails', () => {
    const cs = cloudStorage(adapter, {
      adminThumbnail: () => 'set via cs'
    })

    // @ts-ignore
    const initialized = cs(
      {
        collections: [
          // @ts-ignore
          {
            slug: 'image',
            // @ts-ignore
            upload: {
              adminThumbnail: () => 'set via collection'
            },
            fields: [
            ]
          },
        ]
      }
    )
    
    // @ts-ignore
    expect(initialized?.collections[0]?.upload?.adminThumbnail()).toBe('set via collection')
  })
})