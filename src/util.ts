import { execSync } from 'child_process'

import type { CmsFieldBase, CmsField } from 'decap-cms-core'

import { objToSnakeCase } from './files/config'

import type {
    DecapCmsCollection,
    DecapCmsCollectionFile,
    DecapCmsField,
    DecapCmsFieldType,
    DecapCmsFieldWidget,
    DecapCmsMarkdownFieldRenderOptions,
} from './types'

export function getGitData() {
    const executeGit = (command: string) => {
        try {
            return execSync(command)
                .toString('utf8')
                .replace(/[\n\r\s]+$/, '')
        } catch {
            // error
        }
    }

    return {
        getBranch() {
            return executeGit('git rev-parse --abbrev-ref HEAD')
        },
        getCommitSha() {
            return executeGit('git rev-parse HEAD')
        },
    }
}

export function createField<T extends DecapCmsFieldType>(
    widget: T,
    data: Omit<DecapCmsFieldWidget<T>, 'widget'>
): DecapCmsFieldWidget<T> {
    return <never>{
        ...data,
        widget,
    }
}

export function createFolderCollection(data: DecapCmsCollection<'folder'>) {
    return data
}

export function createFile(data: DecapCmsCollectionFile) {
    return data
}

export function createFileCollection(data: DecapCmsCollection<'file'>) {
    return data
}

export type OverwriteOptions = Omit<CmsFieldBase, 'name'> & {
    /**
     * Hide this field in the CMS editor UI.
     * @default false
     */
    hidden?: boolean

    /**
     * Hide this field in the CMS editor UI and do not include it in the frontmatter.
     * @default false
     */
    deleted?: boolean
}

function createOverwriteableField<T extends DecapCmsFieldType>(
    widget: T,
    data: Omit<DecapCmsFieldWidget<T>, 'widget'>,
    overwrites?: OverwriteOptions,
): DecapCmsFieldWidget<T> | DecapCmsFieldWidget<'hidden'> | undefined {
    if (overwrites != undefined) {
        const toAdd = (key: Exclude<keyof OverwriteOptions, 'hidden' | 'deleted'>): void => {
            if (overwrites?.[key] != undefined && data[key] !== overwrites[key]) data[key] = <never>overwrites[key]
        }

        for (const key of <(keyof OverwriteOptions)[]>Object.keys(overwrites)) {
            if (key !== 'hidden' && key !== 'deleted') {
                toAdd(key)
            }
        }
    }

    if (overwrites?.deleted) return undefined
    else if (overwrites?.hidden && widget !== 'hidden') return createField('hidden', data)
    else return <never>{
        ...data,
        widget,
    }
}

function filterUndefined <T>(item: T | undefined): item is T {
    return item != undefined
}

function omit <
    // eslint-disable-next-line @typescript-eslint/ban-types
    T extends {},
    K extends string
>(obj: T | undefined, keys: K[]): Omit<T, K> | undefined {
    if (!obj) return undefined

    const validEntries = Object.entries(obj).filter(([key]) => !(<string[]>keys).includes(key))
    return Object.fromEntries(validEntries) as Omit<T, K>
}

export type VitePressPageFrontmatterKeys =
    | 'title'
    | 'titleTemplate'
    | 'description'
    | 'head'
    | 'body'

