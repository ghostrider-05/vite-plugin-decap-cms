# VitePress

The `VitePress` class defines the [default theme frontmatter](https://vitepress.dev/reference/frontmatter-config) of VitePress to simplify the configuration of collections.

:::warning Target on links
Linking to other files, such as `/admin/index.html` requires either `target=_self` or opening in a new window. [Read more about linking files](https://vitepress.dev/guide/routing#linking-to-non-vitepress-pages) in the VitePress documentation.

To redirect `Edit this file` links to Decap CMS, change the `edit-link-button` element to add `target="_self"` (in `VPDocFooter.vue`)
:::

## Folder collections

```ts
import {
    VitePress,
    type Options,
} from '../../../../src/'

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

## Customize fields
