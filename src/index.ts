import { exec } from 'node:child_process'

import { stringify } from 'yaml'
import { type ResolvedConfig, type Plugin } from 'vite'

import type { DecapProxyOptions, Options } from './types'

import { createConfigFile } from './files/config'
import { createIndexFile } from './files/index'
import {
    resolveDir,
    writeToFolder,
} from './files'

import { createLogger, LogFn } from './log'

function validateLoadOptions (options: Options['load'], log: LogFn) {
    const valid = ['npm', 'cdn'].includes(options?.method ?? 'cdn')
       
    if (!valid) log('config', 'stderr', 'Invalid load options for decap-cms provided')
}

function runProxy (options: DecapProxyOptions | undefined, log: LogFn) {
    const port = (options?.port ?? 8081).toString()

    log('proxy', 'debug', `Starting decap-server on port ${port}`)
    const proxy = exec('npx decap-server', {
        ...(options?.process ?? {}),
        env: {
            PORT: port,
            MODE: options?.mode,
            LOG_LEVEL: options?.logLevel,
            GIT_REPO_DIRECTORY: options?.gitRepoDirectory,
            ...(options?.process?.env ?? {}),
        },
    })

    if (log('proxy', 'stdout')) proxy.stdout?.pipe(process.stdout)
    // if (log('proxy', 'stderr')) proxy.stderr?.pipe(process.stderr)

    proxy.on('error', (err) => {
        if ('code' in err && err.code === 'EADDRINUSE') {
            log('proxy', 'stderr', `Port ${port} for decap-server is already used by another process`)
        } else throw err
    })
    process.on('beforeExit', () => proxy.kill())
}

async function updateConfig (options: Options, config: ResolvedConfig, log: LogFn) {
    validateLoadOptions(options.load, log)

    const configFile = createConfigFile(options.config, config.command, log)

    await writeToFolder(
        resolveDir(config.publicDir, options.dir),
        {
            subfolder: 'admin',
            files: [
                { name: 'index.html', content: createIndexFile(options) },
                { name: 'config.yml', content: stringify(configFile, options.yml?.replacer, options.yml?.options) },
                // { name: 'npm.js', content: createCustomScript(), skip: options.load?.method !== 'npm' },
            ]
        }
    )

    if (config.command === 'serve' && configFile.local_backend !== false && (options.proxy?.enabled ?? true)) {
        runProxy(options.proxy, log)
    }

    await options.script?.onConfigUpdated?.()
    if (config.command === 'build') {
        await options.script?.onGenerated?.()
    }
}

export * from './types'
export * from './util'
export * from './vitepress'

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
