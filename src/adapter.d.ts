export type UploadedFile = {
  name: string
  data: Buffer
  mimetype: string
}

export type getEndpointUrl = (endpointUrl: string, filename: string) => string

export type UploadMeta = { [key: string]: string }

export type UploadResponse = {
  uploadId?: string,
  uploadMeta: unknown
}

export interface AdapterInterface {
  upload(file: UploadedFile, id?: string): Promise<UploadResponse>
  delete(uploadMeta?: UploadMeta): Promise
  getEndpointUrl(uploadMeta: UploadMeta): string
}
