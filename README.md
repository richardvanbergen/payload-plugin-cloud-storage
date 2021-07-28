# payload-plugin-cloud-storage

docs coming soon, just looking for feedback right now, I promise it'll be shiny

the idea of this plugin is to implement a simple cloud storage plugin that allows the user to upload thier collections with `upload` to any major cloud storage provider

currently I only support S3 because that's my use case (digital ocean storage)

this hasn't been tested yet, I'm just looking for feedback on the usage pattern

```ts
import { buildConfig } from 'payload/config';

import { S3Adapter } from 'payload-plugin-cloud-storage/adapters/s3';
import cloudStorage from 'payload-plugin-cloud-storage'

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

const config = buildConfig({
  serverURL: 'http://localhost:3000',
  collections: [
    {
      slug: 'images',
      upload: true,
    }
  ],
  plugins: [
    cloudStorage(
      s3Adapater,
      filename => `https://${process.env.SPACES_NAME}.${process.env.SPACES_REGION}.cdn.digitaloceanspaces.com/${filename}`
    ),
  ]
});

export default config;
```