import type { ResolvedConfig } from 'vite'

import { getGitData } from '../utils/git'
import { type LogFn } from '../utils/log'
import { objToSnakeCase } from '../utils/object'

import type {
    DecapCmsConfig,
    EnvContextOption,
} from '../types'

export type ViteCommand = ResolvedConfig['command']

function getBooleanFromEnv (value: EnvContextOption | undefined, command: ViteCommand): boolean {
    return value === 'dev'
        ? command === 'serve'
        : value === 'prod'
            ? command === 'build'
            : (value ?? false)
}

function resolveBackend (options: DecapCmsConfig['backend'], command: ViteCommand) {
    const { local, name, ...backend } = options
    const git = getGitData()

    const branch = 'useCurrentBranch' in options && getBooleanFromEnv(options.useCurrentBranch, command)
        ? git.getBranch()
        : 'branch' in backend
            ? backend.branch
            : undefined

    delete backend.useCurrentBranch

    const resolved = {
        local_backend: typeof local === 'object'
            ? objToSnakeCase(local)
            : getBooleanFromEnv(local, command),
        backend: {
            ...objToSnakeCase(backend),
            branch,
            name,
        }
    }

    return resolved
}

export function createConfigFile (config: DecapCmsConfig, command: ViteCommand, log: LogFn) {
    const { backend, collections, ...options } = config

    return {
        ...resolveBackend(backend, command),
        ...objToSnakeCase(options),
        collections: collections.map(col => {
            if ('fields' in col) {
                const { fields, ...data } = col

                return {
                    ...objToSnakeCase(data),
                    fields: fields.map(objToSnakeCase),
                }
            } else if ('files' in col) {
                const { files, ...data } = col

                return {
                    ...objToSnakeCase(data),
                    files: files.map(file => {
                        const { fields, ..._data } = file

                        return {
                            ...objToSnakeCase(_data),
                            fields: fields.map(objToSnakeCase),
                        }
                    }),
                }
            } else log('config', 'stderr', 'Missing either fields or files property in collection')
        }),
    }
}
