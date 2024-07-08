import { createScript } from '../script'

import type { CdnLinkOptions, HeadConfig, Options } from '../types'

export const defaultDecapCmsCdnVersion = '3.1.11' as const
export const defaultNetlifyIdentityVersion = '1' as const

const addSlash = (path: string, slash = '/') => path.endsWith(slash) ? path : path + slash

function resolveCdnRoute (options?: CdnLinkOptions | boolean) {
    const getUrl = (host = 'https://unpkg.com/', version: string = defaultDecapCmsCdnVersion) => {
        return `${addSlash(host)}decap-cms@^${version}/dist/decap-cms.js`
    }

    return typeof options === 'boolean'
        ? options ? getUrl() : undefined
        : typeof options === 'string'
            ? options
            : options != undefined
                ? getUrl(options.base, options.version)
                : undefined
}

function resolveHead (head: (HeadConfig | { skip: boolean, head: HeadConfig })[]) {
    return head.reduce((output, config) => {
        if (typeof config === 'string') return output.concat(config)

        if ('skip' in config) {
            if (config.skip) return output
            if (typeof config.head === 'string') return output.concat(config.head)
        }

        const item: Exclude<HeadConfig, string> = 'head' in config ? <never>config.head : config

        let str = `<${item[0]}`
        for (const key in item[1]) {
            str += ` ${key}="${item[1][key]}"`
        }
        str += (item[0] === 'meta' ? '/>' : '>')

        if (item[2] == undefined) return output.concat(str)

        str += item[2] + `</${item[0]}>`
        return output.concat(str)
    }, <string[]>[])
}

interface LoginFeatures {
    custom_logo: boolean
    cdn_route: string | undefined
    head: (options: Options['login']) => string[]
}

function getIndexFeatures (config: Options['config'], loadOptions: Options['load']): LoginFeatures {
    const configRoute = config.dir ? addSlash(config.dir) + 'config.yml' : undefined

    return {
        cdn_route: resolveCdnRoute(loadOptions == undefined || loadOptions.method === 'cdn' ? loadOptions?.options ?? true : undefined),
        custom_logo: 'logoUrl' in config
            ? config.logoUrl != undefined
            : 'logo_url' in config
                ? config.logo_url != undefined
                : false,
        head: (options: Options['login']) => resolveHead([
            ['meta', { charset: 'utf-8' }],
            ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }],
            ['meta', { name: 'robots', content: 'noindex' }],
            ...(options?.head ?? []),
            ['title', {}, options?.title ?? 'Content Manager'],
            {
                head: ['link', { rel: 'favicon', ref: options?.icon ?? '' }],
                skip: options?.icon == undefined,
            },
            {
                head: ['script', { src: `https://identity.netlify.com/v${defaultNetlifyIdentityVersion}/netlify-identity-widget.js` }],
                skip: config.backend.name !== 'git-gateway',
            },
            {
                head: ['link', { type: 'text/yaml', rel: 'cms-config-url', href: configRoute! }],
                skip: configRoute == undefined,
            },
        ])
    }
}

export function createIndexFile (pluginOptions: Options) {
    const { config, load, login: options, script } = pluginOptions
    if (options?.html) return options.html

    const features: LoginFeatures = getIndexFeatures(config, load)

    return `<!DOCTYPE html>
<html>
    <head>
        ${features.head(options).join('\n' + ' '.repeat(8))}
    </head>
    <body>
        ${features.cdn_route ? `<script src="${features.cdn_route}"></script>` : ''}
        ${script ? createScript(script) : ''}
        ${pluginOptions.login?.additionalHtml ? `${pluginOptions.login?.additionalHtml}\n\n<div id="nc-root"></div>` : ''}
    </body>
</html>${features.custom_logo ? `\n\n<style>
span[class*='CustomIconWrapper'] {
    width: auto;
}
</style>` : ''}`
}
