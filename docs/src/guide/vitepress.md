# VitePress

The `VitePress` class defines the [default theme frontmatter](https://vitepress.dev/reference/frontmatter-config) of VitePress to simplify the configuration of collections.

## CMS links

Linking to other files, such as `/admin/index.html` requires either `target=_self` or opening in a new window. [Read more about linking files](https://vitepress.dev/guide/routing#linking-to-non-vitepress-pages) in the VitePress documentation.

## Edit page

To open the CMS on clicking `Edit page` in the footer, you will need to add `target=_self` to the edit link (like mentioned above).

```ts
export default defineConfig ({
    themeConfig: {
        editLink: {
            pattern: (page) => {
                // Replace this with your own collection mapping
                const cmsPath = page.relativePath.replace('.md', '')

                return `/admin/index.html#/edit/${cmsPath}`
            },
        },
    }
})
```

:::info Workaround
A custom `target` and `rel` attributes are not supported in the `editLink` configuration.

To add the `target` attribute you will need to use a custom Vite plugin in your configuration:

```ts
import { type Plugin } from 'vitepress'

const vitepressEditLinkPlugin: Plugin = {
    name: 'make-edit-link-external',
    enforce: 'pre',
    transform: (code, id) => {
        if (id.endsWith('VPDocFooter.vue')) {
            const link = '<VPLink class="edit-link-button"'
            return code.replace(link, link + ' target="_self"')
        }
    },
}

export default defineConfig({
    // ...

    vite: {
        plugins: [
            vitepressEditLinkPlugin,
        ],
    }
})
```

:::

## Folder collections

```ts
import {
    VitePress,
    type Options,
} from 'vite-plugin-decap-cms'

const options: Options = {
    config: {
        // ...

        collections: [
            VitePress.createDefaultPageFolderCollection('test', 'src/demo', {
                additionalFields: VitePress.createDefaultThemeNormalPageFields(),
                collection: {
                    label: 'test collection',
                    labelSingular: 'test file',
                    create: true,
                    delete: false,
                    editor: { preview: false },
                },
            })
        ]
    }
}
```

## File collections

```ts
import {
    VitePress,
    type Options,
} from 'vite-plugin-decap-cms'

const options: Options = {
    config: {
        // ...

        collections: [
            VitePress.createDefaultPageFileCollection('home_collection', [
                [
                    'home',
                    'src/index.md',
                    {
                        collection: {
                            label: 'Home page',
                        },
                    }
                ],
            ], {
                collection: {
                    label: 'Home collection',
                },
            }),
            // Or:
            {
                name: 'home_collection',
                label: 'Home collection',
                files: [
                    VitePress.createDefaultPageFile('home', 'src/index.md', {
                        collection: {
                            label: 'Home page',
                        },
                    }),
                ],

            },
        ]
    }
}
```

## Customize fields

Each method for creating fields (or collections with fields) has the following options exposed:

- `additionalFields`: an array of fields to append to the default VitePress fields.
- `overwrites`: an array of [overwriting field data](#overwrite-field-data)
- `markdownOptions`: options for the markdown editor of the `body` field

For collections the following options are also available:

- `collection`: additional (optional) collection options

### Overwrite field data

For each field the following data can be changed:

- `hidden`: set to `true` to hide this field in the editor
- `deleted`: do not include this field in the frontmatter and editor
- all base field properties:
  - `label`
  - `required`
  - `hint`
  - `pattern`
  - `i18n`
  - `media_folder`
  - `public_folder`
  - `comment`
