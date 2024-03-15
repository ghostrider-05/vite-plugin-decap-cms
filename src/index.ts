import { stringify } from 'yaml'
import { type ResolvedConfig, type Plugin } from 'vite'

import type { Options } from './types'

import { createConfigFile } from './files/config'
import { createIndexFile } from './files/index'
import {
    resolveDir,
    writeToFolder,
} from './files'

function validateLoadOptions (options: Options['load']) {
    const valid = ['npm', 'cdn'].includes(options?.method ?? 'cdn')
       
    if (!valid) throw new Error('Invalid load options for decap-cms provided')
}

async function updateConfig (options: Options, config: ResolvedConfig) {
    validateLoadOptions(options.load)

    const loginFile = createIndexFile(options)

    const configFile = createConfigFile(options.config, config.command)

    await writeToFolder(
        resolveDir(config.publicDir, options.dir),
        {
            subfolder: 'admin',
            files: [
                { name: 'index.html', content: loginFile },
                { name: 'config.yml', content: stringify(configFile, options.yml?.replacer, options.yml?.options) },
                // { name: 'npm.js', content: createCustomScript(), skip: options.load?.method !== 'npm' },
            ]
        }
    )

    await options.script?.onConfigUpdated?.()
    if (config.command === 'build') {
        await options.script?.onGenerated?.()
    }
}

export * from './types'
export * from './util'

export default function VitePluginDecapCMS (options: Options) {
    let stored: ResolvedConfig | null = null
    const debug = (...str: string[]) => {
        if (options.debug) console.debug(str)
    }

    return {
        name: 'vite-plugin-decap-cms',
        async configResolved(config) {
            const isUpdated = stored != null ? (stored.command !== config.command || stored.publicDir !== config.publicDir) : true

            if (isUpdated) {
                await updateConfig(options, config)
                stored = config

                debug('\nUpdated Decap CMS configuration')
            } else {
                debug('\nSkipped updating Decap CMS')
            }
        },
    } satisfies Plugin
}
