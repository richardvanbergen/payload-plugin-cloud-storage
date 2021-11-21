export type UploadedFile = {
  name: string
  data: Buffer
  mimetype: string
}

export type getEndpointUrl = (endpointUrl: string, filename: string) => string

export interface AdapterInterface {
  upload(file: UploadedFile): Promise<void>
  delete(filename: string): Promise<void>
  getEndpointUrl(filename: string): string
}
