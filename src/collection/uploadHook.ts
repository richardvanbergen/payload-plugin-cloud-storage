import { CollectionBeforeChangeHook } from 'payload/types'
import type { AdapterInterface, UploadedFile } from '../adapter.d'

const uploadHook = (adapter: AdapterInterface, cloudMetadataPropertyName: string) => {
  const beforeChange: CollectionBeforeChangeHook = async (args) => {
    const { req, data } = args
    if (req?.files?.file) {
      let uploadedFile: UploadedFile
      if (Array.isArray(req.files.file)) {
        uploadedFile = req.files.file[0]
      } else {
        uploadedFile = req.files.file
      }

      const resizedBuffers = req.payloadUploadSizes
        ? Object.keys(req.payloadUploadSizes)
          .map(uploadSize => {
            const name = data?.sizes?.[uploadSize]?.filename
            const mimetype = uploadedFile?.mimetype
            const buffer = req?.payloadUploadSizes?.[uploadSize]

            if (name && mimetype && buffer) {
              return adapter.upload(
                {
                  name,
                  data: buffer,
                  mimetype: mimetype
                },
                uploadSize
              )
            }

            return null
          })
          .filter(buffer => buffer !== null)
        : []

      const responses = await Promise.all(resizedBuffers)
      data.sizes = data?.sizes?.map((size: { [x: string]: unknown }, index: string) => {
        const metaData = responses.find(response => response?.uploadId === index)
        if (metaData?.uploadMeta) {
          size[cloudMetadataPropertyName] = metaData.uploadMeta
        }

        return size
      })

      const uploadResponse = await adapter.upload(uploadedFile)
      data[cloudMetadataPropertyName] = uploadResponse.uploadMeta

      return data
    }
  }

  return beforeChange
}

export default uploadHook
