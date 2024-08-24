import { mkdir, writeFile } from 'node:fs/promises'
import { resolve, isAbsolute, sep } from 'node:path'

import { stringify } from 'yaml'
import { type ResolvedConfig } from 'vite'

import type { Options } from './types'

import { createConfigFile } from './files/config'
import { createIndexFile } from './files/index'

import { LogFn } from './utils/log'
import { runProxy } from './proxy'

function resolveDir (publicDir: string, dir?: string) {
    return dir 
        ? (isAbsolute(dir) ? dir : resolve(dir))
        : publicDir
}

interface FolderWriteOptions {
    subfolder?: string
    files: {
        name: string
        content: string
        skip?: boolean
    }[]
}

async function writeToFolder (folder: string, options: FolderWriteOptions) {
    const dir = folder + (options.subfolder ? (sep + options.subfolder) : '')
    await mkdir(dir, { recursive: true })

    for (const file of options.files.filter(f => !f.skip)) {
        await writeFile(dir + sep + file.name, file.content, {
            encoding: 'utf-8',
        })
    }
}

function validateLoadOptions (options: Options['load'], log: LogFn) {
    const valid = ['npm', 'cdn'].includes(options?.method ?? 'cdn')
       
    if (!valid) log('config', 'stderr', 'Invalid load options for decap-cms provided')
}

export async function updateConfig (options: Options, config: ResolvedConfig, log: LogFn) {
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
