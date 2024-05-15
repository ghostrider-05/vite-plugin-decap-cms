import { exec } from 'child_process'

import { stringify } from 'yaml'
import { type ResolvedConfig, type Plugin } from 'vite'

import type { DecapProxyOptions, Options } from './types'

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

function runProxy (options: DecapProxyOptions | undefined) {
    const proxy = exec('npx decap-server', {
        ...(options?.process ?? {}),
        env: {
            ...(options?.process?.env ?? {}),
            PORT: (options?.port ?? 8081).toString()
        },
    })

    proxy.stdout?.pipe(process.stdout)

    proxy.on('error', (err) => {
        if ('code' in err && err.code === 'EADDRINUSE') {
            console.log('[PROXY] Port is already used')
        } else throw err
    })
    process.on('beforeExit', () => proxy.kill())
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

    if (config.command === 'serve' && (options.proxy?.enabled ?? true)) {
        runProxy(options.proxy)
    }

    await options.script?.onConfigUpdated?.()
    if (config.command === 'build') {
        await options.script?.onGenerated?.()
    }
}

export * from './types'
export * from './util'

export default function VitePluginDecapCMS (options: Options): Plugin {
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
