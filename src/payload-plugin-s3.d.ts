import { UploadedFile } from 'express-fileupload'

export interface AdapterInterface {
  upload(filename: string, file: UploadedFile): Promise<void>;
  delete(filename: string): Promise<void>;
}