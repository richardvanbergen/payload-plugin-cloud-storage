# Payload Plugin - Cloud Storage

## TODO

This plugin is still under development. 

- [x] Tidy up documention
- [x] Publish to NPM
- [x] Create workflow for publishing to NPM
- [x] Add support for upload `sizes`
- [ ] Add cloudinary support (?)
- [x] Test in situation
- [ ] Add option for disabling local storage
- [x] Update payload version and add new types
- [ ] Add build/coverage/version badges

## Installation

```
npm i plugin-payload-cloud-storage
```

```
yarn add plugin-payload-cloud-storage
```

## Basic Usage

### Adapters

First, instantiate an adapter. Currently we only support S3 but this will change soon so the adapter encapsulates all vendor-specific configuration and setup.

#### S3 (AWS and Digital Ocean)

```ts
import { S3Adapter } from 'payload-plugin-cloud-storage';

const s3Adapater = new S3Adapter(
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
  (endpointUrL, file) => {
    return `${endpoint}/${data.filename}`
  }
)
```

### The Plugin

The plugin attaches itself to all collections that specify an `upload` key. The at it's most basic, the plugin will provide:

- A `beforeChange` hook that pushes uploaded files to the relevant cloud storage.
- An `afterDelete` hook that removes files from cloud storage after the document has been deleted in Payload.
- A virtual field the points to the remote file. (a field on the collection that is computed from other data at runtime)
- An `upload.adminThumbnail` that references the virtual field.

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
    cloudStorage(s3Adapater)
  ]
})
```

By default, the virtual field that is added is named `cloudStorageUrl` and it has an `afterRead` that returns an full URL to the file.

The URL returned is determined by the adapter you're using in its implementation of `AdapterInterface.getEndpointUrl`.

| Adapter   | Template                     | Description                                                                                                                                      |
|-----------|------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| S3Adapter | {{endpointUrl}}/{{filename}} | `endpointUrl` is determined by `options.endpointUrl` and filename is returned by payloads `afterRead` field hook in the form of `data.filename`. |

## Advanced Options

`cloudStorage` allows you to pass a second `uploadCollectionModifiers` parameter which allows you to fully modify the default behavior.

| Property       | Required | values                     | Description                                                                                                                                                                                                                                                                                                |
|----------------|----------|----------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| fields         | no       | Field[]                    | If an array of payload `Field`, then this will replace the default virtual configuration fields that get added to the collection.<br><br>                                                                                                                                                                  |
| adminThumbnail | no       | GetAdminThumbnail          | Passing a payload `GetAdminThumbnail` compatible function will override the default method we use to fetch the admin thumbnail.<br><br> Note: This function will not be override any [upload.adminThumbnail]() methods specified directly on the collection. It'll only apply if it doesn't already exist. |

Explicitly passing `false` to `uploadCollectionModifiers` will disable all modifications to collections made by these plugins.

**Example**

Following from the Basic Usage example above.

```ts
import { Field } from 'payload/types'
import { GetAdminThumbnail } from 'payload/dist/uploads/types'

/**
 * uploadCollectionModifiers.fields
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
 * uploadCollectionModifiers.fields
 */
const adminThumbnail: GetAdminThumbnail = (args) => {
  if (typeof args?.doc?.cloudStorageUrl === 'string') {
    return args?.doc?.cloudStorageUrl
  }

  // or handle missing image some other way
  return ''
}

/**
 * Added to configuration like this.
 */
const config = buildConfig({
  // ...
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
```