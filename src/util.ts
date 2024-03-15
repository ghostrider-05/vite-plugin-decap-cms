import { execSync } from 'child_process'

import type {
    DecapCmsCollection,
    DecapCmsCollectionFile,
    DecapCmsField,
    DecapCmsFieldType,
    DecapCmsFieldWidget,
    DecapCmsMarkdownFieldRenderOptions,
} from './types'
import { CmsFieldBase } from 'decap-cms-core'

export function getGitData () {
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
        get branch() {
            return executeGit('git rev-parse --abbrev-ref HEAD')
        },
        get commitSha() {
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

export function createFile (data: DecapCmsCollectionFile) {
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
}

function createOverwriteableField<T extends DecapCmsFieldType>(
    widget: T,
    data: Omit<DecapCmsFieldWidget<T>, 'widget'>,
    overwrites?: OverwriteOptions,
): DecapCmsFieldWidget<T> | DecapCmsFieldWidget<'hidden'> {
    if (overwrites != undefined) {
        const toAdd = (key: Exclude<keyof OverwriteOptions, 'hidden'>): void => {
            if (overwrites?.[key] != undefined && data[key] !== overwrites[key]) data[key] = <never>overwrites[key]
        }

        for (const key of <(keyof OverwriteOptions)[]>Object.keys(overwrites)) {
            if (key !== 'hidden') {
                toAdd(key)
            }
        }
    }

    if (overwrites?.hidden && widget !== 'hidden') return createField('hidden', data)
    else return <never>{
        ...data,
        widget,
    }
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
    | 'navbar'
    | 'sidebar'
    | 'aside'
    | 'outline'
    | 'lastUpdated'
    | 'editLink'
    | 'footer'
    | 'pageClass'

export type VitePressDefaultThemeFieldOptions = BaseVitePressFieldOptions<VitePressDefaultThemeFrontmatterKeys>

export class VitePress {
    /**
     * Create fields for:
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
            createOverwriteableField('boolean', {
                name: 'navbar',
                label: 'Whether to display the navbar',
                default: true,
                required: false,
            }, overwrites?.navbar),
            createOverwriteableField('boolean', {
                name: 'sidebar',
                label: 'Whether to display the sidebar',
                default: true,
            }, overwrites?.sidebar),
            // TODO: add aside 'left' option
            createOverwriteableField('boolean', {
                name: 'aside',
                label: 'Whether to display the aside container',
                default: true,
            }, overwrites?.aside),
            // TODO: add support for [number, number] | 'deep' | false
            createOverwriteableField('number', {
                name: 'outline',
                label: 'The header levels in the outline',
                default: 2,
            }, overwrites?.outline),
            // TODO: add support for Date 
            createOverwriteableField('boolean', {
                name: 'lastUpdated',
                label: 'Whether to display last updated text',
                default: true,
            }, overwrites?.lastUpdated),
            createOverwriteableField('boolean', {
                name: 'editLink',
                label: 'Whether to display edit link text',
                default: true,
            }, overwrites?.editLink),
            createOverwriteableField('boolean', {
                name: 'footer',
                label: 'Whether to display footer text',
                default: true,
            }, overwrites?.footer),
            createOverwriteableField('string', {
                name: 'pageClass',
                label: 'Page class',
                required: false,
            }, overwrites?.pageClass),
        ]
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
        ]

        return fields
            .concat(additionalFields ?? [])
            .concat(createOverwriteableField('markdown', {
                ...(options?.markdownOptions ?? {}),
                name: 'body',
                label: 'Page content',
            }, overwrites?.body))
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

    public static createDefaultPageFile (
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

    public static createDefaultPageFileCollection (
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
