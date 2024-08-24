import { exec } from 'node:child_process'

import type { DecapProxyOptions } from './types'

import { type LogFn } from './utils/log'

export function runProxy (options: DecapProxyOptions | undefined, log: LogFn) {
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
