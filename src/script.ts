import type { CmsEventListener, CMS, Formatter } from 'decap-cms-core'

import type { DecapCmsField, DecapCmsFieldWidget } from './types'

export interface CmsHookContext {
    app: CMS
}

export type CmsEventHookContext =
    & CmsHookContext
    & Parameters<CmsEventListener['handler']>[0]

export type CmsEditorComponentOptions = Omit<DecapCmsFieldWidget<'object'>, 'widget' | 'label' | 'fields' | ''> & {
    id: string
    label: string
    fields: DecapCmsField[]
}

export interface CmsEditorFormatter {
    name: string
    extension: string
    formatter: Formatter
}

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

    widgets?: []

    editorComponents?: CmsEditorComponentOptions[]

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
}

export function createScript (options: ScriptOptions) {
    const {
        useManualInitialization,
        editorComponents,
        formatters,
        previewStylesheets,
        widgets,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onGenerated,
        onInitialized,
        ...eventHooks
    } = options

    const joinChar = '\n'

    const events = Object.keys(eventHooks)
        .map(hookName => {
            const hook = eventHooks[<keyof typeof eventHooks>hookName]
            if (!hook) return null
            else {
                const name = hookName.slice(2)[0].toLowerCase() + hookName.slice(3)
                return `CMS.registerEventListener({ name: '${name}', handler: data => { function ${hook.toString()}; ${hookName}({ app: CMS, ...data }) } })`
            } 

        })
        .filter(Boolean)
        .join(joinChar)

    const customFormatters = (formatters ?? [])
        .map(({ name, extension, formatter }) => `CMS.registerCustomFormat('${name}', '${extension}', ${formatter.toString()})`)
        .join(joinChar)

    const customStyles = (previewStylesheets ?? [])
        .map(style => 'CMS.registerPreviewStyle(' + (typeof style === 'string' ? style : `${style.style}, { raw: ${style.options.raw} }`) + ')')
        .join(joinChar)

    return `
<script>
${useManualInitialization ? 'window.CMS_MANUAL_INIT = true;' : ''}
${onInitialized != undefined ? `window.onload = () => { function ${onInitialized.toString()}; onInitialized({ app: CMS }) }` : ''}
${customFormatters}
${customStyles}
${events}
</script>`
}
