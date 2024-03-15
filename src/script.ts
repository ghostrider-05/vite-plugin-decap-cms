import { CmsEventListener, CMS } from 'decap-cms-core'

export interface CmsHookContext {
    app: CMS
}

export type CmsEventHookContext =
    & CmsHookContext
    & Parameters<CmsEventListener['handler']>[0]

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
     */
    useManualInitialization?: boolean
}

export function createScript (options: ScriptOptions) {
    const {
        useManualInitialization,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onGenerated,
        onInitialized,
        ...eventHooks
    } = options

    const events = Object.keys(eventHooks)
        .map(hookName => {
            const hook = eventHooks[<keyof typeof eventHooks>hookName]
            if (!hook) return null
            else {
                const name = hookName.slice(2)[0].toLowerCase() + hookName.slice(3)
                return `CMS.registerEventListener({ name: '${name}', handler: data => { function ${hook.toString()}; ${hookName}({ app: CMS, ...data }) } })`
            } 

        })
        .join('\n')
    return `
<script>
${useManualInitialization ? 'window.CMS_MANUAL_INIT = true;' : ''}
${onInitialized != undefined ? `window.onload = () => { function ${onInitialized.toString()}; onInitialized({ app: CMS }) }` : ''}
${events}
</script>`
}
