# payload-plugin-cloud-storage

## todo

- [] Tidy up documention
- [] Publish to NPM
- [] Create workflow for publishing to NPM
- [] Add support for upload `sizes`
- [] Add cloudinary support (?)
- [] Test in situation
- [] Add option for disabling local storage

docs coming soon, just looking for feedback right now, I promise it'll be shiny

the idea of this plugin is to implement a simple cloud storage plugin that allows the user to upload thier collections with `upload` to any major cloud storage provider

currently I only support S3 because that's my use case (digital ocean storage)

this hasn't been tested yet, I'm just looking for feedback on the usage pattern

```ts
// src/plugins/cloudStorage.ts
import { Field } from 'payload/types'
import { S3Adapter } from 'payload-plugin-cloud-storage/adapters/s3';

/**
 * `S3Adapter` is simply a class that implements `AdapterInterface` this
 * pattern should support any cloud service provider that:
 * 
 * 1. Allows you to push binary objects to a store with a name.
 * 2. Allows you to delete an object from the store.
 * 3. Provides an endpoint that we can reference when the collection is queried.
 */
const s3Adapater = new S3Adapter(
  {
    endpoint: `https://${process.env.SPACES_REGION}.digitaloceanspaces.com`,
    region: 'fra1',
    credentials: {
      accessKeyId: process.env.SPACES_KEY,
      secretAccessKey: process.env.SPACES_SECRET,
    },
  },
  {
    bucket: process.env.SPACES_NAME,
  },
)


/**
 * You may also want to attach additionl fields on all upload collections.
 * 
 * For example you might want to specify a way of outputting the full CDN path of files that get uoloaded in your API responses.
 * 
 * You can pass in these field definitions using the second optional parameter to `cloudStorage()`
 */
export const cloudStorageFields: Field[] = [
  {
    label: 'Cloud Storage URL',
    name: 'cloudStorageUrl',
    type: 'text',
    admin: {
      readOnly: true,
    },
    hooks: {
      beforeChange: [
        (): undefined => undefined,
      ],
      afterRead: [
        ({ data }): string => {
          return `https://${process.env.SPACES_NAME}.${process.env.SPACES_REGION}.cdn.digitaloceanspaces.com/${data.filename}`
        },
      ],
    },
  },
]

/**
 * Finally you can also specify how to fetch the admin URL using the same signature as if you would for other colections.
 * 
 * This does not override any exising `upload.adminThumbnail` on your collection.
 */
const adminThumbnail: GetAdminThumbnail = (args) => {
  if (typeof args?.doc?.cloudStorageUrl === 'string') {
    return args?.doc?.cloudStorageUrl
  }

  // or handle missing image some other way
  return ''
}

```

```ts
// src/payload.config.ts
import { buildConfig } from 'payload/config';
import cloudStorage from 'payload-plugin-cloud-storage'
import { s3Adapater, cloudStorageFields, adminThumbnail } from './plugins/cloudStorage.ts'

const config = buildConfig({
  serverURL: 'http://localhost:3000',
  collections: [
    {
      slug: 'images',
      upload: true, // uploads being enabled is what enables this plugin on the collection
      fields: []
    }
  ],
  plugins: [
    cloudStorage(
      s3Adapater,
      {
        fields: cloudStorageFields,
        adminThumbnail: adminThumbnail
      }
    ),
  ]
});

export default config;
```

You may also want to attach additionl fields on all upload collections. For example you might want to specify a way of outputting the full CDN path of files that get uoloaded in your API responses.