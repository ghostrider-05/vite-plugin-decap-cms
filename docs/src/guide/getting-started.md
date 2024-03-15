# Getting started

## Installation

```sh
pnpm add vite-plugin-decap-cms -D
npm install vite-plugin-decap-cms -D
yarn add vite-plugin-decap-cms -D
```

## Configuration

Since this plugin will create all the files for you, you can ignore the `admin` folder in your `.gitignore`:

```sh
# Configs are generated, no need to include them
docs/src/public/admin/
```

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
