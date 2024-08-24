import { type ResolvedConfig, type Plugin } from 'vite'

import type { Options } from './types'
import { updateConfig } from './update'

import { createLogger } from './utils/log'

export * from './types'
export * from './vitepress'

export * from './utils/collection'
export * from './utils/git'
export * from './utils/overwrites'

export default function VitePluginDecapCMS (options: Options): Plugin {
    let stored: ResolvedConfig | null = null

    return {
        name: 'vite-plugin-decap-cms',
        async configResolved(config) {
            const needsUpdate = stored != null
                ? (stored.command !== config.command || stored.publicDir !== config.publicDir)
                : true
            const log = createLogger(options.debug)

            if (needsUpdate) {
                await updateConfig(options, config, log)
                stored = config

                log('config', 'debug', 'Updated Decap CMS configuration files')
            } else {
                log('config', 'debug', 'Skipped updating Decap CMS configuration files')
            }
        },
    } satisfies Plugin
}
