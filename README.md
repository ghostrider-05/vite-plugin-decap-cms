# vite-plugin-decap-cms

> A Vite plugin to connect Decap CMS

![NPM Version](https://img.shields.io/npm/v/vite-plugin-decap-cms)
![NPM Downloads](https://img.shields.io/npm/dm/vite-plugin-decap-cms)
![GitHub Issues or Pull Requests](https://img.shields.io/github/issues/ghostrider-05/vite-plugin-decap-cms)

> [!WARNING]
> This plugin has not reached a stable version, 1.0.0, and can include breaking changes following the semver specification. This plugin is open for contributions, both for code, suggestions and (missing) documentation.

## Install

```sh
pnpm add vite-plugin-decap-cms -D
npm install vite-plugin-decap-cms -D
yarn add vite-plugin-decap-cms -D
```

## Usage

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
                        folder: 'test',
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

For more options and guides, see [the documentation](https://vite-plugin-decap-cms.pages.dev)

## Example

See [the documentation CMS](https://vite-plugin-decap-cms.pages.dev/admin/index.html) for an example

## Development

```sh
# in /docs/
npm run docs:dev
```

## License

[MIT](LICENSE)
