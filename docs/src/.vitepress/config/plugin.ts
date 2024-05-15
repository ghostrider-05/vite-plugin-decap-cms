import {
    VitePress,
    type Options,
} from '../../../../src/'

type BlockFields = { summary?: string, contents: string, type: string }

export default <Options>{
    script: {
        onInitialized(ctx) {
            console.log(ctx.app.getLocale('en'))
        },

        onPrePublish(ctx) {
            console.log(ctx.entry.get('data').get('title'))
        },

        markdownEditorComponents: [
            {
                id: `custom-block`,
                label: `Custom block`,
                fields: [
                    {
                        name: 'type',
                        label: 'Type of block',
                        widget: "select",
                        options: ["details", "warning", "danger", 'info', 'tip'],
                    },
                    {
                        name: 'summary',
                        label: 'Summary',
                        required: false,
                        widget: 'string'
                    },
                    {
                        name: 'contents',
                        label: 'Contents',
                        widget: 'markdown'
                    }
                ],
                pattern: /^:::(\w+)(.*?)\n(.*?)\n^:::$/ms,
                fromBlock: function (match) {
                    return {
                        type: match[1],
                        summary: match[2],
                        contents: match[3]
                    };
                },
                toBlock: function (data: BlockFields) {
                    return `:::${data.type} ${data.summary}\n${data.contents}\n:::`
                },
                toPreview: function (data: BlockFields) {
                    return `:::${data.type} ${data.summary}\n${data.contents}\n:::`
                },
            }
        ]
    },

    config: {
        backend: {
            local: 'dev',
            name: 'test-repo',
        },

        mediaFolder: '/src/public/images',
        publicFolder: '/images',
        collections: [
            VitePress.createDefaultPageFolderCollection('demo', 'src/demo', {
                additionalFields: VitePress.createDefaultThemeNormalPageFields(),
                collection: {
                    label: 'demo collection',
                    labelSingular: 'demo file',
                    create: true,
                    delete: false,
                    editor: { preview: false },
                },
            }),
        ]
    }
}
