# VitePress

The `VitePress` class defines the [default theme frontmatter](https://vitepress.dev/reference/frontmatter-config) of VitePress to simplify the configuration of collections.

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
