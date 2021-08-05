import { UploadedFile } from 'express-fileupload'
import { CollectionBeforeChangeHook } from 'payload/types'
import { AdapterInterface } from '../adapter'
import sharp from 'sharp'

const uploadHook = (adapter: AdapterInterface) => {
  const beforeChange: CollectionBeforeChangeHook = async (args) => {
    if (args) {
      const { req, data } = args
      if (req?.files?.file) {
        let uploadedFile: UploadedFile
        if (Array.isArray(req.files.file)) {
          uploadedFile = req.files.file[0]
        } else {
          uploadedFile = req.files.file
        }

        if (data?.sizes) {
          for (const i in data.sizes) {
            const currentSize = data.sizes[i]
            const { width, height } = currentSize
            const resizedFile = await sharp(uploadedFile.data)
              .resize({
                width,
                height,
                fit: 'cover'
              })
              .toBuffer({
                resolveWithObject: true,
              })

            await adapter.upload(currentSize.filename, {
              data: resizedFile.data,
              mimetype: uploadedFile.mimetype
            })
          }
        }

        await adapter.upload(data.filename, uploadedFile)
      }

      return data
    }
  }

  return beforeChange
}

export default uploadHook