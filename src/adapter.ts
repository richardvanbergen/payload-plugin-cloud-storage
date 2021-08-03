import { UploadedFile } from "express-fileupload";

export type getEndpointUrl = (baseUrl: string, file: UploadedFile) => string;

export interface AdapterInterface {
  upload(filename: string, file: UploadedFile): Promise<void>;
  delete(filename: string): Promise<void>;
  getEndpointUrl: getEndpointUrl;
}