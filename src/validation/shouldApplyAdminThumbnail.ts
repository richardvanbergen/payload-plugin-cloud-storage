import { GetAdminThumbnail } from 'payload/dist/uploads/types'

export default function shouldApplyAdminThumbnail (thumbnailProp: string | GetAdminThumbnail | undefined) {
  return typeof thumbnailProp === 'string' || typeof thumbnailProp === 'undefined' || thumbnailProp === null
}
