import type { CmsField } from 'decap-cms-core'

import { objToSnakeCase } from './files/config'

import type {
    DecapCmsCollection,
    DecapCmsCollectionFile,
    DecapCmsField,
    DecapCmsMarkdownFieldRenderOptions,
} from './types'

import {
    createField,
    createFile,
    createFileCollection,
    createFolderCollection,
    createOverwriteableField,
    type OverwriteOptions,
} from './util'

export type VitePressPageFrontmatterKeys =
    | 'title'
    | 'titleTemplate'
    | 'description'
    | 'head'
    | 'body'

interface BaseVitePressFieldOptions<Keys extends string> {
    overwrites?: Partial<Record<Keys, OverwriteOptions>>
        & Partial<OverwriteOptions>
}

export interface VitePressFieldOptions extends BaseVitePressFieldOptions<VitePressPageFrontmatterKeys> {
    additionalFields?: DecapCmsField[]

    /**
     * Options for the markdown editor in the CMS
     */
    markdownOptions?: DecapCmsMarkdownFieldRenderOptions
}

export type VitePressDefaultThemeFrontmatterKeys =
    | 'layout'
    | 'navbar'
    | 'sidebar'
    | 'aside'
    | 'outline'
    | 'lastUpdated'
    | 'editLink'
    | 'footer'
    | 'pageClass'

export type VitePressDefaultThemeFieldOptions = BaseVitePressFieldOptions<VitePressDefaultThemeFrontmatterKeys>

export type VitePressHomePageFrontmatterKeys =
    | 'hero'
    | 'heroName'
    | 'heroText'
    | 'heroTagline'
    | 'heroImage'
    | 'heroActions'
    | 'heroActionTheme'
    | 'heroActionText'
    | 'heroActionLink'
    | 'heroActionTarget'
    | 'heroActionRel'
    | 'features'
    | 'featuresTitle'
    | 'featuresDetails'
    | 'featuresIcon'
    | 'featuresLink'
    | 'featuresLinkText'
    | 'featuresRel'
    | 'featuresTarget'

export type VitePressHomePageFieldOptions = BaseVitePressFieldOptions<VitePressHomePageFrontmatterKeys>
    & Partial<Record<
        | 'additionalHeroFields'
        | 'additionalHeroActionFields'
        | 'additionalFeatureFields'
    , DecapCmsField[]>>

function filterUndefined<T>(item: T | undefined): item is T {
    return item != undefined
}

function omit<
    // eslint-disable-next-line @typescript-eslint/ban-types
    T extends {},
    K extends string
>(obj: T | undefined, keys: K[]): Omit<T, K> {
    if (!obj) return {} as Omit<T, K>

    const validEntries = Object.entries(obj).filter(([key]) => !(<string[]>keys).includes(key))
    return Object.fromEntries(validEntries) as Omit<T, K>
}

function pick<
    // eslint-disable-next-line @typescript-eslint/ban-types
    T extends {},
    K extends keyof T
>(obj: T | undefined, keys: K[]): Pick<T, K> {
    if (!obj) return {} as Pick<T, K>

    const validEntries = Object.entries(obj).filter(([key]) => (<string[]>keys).includes(key))
    return Object.fromEntries(validEntries) as Pick<T, K>
}

const overwriteKeys: (keyof OverwriteOptions)[] = [
    'comment',
    'deleted',
    'hidden',
    'hint',
    'label',
    'media_folder',
    'i18n',
    'pattern',
    'public_folder',
    'required',
]

function mergeOverwrites (
    main: Partial<OverwriteOptions> | undefined,
    parent: (Partial<OverwriteOptions> & Partial<Record<string, OverwriteOptions>>) | undefined
): Partial<OverwriteOptions> {
    if (parent == undefined) return (main ?? {})
    else if (main == undefined) return (pick(parent ?? {}, overwriteKeys) ?? {})
    else {
        return overwriteKeys.reduce<Partial<OverwriteOptions>>((combined, key) => {
            if (main?.[key] != undefined) combined[key] = <never>main[key]
            else if (parent?.[key] != undefined) combined[key] = <never>parent[key]

            return combined
        }, {})
    }
}

