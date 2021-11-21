import { AdapterInterface, UploadedFile } from '../adapter';
import { UploadApiOptions, v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier'

export default class S3Adapter implements AdapterInterface {
  options: UploadApiOptions

  constructor(cloudName: string, apiKey: string, apiSecret: string, options: UploadApiOptions) {
    cloudinary.config({
      cloud_name: cloudName, 
      api_key: apiKey, 
      api_secret: apiSecret,
      secure: true
    })

    this.options = options
  }

  getEndpointUrl(filename: string) {
    return '';
  }

  async upload(file: UploadedFile): Promise<void> {
    return new Promise((resolve, reject) => {
      streamifier.createReadStream(file.data).pipe(cloudinary.uploader.upload_stream(
        this.options,
        (error: any, result: any) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        }
      ));
    });
  }

  async delete(filename: string): Promise<void> {
    cloudinary.uploader.destroy(public_id, options, callback);
  }
}
