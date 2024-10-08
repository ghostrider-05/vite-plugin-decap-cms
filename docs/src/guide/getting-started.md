# Getting started

## Installation

```sh
pnpm add vite-plugin-decap-cms -D
npm install vite-plugin-decap-cms -D
yarn add vite-plugin-decap-cms -D
```

## Configuration

:::info Ignore files
Since this plugin will create all the files for you, you can ignore the `admin` folder in your `.gitignore`:

```sh
# Configs are generated, no need to include them
docs/src/public/admin/
```

If you need other CMS assets files or scripts in `/admin/` you can also ignore only the configuration:

```sh
docs/src/public/admin/index.html
docs/src/public/admin/config.yml
```

:::

Then configure Vite with the plugin:

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import decap, {
    createFolderCollection,
    createField,
} from 'vite-plugin-decap-cms'

export default defineConfig({
    publicDir: 'public',
    plugins: [
        decap({
            config: {
                backend: {
                    name: 'test-repo',
                },
                mediaFolder: '/src/public/',
                collections: [
                    createFolderCollection({
                        name: 'test',
                        label: 'Test collection',
                        fields: [
                            createField('markdown', { name: 'body' }),
                        ],
                    }),
                ]
            }
        })
    ],
})
```

Or if you want to define the plugin options separately:

```ts
// plugin_cms.ts
import {
    type Options,
    createFolderCollection,
    createField,
} from 'vite-plugin-decap-cms'

export default <Options> {
    config: {
        backend: {
            name: 'test-repo',
        },
        mediaFolder: '/src/public/',
        collections: [
            createFolderCollection({
                name: 'test',
                label: 'Test collection',
                fields: [
                    createField('markdown', { name: 'body' }),
                ],
            }),
        ]
    }
}
```

:::info Reusable collection options

```ts
import { createSharedCollectionOptions } from 'vite-plugin-decap-cms'

const createOptions = createSharedCollectionOptions({
    publish: false,
    create: true,
    name: {
        action: 'append',
        value: 'guide_',
    },
})

const folderOptions = {
    fields: [],
    ...createOptions({
        label: 'Folder collection',
        name: 'folder',
    }),
}
// Is equal to:
const folderOptions = {
    fields: [],
    publish: false,
    create: true,
    name: 'guide_folder',
    label: 'Folder collection',
}
```

:::
