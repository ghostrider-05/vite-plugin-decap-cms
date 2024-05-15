/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import type {
    CmsField,
    CmsConfig,
    CmsLocalBackend,
    CmsBackend,
    CmsCollection,
    CmsCollectionFile,
    CmsFieldMeta,
    CmsFieldMarkdown,
    CmsFieldStringOrText,
    CmsFieldBase,
} from 'decap-cms-core'

import { ScriptOptions } from './script'
import { ExecOptions } from 'child_process'

type CamelToSnakeCase<S extends string, I extends string = never> = S extends `${infer T}${infer U}` ?
    S extends I ? S :
    `${T extends Capitalize<T> ? '_' : ''}${Lowercase<T>}${CamelToSnakeCase<U>}` :
    S

export type KeysToSnakeCase<T> = {
    [K in keyof T as CamelToSnakeCase<string & K, 'i18n'>]: T[K]
}

type CamelCase<S extends string> = S extends `${infer P1}_${infer P2}${infer P3}`
  ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
  : Lowercase<S>

export type KeysToCamelCase<T> = {
    [K in keyof T as CamelCase<string &K>]: T[K] extends {} ? KeysToCamelCase<T[K]> : T[K]
}

type PickRequired<O extends object, K extends keyof O> = Omit<O, K> & Required<Pick<O, K>>

export type EnvContextOption =
    | boolean
    | 'dev'
    | 'prod'

export type EnvDevContextOption = Exclude<EnvContextOption, 'prod'>

// collections & fields

export type CollectionType =
    | 'file'
    | 'folder'

export type DecapCmsMarkdownFieldRenderOptions = KeysToCamelCase<Omit<CmsFieldMarkdown,
    | 'widget'
    | 'default'
    | 'editorComponents'
>>

export type DecapCmsField = KeysToCamelCase<CmsField>
export type DecapCmsFieldType = NonNullable<Exclude<CmsField, CmsFieldMeta>['widget']>

type DecapCmsWidget = Exclude<CmsField,
    | CmsFieldStringOrText
    | CmsFieldMeta
> | (CmsFieldBase & PickRequired<CmsFieldStringOrText, 'widget'>)

export type DecapCmsFieldWidget<Name extends DecapCmsFieldType> =
    DecapCmsWidget extends infer K
        ? K extends DecapCmsWidget
            ? Name extends K['widget']
                ? K
                : never
            : never
        : never

export type DecapCmsCollectionFile = KeysToCamelCase<Omit<CmsCollectionFile, 'fields'>> & { fields: DecapCmsField[] }

type BaseDecapCmsCollection<Props> = KeysToCamelCase<
    & Omit<CmsCollection, 'files' | 'fields'>>
    & Props

export type DecapCmsCollection<Type extends CollectionType = CollectionType> = Type extends 'folder'
    ? BaseDecapCmsCollection<{ fields: DecapCmsField[] }>
    : Type extends 'file'
        ? BaseDecapCmsCollection<{ files: DecapCmsCollectionFile[] }>
        : never

// configuration & options

export type DecapCmsConfig = KeysToCamelCase<Omit<CmsConfig,
    | 'local_backend'
    | 'backend'
    | 'collections'
    // TODO: add support for this with NPM support
    | 'load_config_file'
>> & {
    backend: {
        local?:
            | EnvDevContextOption
            | KeysToCamelCase<CmsLocalBackend>

        /**
         * Overwrite the branch specified in `backend.branch`
         * - true: always use current branch
         * - false: always use the branch in the configuration
         * - 'dev': only use the current branch when locally writing
         * - 'prod': ony use the current branch when building the site
         * @default false
         */
        // TODO: local_backend writes to files, why need the branch?
        useCurrentBranch?: EnvContextOption
    } & KeysToCamelCase<CmsBackend>

    collections: DecapCmsCollection[]

    /**
     * The subfolder for where to write the CMS configuration (config.yml):
     * - '' for the {@link Options.dir}
     * @default 'admin'
     */
    dir?: string
}

export type CdnLinkOptions =
    | string
    | { version?: string, base?: string }

// Partially copied from VitePress
export type HeadConfig =
    | string
    | [string, Record<string, string>]
    | [string, Record<string, string>, string]

export interface LoginPageOptions {
    /**
     * The title for the CMS pages
     * @default 'Content Manager' 
     */
    title?: string

    /**
     * The favicon for the CMS pages
     */
    icon?: string
    
    /**
     * Additional head items for the page.
     * The following items are configured already:
     * - title
     * - viewport
     * - robots
     * - charset
     * - favicon (if used in the config)
     * - Netlify Identity script (if used in the config)
     * - custom config path (if used in the config)
     */
    head?: HeadConfig[]

    /**
     * Replace the login page with your own html
     */
    html?: string

    /**
     * Instead of replacing all html, load this next to the CMS Editor for a custom footer, nav, etc.
     */
    additionalHtml?: string

    /**
     * The version of Netlify Identity to use
     * @default '1'
     */
    netlifyIdentityVersion?: string
}

type YmlStringifyOptions = Parameters<typeof import('yaml').stringify>

/** @experimental */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface NpmOptions {
    
}

export interface DecapProxyOptions {
    /**
     * If using local backend AND Vite dev mode is running, control whether to run the decap-server proxy. 
     * @default true
     */
    enabled?: boolean

    /**
     * Run the proxy on a different port.
     * Does not change the local backend allowed hosts
     * @default 8081
     */
    port?: number

    /**
     * Pass any option to use in the child process
     * @default undefined
     */
    process?: ExecOptions
}

export interface Options {
    /**
     * How to load Decap CMS
     * @default
     * { method: 'cdn'}
     */
    load?:
        | { method: 'cdn', options?: CdnLinkOptions }
        // | { method: 'npm', options: NpmOptions }

    /**
     * Log when the configuration is being written or skipped
     */
    debug?: boolean

    /**
     * The folder where to write all /admin/ files.
     * Will create an `admin` folder at this path if it does not exist.
     * 
     * @default vite.Config.publicDir
     */
    dir?: string

    /**
     * Options for the index.html (login page) file
     */
    login?: LoginPageOptions

    config: DecapCmsConfig

    /**
     * Run custom JS to enhance the CMS
     */
    script?: ScriptOptions

    /**
     * Options for the Decap server proxy
     */
    proxy?: DecapProxyOptions

    /**
     * Yml stringify options for writing the config.yml file
     */
    yml?: {
        replacer?: NonNullable<YmlStringifyOptions[1]>
        options?: NonNullable<YmlStringifyOptions[2]>
    }
}
