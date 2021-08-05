import cloudStorage from './plugin'
import { mock as mockInterface } from 'jest-mock-extended'
import { UploadedFile } from 'express-fileupload'
import deleteHook from './hooks/deleteHook'
import uploadHook from './hooks/uploadHook'
import { AdapterInterface } from './adapter'

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
    // @ts-ignore
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
    // @ts-ignore
      req
    })

    expect(adapter.upload).toBeCalledWith('filename.image', testFile)
    expect(adapter.upload).toBeCalledTimes(1)
  })

  it.todo('uploads sizes')

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
      // @ts-ignore
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
    
    // @ts-ignore
    expect(initialized?.collections[0]?.hooks?.beforeChange).toHaveLength(1)
    // @ts-ignore
    expect(initialized?.collections[0]?.hooks?.afterDelete).toHaveLength(1)
    
    // @ts-ignore
    expect(initialized?.collections[1]?.hooks?.beforeChange).toBeUndefined()
    // @ts-ignore
    expect(initialized?.collections[1]?.hooks?.afterDelete).toBeUndefined()
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
    expect(initialized?.collections[0]?.hooks?.afterDelete).toHaveLength(1)  })

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
    
    // @ts-ignores
    expect(initialized?.collections[0]?.fields[1]?.name).toBe('extra field')
  })

  it('sets the adminThumbnail', () => {
    const cs = cloudStorage(adapter, {
      adminThumbnail: () => 'set via cs'
    })

    const initialized = cs(
      // @ts-ignore
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

  it('does not override existing adminThumbnails', () => {
    const cs = cloudStorage(adapter, {
      adminThumbnail: () => 'set via cs'
    })

    const initialized = cs(
      // @ts-ignore
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

  it('provides a default virtual field for cloudStorageUrl', () => {
    const cs = cloudStorage(adapter)

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
    expect(initialized?.collections?.[0]?.fields?.[0]?.name).toBe('cloudStorageUrl')
  })

  it('can specify to remove virtual field for cloudStorageUrl', () => {
    const cs = cloudStorage(adapter, false)

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
    expect(initialized?.collections?.[0]?.fields?.[0]?.name).toBeUndefined()
  })

  it('adds an adminThumbnail if default field is added', () => {
    const cs1 = cloudStorage(adapter)
    const cs2 = cloudStorage(adapter, false)

    const initialized1 = cs1({
      collections: [
        // @ts-ignore
        {
          slug: 'image',
          // @ts-ignore
          upload: true,
        },
      ]
    })

    const initialized2 = cs2({
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
    expect(initialized1?.collections?.[0]?.upload?.adminThumbnail).toBe('cloudStorageUrl')
    // @ts-ignore
    expect(initialized2?.collections?.[0]?.upload?.adminThumbnail).toBeUndefined()
  })
})