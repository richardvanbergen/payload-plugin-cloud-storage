<h1 align="center">Payload Plugin - Cloud Storage</h1>

<p align="center">A plugin for <a href="https://github.com/payloadcms/payload">Payload</a> allowing you to easily use remote storage for all your uploads.</p>

<p align="center">
  <img src="https://img.shields.io/github/workflow/status/richardvanbergen/payload-plugin-cloud-storage/Test">
  <img alt="npm" src="https://img.shields.io/npm/v/payload-plugin-cloud-storage">
</p>



## Installation

```
npm i plugin-payload-cloud-storage
```

```
yarn add plugin-payload-cloud-storage
```

## Basic Usage

### 1. Instantiate an adapter

Adapters encapsulate all vendor-specific configuration and API calls.

Currently we only support S3 or S3-compatible APIs (like DigitalOcean spaces) but this will change soon!

```ts
import { S3Adapter } from 'payload-plugin-cloud-storage';

const s3Adapter = new S3Adapter(
  {
    endpoint: `https://${process.env.SPACES_REGION}.digitaloceanspaces.com`,
    region: process.env.SPACES_REGION,
    credentials: {
      accessKeyId: process.env.SPACES_KEY,
      secretAccessKey: process.env.SPACES_SECRET,
    },
  },
  {
    bucket: process.env.SPACES_NAME,
    endpointUrL: `https://${process.env.SPACES_NAME}.${process.env.SPACES_REGION}.cdn.digitaloceanspaces.com`
  },
  // optional, use your own getEndpoint method
  (endpointUrL, file) => {
    return `${endpoint}/${data.filename}`
  }
)
```

### 2. Add the plugin to Payloads configuration

The plugin attaches itself to all collections that specify an `upload` key. The at it's most basic, the plugin will provide:

- A `beforeChange` hook that pushes uploaded files to the relevant cloud storage.
- An `afterDelete` hook that removes files from cloud storage after the document has been deleted in Payload.
- An `afterRead` hook that adds returns an endpoint to the file for both the main file and each of the `sizes`.
- A custom `upload.adminThumbnail` function. See [admin thumbnails](#admin-thumbnails) for a detailed explanation on what this function does.

```ts
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
    cloudStorage(s3Adapter)
  ]
})
```

## Referencing files uploaded by the plugin

By default the endpoint property is named `cloudStorageUrl` and it is added to both the main document and each of the [image sizes](https://payloadcms.com/docs/upload/overview#image-sizes) on the [collections afterRead](https://payloadcms.com/docs/hooks/collections#afterread) hook.

```ts
{
  "id": "6110b3ba2ecab80501b31fa6",
  "width": 1247,
  "height": 968,
  "sizes": {
    "mobile": {
      "width": 1000,
      "height": 1000,
      "filename": "test-5-1000x1000.jpg",
      "mimeType": "image/jpeg",
      "filesize": 41329,
      "cloudStorageUrl": "https://brightvision.fra1.cdn.digitaloceanspaces.com/test-1000x1000.jpg"
    }
  },
  "filename": "test.jpg",
  "filesize": 142083,
  "mimeType": "image/jpeg",
  "createdAt": "2021-08-09T04:48:58.577Z",
  "updatedAt": "2021-08-09T04:57:16.992Z",
  "cloudStorageUrl": "https://brightvision.fra1.cdn.digitaloceanspaces.com/test.jpg"
}
```

## Admin Thumbnails

The admin thumbnail function the plugin provides tries to transparently support the same functions that [Payload itself does](https://payloadcms.com/docs/upload/overview#admin-thumbnails).

If your collection has an `upload.adminThumbnail` set as `string`, then it will try to pull the image from that size same as the default behavior. If somehow that size doesn't exist then it'll fallback to the main image.

If however your collection specifies a `GetAdminThumbnail` function then that will take precedence over the plugin provided function.

## Extra Options

`cloudStorage` allows you to pass a second `options` parameter.

| Property                | Required | Values                     | Description                                                                         |
|-------------------------|----------|----------------------------|-------------------------------------------------------------------------------------|
| disableEndpointProperty | no       | boolean                    | Disable the `afterRead` hook and the custom `adminThumbnail` function entirely.     |
| endpointPropertyName    | no       | string                     | Customize the name of the property that gets added in the plugins `afterRead` hook. |
| disableLocalStorage     | no       | boolean                    | Passed through to `uploads.disableLocalStorage`. Defaults to `true`.                |
