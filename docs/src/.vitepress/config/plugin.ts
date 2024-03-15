import {
    VitePress,
    type Options,
} from '../../../../src/'

export default<Options> {
    script: {
        onInitialized(ctx) {
            console.log(ctx.app.getLocale('en'))
        },

        onPrePublish(ctx) {
            console.log(ctx.entry.get('data').get('title'))
        },
    },

    config: {
        backend: {
            local: 'dev',
            name: 'test-repo',
        },

        mediaFolder: '/src/public/images',
        publicFolder: '/images',
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
