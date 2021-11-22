import { AdapterInterface, UploadedFile, UploadMeta, UploadResponse } from '../adapter'
import { UploadApiErrorResponse, UploadApiOptions, UploadApiResponse, v2 as cloudinary } from 'cloudinary'
import streamifier from 'streamifier'

export default class CloudinaryAdapter implements AdapterInterface {
  options: UploadApiOptions

  constructor (cloudName: string, apiKey: string, apiSecret: string, options: UploadApiOptions) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true
    })

    this.options = options
  }

  getEndpointUrl (uploadMeta: UploadMeta) {
    return uploadMeta?.cloudinarySecureUrl
  }

  async upload (file: UploadedFile, uploadId?: string): Promise<UploadResponse> {
    return new Promise<UploadResponse>((resolve, reject) => {
      streamifier.createReadStream(file.data)
        .pipe(cloudinary.uploader.upload_stream(
          this.options,
          (err?: UploadApiErrorResponse, callResult?: UploadApiResponse) => {
            if (err) {
              return reject(err)
            }

            if (callResult) {
              return resolve({
                uploadId,
                uploadMeta: {
                  cloudinarySecureUrl: callResult.secure_url,
                  cloudinaryPublicId: callResult.public_id
                }
              })
            }

            throw new Error('Cloudinary API no response')
          }
        ))
    })
  }

  async delete (uploadMeta: UploadMeta): Promise<void> {
    if (uploadMeta?.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(uploadMeta.cloudinaryPublicId)
    }

    throw new Error('Unable to delete image. Missing public ID.')
  }
}
