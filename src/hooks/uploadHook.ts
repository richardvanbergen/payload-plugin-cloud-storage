import { UploadedFile } from 'express-fileupload'
import { CollectionBeforeChangeHook } from 'payload/types'
import { AdapterInterface } from '../adapter'

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

        const resizedBuffers = req.payloadUploadSizes
          ? Object.keys(req.payloadUploadSizes).map(uploadSize => {
            const name = data?.sizes?.[uploadSize]?.filename
            const mimeType = data?.sizes?.[uploadSize]?.mimeType
            const buffer = req?.payloadUploadSizes?.[uploadSize]
            if (name && mimeType && buffer) {
              return adapter.upload({
                name,
                data: buffer,
                mimetype: mimeType
              })
            }
          })
          : []

        await Promise.all([adapter.upload(uploadedFile), ...resizedBuffers])
      }

      return data
    }
  }

  return beforeChange
}

export default uploadHook