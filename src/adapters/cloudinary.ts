import { AdapterInterface, UploadedFile } from '../adapter'
import { UploadApiErrorResponse, UploadApiOptions, UploadApiResponse, v2 as cloudinary } from 'cloudinary'
import streamifier from 'streamifier'

export default class CloudinaryAdapter implements AdapterInterface<UploadApiResponse, void> {
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

  // getEndpointUrl (filename: string) {
  //   return ''
  // }

  async upload (file: UploadedFile): Promise<UploadApiResponse> {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      streamifier.createReadStream(file.data)
        .pipe(cloudinary.uploader.upload_stream(
          this.options,
          (err?: UploadApiErrorResponse, callResult?: UploadApiResponse) => {
            if (err) {
              return reject(err)
            }

            if (callResult) {
              return resolve(callResult)
            }

            throw new Error('Cloudinary API no response')
          }
        ))
    })
  }

  // async delete (filename: string): Promise<void> {
  //   cloudinary.uploader.destroy(public_id, options, callback)
  // }
}
