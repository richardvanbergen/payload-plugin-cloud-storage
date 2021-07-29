import { AdapterInterface } from './payload-plugin-s3'
import { deleteHook, uploadHook } from './plugin'
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
    // @ts-expect-error don't need to mock out entire request
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
      // @ts-expect-error don't need to mock out entire request
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
      // @ts-expect-error don't need to mock out entire request
      req
    })

    expect(adapter.upload).toBeCalledWith('filename.image', testFile2)
    expect(adapter.upload).toBeCalledTimes(1)
  })
})