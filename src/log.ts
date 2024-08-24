import type { Options } from './types'

type LogType = 
    | 'proxy'
    | 'config'

export type LogFn =
    | ((type: LogType, pipe: 'debug' | 'stdout' | 'stderr', ...data: string[]) => void)
    | ((type: LogType, pipe: 'debug' | 'stdout' | 'stderr') => boolean)
    | ((type: LogType, ...data: string[]) => void)

export function createLogger (options: Options['debug']) {
    return function (type: LogType, pipe: string, ...data: string[]) {
        if (options == undefined || options === false) {
            if (!data.length) return false
            else return
        }

        if (!data.length) return true

        const fn = pipe === 'stderr' ? 'error' : (pipe === 'debug' ? 'debug' : 'log')
        const pipeDefined = ['debug', 'stdout', 'stderr'].includes(pipe)

        for (const msg of (pipeDefined ? data : [pipe, ...data])) {
            console[fn](`[Vite Decap] - [${type.toUpperCase()}] ` + msg)
        }
    } as LogFn
}
