/* eslint-disable @typescript-eslint/no-unused-vars */
import type { 
    CMS,
    CmsEventListener,
    CmsWidgetControlProps,
    CmsWidgetPreviewProps,
    EditorComponentOptions,
    Formatter,
    PreviewTemplateComponentProps,
} from 'decap-cms-core'
import { type Component } from 'vue'

import type { DecapCmsField, DecapCmsFieldWidget } from './types'
// import veuary from 'veaury'

export interface CmsHookContext {
    app: CMS
}

export type CmsEventHookContext =
    & CmsHookContext
    & Parameters<CmsEventListener['handler']>[0]

export type CmsEditorComponentOptions = EditorComponentOptions & {
    id: string
    label: string
    pattern: RegExp
    fields: DecapCmsField[]
}

export interface CmsEditorFormatter {
    name: string
    extension: string
    formatter: Formatter
}

// type BaseCustomComponent =
//     | { type?: 'react', component: React.Component }
//     | { type: 'vue', component: Component, options?: veuary.options }

// export interface CmsCustomWidgetReactOptions {
//     id: string
//     type?: 'react'
//     component: React.Component<CmsWidgetControlProps> | string
//     preview?: React.Component<CmsWidgetPreviewProps>
//     schema?: object
// }

// export interface CmsCustomWidgetVueOptions {
//     id: string
//     type: 'vue'
//     component: Component | string
//     preview?: Component
//     schema?: string
//     options?: veuary.options
// }

// export type CmsCustomWidgetOptions =
//     | CmsCustomWidgetReactOptions
//     | CmsCustomWidgetVueOptions

// interface CmsPreviewReactTemplate {
//     type?: 'react'
//     name: string
//     component: React.Component<PreviewTemplateComponentProps>
// }

// type CmsPreviewTemplate =
//     | CmsPreviewReactTemplate

export type ScriptOptions = {
    /**
     * Listen to CMS events.
     * @see https://decapcms.org/docs/registering-events/
     */
    [event in `on${Capitalize<CmsEventListener['name']>}`]?: (ctx: CmsEventHookContext) => Promise<void> | void
} & {

    /**
     * Called when the admin UI is initialized.
     * This hook is run in the browser.
     * @param ctx
     */
    onInitialized?(ctx: CmsHookContext): Promise<void> | void

    /**
     * Called when the config is written in builds.
     * This hook is run in Node.js.
     */
    onGenerated?(): Promise<void> | void

    /**
     * Called when the config is written.
     * This hook is run in both Vite build and serve commands.
     * This hook is run in Node.js.
     */
    onConfigUpdated?(): Promise<void> | void; onPreSave?(ctx: CmsEventHookContext): Promise<void> | void

    /**
     * Skip initializing until you call `CMS.init`
     * 
     * ```ts
     * // Browser
     * window.CMS.init()
     * // Node.js
     * import cms from 'decap-cms-app'
     * 
     * cms.init()
     * ```
     * 
     * @see https://decapcms.org/docs/manual-initialization/
     * @default false
     */
    useManualInitialization?: boolean

    // TODO: enable
    // widgets?: CmsCustomWidgetOptions[]

    /**
     * Register custom components to use in the rich text markdown editor field
     * @see https://decapcms.org/docs/custom-widgets/
     */
    markdownEditorComponents?: CmsEditorComponentOptions[]

    /**
     * Register custom file formatters.
     * @see https://decapcms.org/docs/custom-formatters/
     * @default []
     */
    formatters?: CmsEditorFormatter[]

    /**
     * Register custom styles to use in the CMS
     * Either pass the filename of the stylesheet or with `options.raw` pass the raw styles imported.
     * @see https://decapcms.org/docs/customization/
     * @default []
     */
    previewStylesheets?: (string | { style: string, options: { raw: true } })[]

    // previewTemplates?: CmsPreviewTemplate[]
}

// function resolveComponent (base: BaseCustomComponent) {
//     if (base.type !== 'vue') return base.component
//     else return veuary.applyVueInReact(base.component, base.options)
// }

function createCmsFunction <T>(method: string, items: T[] | undefined, createParams: (item: T) => string | null, options?: { base?: string, joinChar?: string }) {
    const create = (params: string) => `${options?.base ?? 'CMS'}.${method}(${params})`

    return (items ?? [])
        .map(item => {
            const params = createParams(item)
            if (!params) return null
            else return create(params)
        })
        .filter(Boolean)
        .join(options?.joinChar ?? '\n')
}

export function createScript (options: ScriptOptions) {
    const {
        useManualInitialization,
        markdownEditorComponents,
        formatters,
        previewStylesheets,
        // previewTemplates,
        // widgets,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onGenerated,
        onInitialized,
        ...eventHooks
    } = options

    const events = createCmsFunction('registerEventListener', Object.keys(eventHooks), (hookName) => {
        const hook = eventHooks[<keyof typeof eventHooks>hookName]
        if (!hook) return null
        else {
            const name = hookName.slice(2)[0].toLowerCase() + hookName.slice(3)
            return `{ name: '${name}', handler: data => { function ${hook.toString()}; ${hookName}({ app: CMS, ...data }) } }`
        }
    })

    const customFormatters = createCmsFunction('registerCustomFormat', formatters, ({ name, extension, formatter }) => {
        return `'${name}', '${extension}', ${formatter.toString()}`
    })

    const customStyles = createCmsFunction('registerPreviewStyle', previewStylesheets, (style) => {
        return typeof style === 'string' ? style : `${style.style}, { raw: ${style.options.raw} }`
    })

    const editorComponents = createCmsFunction('registerEditorComponent', markdownEditorComponents, (item) => {
        const { pattern, toPreview, toBlock, fromBlock, ...component } = item
        return `{ pattern: ${pattern}, toPreview: ${toPreview.toString()}, toBlock: ${toBlock.toString()}, fromBlock: ${fromBlock.toString()}, ...${JSON.stringify(component) }}`
    })

    return `
<script>
${useManualInitialization ? 'window.CMS_MANUAL_INIT = true;' : ''}
${onInitialized != undefined ? `window.onload = () => { function ${onInitialized.toString()}; onInitialized({ app: CMS }) }` : ''}
${customFormatters}
${customStyles}
${events}
${editorComponents}
</script>`
}
