# VitePress

The `VitePress` class defines the [default theme frontmatter](https://vitepress.dev/reference/frontmatter-config) of VitePress to simplify the configuration of collections.

:::warning Target on links
Linking to other files, such as `/admin/index.html` requires either `target=_self` or opening in a new window. [Read more about linking files](https://vitepress.dev/guide/routing#linking-to-non-vitepress-pages) in the VitePress documentation.
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
