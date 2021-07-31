import { UploadedFile } from 'express-fileupload'
import { CollectionBeforeChangeHook } from 'payload/types'
import { AdapterInterface } from '../plugin'

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

        await adapter.upload(data.filename, uploadedFile)
      }

      return data
    }
  }

  return beforeChange
}

export default uploadHook