export class VitePress {
    /**
     * Create fields for:
     * - layout
     * - navbar
     * - sidebar
     * - aside
     * - outline
     * - lastUpdated
     * - editLink
     * - footer
     * - pageClass
     * 
     * Does not create the default page fields, such as title and description. 
     * @param options Options for overwriting field data
     * @see https://vitepress.dev/reference/frontmatter-config#default-theme-only
     */
    public static createDefaultThemeNormalPageFields(
        options?: VitePressDefaultThemeFieldOptions
    ): DecapCmsField[] {
        const { overwrites } = options ?? {}

        return [
            createOverwriteableField('string', {
                name: 'layout',
                label: 'Layout',
                required: false,
            }, mergeOverwrites(overwrites?.layout, overwrites)),
            createOverwriteableField('boolean', {
                name: 'navbar',
                label: 'Whether to display the navbar',
                required: false,
            }, mergeOverwrites(overwrites?.navbar, overwrites)),
            createOverwriteableField('boolean', {
                name: 'sidebar',
                label: 'Whether to display the sidebar',
                required: false,
            }, mergeOverwrites(overwrites?.sidebar, overwrites)),
            // TODO: add aside 'left' option
            createOverwriteableField('boolean', {
                name: 'aside',
                label: 'Whether to display the aside container',
                required: false,
            }, mergeOverwrites(overwrites?.aside, overwrites)),
            // TODO: add support for [number, number] | 'deep' | false
            createOverwriteableField('number', {
                name: 'outline',
                label: 'The header levels in the outline',
                required: false,
            }, mergeOverwrites(overwrites?.outline, overwrites)),
            // TODO: add support for Date 
            createOverwriteableField('boolean', {
                name: 'lastUpdated',
                label: 'Whether to display last updated text',
                required: false,
            }, mergeOverwrites(overwrites?.lastUpdated, overwrites)),
            createOverwriteableField('boolean', {
                name: 'editLink',
                label: 'Whether to display edit link text',
                required: false,
            }, mergeOverwrites(overwrites?.editLink, overwrites)),
            createOverwriteableField('boolean', {
                name: 'footer',
                label: 'Whether to display footer text',
                required: false,
            }, mergeOverwrites(overwrites?.footer, overwrites)),
            createOverwriteableField('string', {
                name: 'pageClass',
                label: 'Page class',
                required: false,
            }, mergeOverwrites(overwrites?.pageClass, overwrites)),
        ].filter(filterUndefined)
    }

    /**
     * Create fields for:
     * - title
     * - titleTemplate
     * - description
     * - head
     * - body (field for writing the markdown in the file)
     * @param options.overwrites Overwrite data, such as labels, for the fields
     * @see https://vitepress.dev/reference/frontmatter-config
     */
    public static createDefaultPageFields(
        options?: VitePressFieldOptions,
    ): DecapCmsField[] {
        const { additionalFields, overwrites } = options ?? {}

        const fields: DecapCmsField[] = [
            createOverwriteableField('string', {
                name: 'title',
                label: 'Title',
            }, mergeOverwrites(overwrites?.title, overwrites)),
            createOverwriteableField('string', {
                name: 'titleTemplate',
                label: 'Title template',
                required: false,
            }, mergeOverwrites(overwrites?.titleTemplate, overwrites)),
            createOverwriteableField('text', {
                name: 'description',
                label: 'Description',
                required: false,
            }, mergeOverwrites(overwrites?.description, overwrites)),
            createOverwriteableField('list', {
                name: 'head',
                label: 'Head',
            }, mergeOverwrites(overwrites?.head, overwrites)),
        ].filter(filterUndefined)

        return fields
            .concat(additionalFields ?? [])
            .concat(createOverwriteableField('markdown', {
                ...(options?.markdownOptions ?? {}),
                name: 'body',
                label: 'Page content',
            }, mergeOverwrites(overwrites?.body, overwrites)) ?? [])
            .filter(filterUndefined)
    }

