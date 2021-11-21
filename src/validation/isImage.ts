export default function isImage (mimeType: unknown): boolean {
  if (typeof mimeType === 'string') {
    return ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'].indexOf(mimeType) > -1
  }

  return false
}
