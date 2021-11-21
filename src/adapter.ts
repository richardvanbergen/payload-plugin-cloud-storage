export type UploadedFile = {
  name: string
  data: Buffer
  mimetype: string
}

export type getEndpointUrl = (endpointUrl: string, filename: string) => string

export interface AdapterInterface<UploadResponse, DeleteResponse> {
  upload(file: UploadedFile): Promise<UploadResponse>
  delete(filename: string): Promise<DeleteResponse>
  getEndpointUrl(filename: string): string
}
