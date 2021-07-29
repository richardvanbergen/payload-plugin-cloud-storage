import { UploadedFile } from 'express-fileupload'
import { Field } from 'payload/types'
import { GetAdminThumbnail } from 'payload/dist/uploads/types'

export interface AdapterInterface {
  upload(filename: string, file: UploadedFile): Promise<void>;
  delete(filename: string): Promise<void>;
}

export type S3PluginCollectionModifiers = {
  fields: Field[],
  adminThumbnail: string | GetAdminThumbnail | undefined
}