    /**
     * Create fields for:
     * - layout: home (not overwriteable)
     * - hero
     * - features
     * 
     * The object fields (`features`, `hero`, `heroActions`) can not be hidden and deleted.
     */
    public static createHomePageFields(
        options?: VitePressHomePageFieldOptions,
    ) {
        const { overwrites } = options ?? {}
        const keys: (keyof OverwriteOptions)[] = ['hidden', 'deleted']

        function addAdditionalFields(fields: DecapCmsField[] | undefined): CmsField[] {
            return fields?.map<CmsField>(f => objToSnakeCase(<never>f)) ?? []
        }

        return [
            createField('hidden', {
                name: 'layout',
                default: 'home',
            }),
            createOverwriteableField('object', {
                name: 'hero',
                label: 'Hero items',
                required: true,
                fields: [
                    createOverwriteableField('string', {
                        name: 'name',
                        required: false,
                    }, mergeOverwrites(overwrites?.heroName, overwrites)),
                    createOverwriteableField('string', {
                        name: 'text',
                    }, mergeOverwrites(overwrites?.heroText, overwrites)),
                    createOverwriteableField('string', {
                        name: 'tagline',
                        required: false,
                    }, mergeOverwrites(overwrites?.heroTagline, overwrites)),
                    // TODO: add support for object options
                    createOverwriteableField('image', {
                        name: 'image',
                        required: false,
                    }, mergeOverwrites(overwrites?.heroImage, overwrites)),
                    createOverwriteableField('list', {
                        name: 'actions',
                        label: 'Action buttons',
                        label_singular: 'action',
                        allow_add: true,
                        fields: [
                            createOverwriteableField('string', {
                                name: 'text',
                            }, mergeOverwrites(overwrites?.heroActionText, overwrites)),
                            createOverwriteableField('string', {
                                name: 'link',
                            }, mergeOverwrites(overwrites?.heroActionLink, overwrites)),
                            createOverwriteableField('select', {
                                name: 'theme',
                                required: false,
                                default: 'brand',
                                options: [
                                    'brand',
                                    'alt',
                                ],
                            }, mergeOverwrites(overwrites?.heroActionTheme, overwrites)),
                            createOverwriteableField('string', {
                                name: 'target',
                                required: false,
                            }, mergeOverwrites(overwrites?.heroActionTarget, overwrites)),
                            createOverwriteableField('string', {
                                name: 'rel',
                                required: false,
                            }, mergeOverwrites(overwrites?.heroActionRel, overwrites)),
                            ...addAdditionalFields(options?.additionalHeroActionFields),
                        ].filter(filterUndefined)
                    }, omit(mergeOverwrites(overwrites?.heroActions, overwrites), keys)),
                    ...addAdditionalFields(options?.additionalHeroFields),
                ].filter(filterUndefined),
            }, omit(mergeOverwrites(overwrites?.hero, overwrites), keys)) as never,
            createOverwriteableField('list', {
                name: 'features',
                label: 'Features',
                label_singular: 'feature',
                allow_add: true,
                required: false,
                fields: [
                    createOverwriteableField('string', {
                        name: 'title',
                        required: true,
                    }, mergeOverwrites(overwrites?.featuresTitle, overwrites)),
                    createOverwriteableField('string', {
                        name: 'details',
                        required: false,
                    }, mergeOverwrites(overwrites?.featuresDetails, overwrites)),
                    // TODO: add support for object options
                    createOverwriteableField('string', {
                        name: 'icon',
                        required: false,
                    }, mergeOverwrites(overwrites?.featuresIcon, overwrites)),
                    createOverwriteableField('string', {
                        name: 'link',
                        required: false,
                    }, mergeOverwrites(overwrites?.featuresLink, overwrites)),
                    createOverwriteableField('string', {
                        name: 'linkText',
                        label: 'Link text',
                        required: false,
                    }, mergeOverwrites(overwrites?.featuresLinkText, overwrites)),
                    createOverwriteableField('string', {
                        name: 'target',
                        label: 'Target',
                        required: false,
                    }, mergeOverwrites(overwrites?.featuresTarget, overwrites)),
                    createOverwriteableField('string', {
                        name: 'rel',
                        required: false,
                    }, mergeOverwrites(overwrites?.featuresRel, overwrites)),
                    ...addAdditionalFields(options?.additionalFeatureFields ?? []),
                ].filter(filterUndefined),
            }, omit(mergeOverwrites(overwrites?.features, overwrites), keys)),
        ]
    }

    public static createDefaultPageFolderCollection(
        name: string,
        folder: string,
        options?: VitePressFieldOptions & {
            collection?: Partial<Omit<DecapCmsCollection<'folder'>, 'name' | 'fields' | 'folder'>>
        }
    ): DecapCmsCollection<'folder'> {
        const { collection, ...fieldsOptions } = options ?? {}
        const fields = this.createDefaultPageFields(fieldsOptions)

        return createFolderCollection({
            name,
            label: name,
            folder,
            ...(collection ?? {}),
            fields,
        })
    }

    public static createDefaultPageFile(
        name: string,
        file: string,
        options?: VitePressFieldOptions & {
            collection?: Partial<Omit<DecapCmsCollectionFile, 'name' | 'file'>>,
        }
    ) {
        const { collection, ...fieldsOptions } = options ?? {}
        const fields = this.createDefaultPageFields(fieldsOptions)

        return createFile({
            name,
            file,
            label: name,
            ...(collection ?? {}),
            fields,
        })
    }

    public static createDefaultPageFileCollection(
        name: string,
        files: Parameters<typeof VitePress['createDefaultPageFile']>[],
        options?: {
            collection?: Partial<Omit<DecapCmsCollection<'file'>, 'name' | 'files'>>,
        }
    ) {
        return createFileCollection({
            name,
            label: name,
            ...(options?.collection ?? {}),
            files: files.map(params => this.createDefaultPageFile(...params)),
        })
    }
}
