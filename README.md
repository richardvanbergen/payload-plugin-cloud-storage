# payload-plugin-cloud-storage

**DISCLAIMER: While I welcome early feedback, this library is still in development and I haven't even done any real-world integration testing yet. As you can probably tell by the TODOs and the poorly written documentation bellow, use at your own risk. It's only published so I can test the release and publish mechanisms. :)**

## todo

- [ ] Tidy up documention
- [x] Publish to NPM
- [x] Create workflow for publishing to NPM
- [ ] Add support for upload `sizes`
- [ ] Add cloudinary support (?)
- [x] Test in situation
- [ ] Add option for disabling local storage
- [ ] Update payload version and add new types
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
  },
  (endpoint, file) => {
    return `https://${process.env.SPACES_NAME}.${process.env.SPACES_REGION}.cdn.digitaloceanspaces.com/${data.filename}`
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

## Advanced Options

`cloudStorage` allows you to pass a second `uploadCollectionModifiers` parameter which allows you to fully modify the default behavior.

| Property       | Required | values                     | Description                                                                                                                                                                                                                                                                                                                                    |   |
|----------------|----------|----------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---|
| fields         | no       | Field[] \| false           | If an array of payload `Field`, then this will replace the default virtual configuration fields that get added to the collection.<br><br> Passing `false` will disable the virtual fields and not provide a replacement.                                                                                                                              |   |
| adminThumbnail | no       | GetAdminThumbnail \| false | Passing a payload `GetAdminThumbnail` compatible function will override the default method we use to fetch the admin thumbnail.<br><br>  Passing `false` will disable it entirely.<br><br>  Note: This function will not be override any [upload.adminThumbnail]() methods specified directly on the collection. It'll only apply if it doesn't already exist. |   |

**Example**

Following from the Basic Usage example above.

```ts
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