interface BaseVitePressFieldOptions<Keys extends string> {
    overwrites?: Partial<Record<Keys, OverwriteOptions>>
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
            }),
            createOverwriteableField('boolean', {
                name: 'navbar',
                label: 'Whether to display the navbar',
                required: false,
            }, overwrites?.navbar),
            createOverwriteableField('boolean', {
                name: 'sidebar',
                label: 'Whether to display the sidebar',
                required: false,
            }, overwrites?.sidebar),
            // TODO: add aside 'left' option
            createOverwriteableField('boolean', {
                name: 'aside',
                label: 'Whether to display the aside container',
                required: false,
            }, overwrites?.aside),
            // TODO: add support for [number, number] | 'deep' | false
            createOverwriteableField('number', {
                name: 'outline',
                label: 'The header levels in the outline',
                required: false,
            }, overwrites?.outline),
            // TODO: add support for Date 
            createOverwriteableField('boolean', {
                name: 'lastUpdated',
                label: 'Whether to display last updated text',
                required: false,
            }, overwrites?.lastUpdated),
            createOverwriteableField('boolean', {
                name: 'editLink',
                label: 'Whether to display edit link text',
                required: false,
            }, overwrites?.editLink),
            createOverwriteableField('boolean', {
                name: 'footer',
                label: 'Whether to display footer text',
                required: false,
            }, overwrites?.footer),
            createOverwriteableField('string', {
                name: 'pageClass',
                label: 'Page class',
                required: false,
            }, overwrites?.pageClass),
        ].filter(filterUndefined)
    }

    /**
     * Create fields for:
     * - title
     * - titleTemplate
     * - description
     * - head
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
            }, overwrites?.title),
            createOverwriteableField('string', {
                name: 'titleTemplate',
                label: 'Title template',
                required: false,
            }, overwrites?.titleTemplate),
            createOverwriteableField('text', {
                name: 'description',
                label: 'Description',
                required: false,
            }, overwrites?.description),
            createOverwriteableField('list', {
                name: 'head',
                label: 'Head',
            }, overwrites?.head),
        ].filter(filterUndefined)

        return fields
            .concat(additionalFields ?? [])
            .concat(createOverwriteableField('markdown', {
                ...(options?.markdownOptions ?? {}),
                name: 'body',
                label: 'Page content',
            }, overwrites?.body) ?? [])
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

        function addAdditionalFields (fields: DecapCmsField[] | undefined): CmsField[] {
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
                    }, overwrites?.heroName),
                    createOverwriteableField('string', {
                        name: 'text',
                    }, overwrites?.heroText),
                    createOverwriteableField('string', {
                        name: 'tagline',
                        required: false,
                    }, overwrites?.heroTagline),
                    // TODO: add support for object options
                    createOverwriteableField('image', {
                        name: 'image',
                        required: false,
                    }, overwrites?.heroImage),
                    createOverwriteableField('list', {
                        name: 'actions',
                        label: 'Action buttons',
                        label_singular: 'action',
                        allow_add: true,
                        fields: [
                            createOverwriteableField('string', {
                                name: 'text',
                            }, overwrites?.heroActionText),
                            createOverwriteableField('string', {
                                name: 'link',
                            }, overwrites?.heroActionLink),
                            createOverwriteableField('select', {
                                name: 'theme',
                                required: false,
                                default: 'brand',
                                options: [
                                    'brand',
                                    'alt',
                                ],
                            }, overwrites?.heroActionTheme),
                            createOverwriteableField('string', {
                                name: 'target',
                                required: false,
                            }, overwrites?.heroActionTarget),
                            createOverwriteableField('string', {
                                name: 'rel',
                                required: false,
                            }, overwrites?.heroActionRel),
                            ...addAdditionalFields(options?.additionalHeroActionFields),
                        ].filter(filterUndefined)
                    }, omit(overwrites?.heroActions, keys)),
                    ...addAdditionalFields(options?.additionalHeroFields),
                ].filter(filterUndefined),
            }, omit(overwrites?.hero, keys)) as never,
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
                    }, overwrites?.featuresTitle),
                    createOverwriteableField('string', {
                        name: 'details',
                        required: false,
                    }, overwrites?.featuresDetails),
                    // TODO: add support for object options
                    createOverwriteableField('string', {
                        name: 'icon',
                        required: false,
                    }, overwrites?.featuresIcon),
                    createOverwriteableField('string', {
                        name: 'link',
                        required: false,
                    }, overwrites?.featuresLink),
                    createOverwriteableField('string', {
                        name: 'linkText',
                        label: 'Link text',
                        required: false,
                    }, overwrites?.featuresLinkText),
                    createOverwriteableField('string', {
                        name: 'target',
                        label: 'Target',
                        required: false,
                    }, overwrites?.featuresTarget),
                    createOverwriteableField('string', {
                        name: 'rel',
                        required: false,
                    }, overwrites?.featuresRel),
                    ...addAdditionalFields(options?.additionalFeatureFields ?? []),
                ].filter(filterUndefined),
            }, omit(overwrites?.features, keys)),
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
