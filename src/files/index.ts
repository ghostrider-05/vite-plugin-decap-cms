import { createScript } from '../script'

import type { CdnLinkOptions, Options } from '../types'

function resolveCdnRoute (options?: CdnLinkOptions | boolean) {
    const getUrl = (host = 'https://unpkg.com/', version = '3.1.3') => {
        return `${host.endsWith('/') ? host : (host + '/')}decap-cms@^${version}/dist/decap-cms.js`
    }

    return typeof options === 'boolean'
        ? options ? getUrl() : undefined
        : typeof options === 'string'
            ? options
            : options != undefined
                ? getUrl(options.base, options.version)
                : undefined
}

interface LoginFeatures {
    custom_logo: boolean
    netlify_identity: boolean
    cdn_route: string | undefined
    config_route: string | undefined
}

function getIndexFeatures (options: Options): LoginFeatures {
    function useNetlifyIdentity (options: Options): boolean {
        return options.config.backend.name === 'git-gateway'
    }

    return {
        cdn_route: resolveCdnRoute(options.load == undefined || options.load.method === 'cdn' ? options.load?.options ?? true : undefined),
        custom_logo: 'logoUrl' in options.config
            ? options.config.logoUrl != undefined
            : 'logo_url' in options.config
                ? options.config.logo_url != undefined
                : false,
        netlify_identity: useNetlifyIdentity(options),
        config_route: options.config.dir
            ? options.config.dir + (!options.config.dir.endsWith('/') ? '/' : '') + 'config.yml'
            : undefined,
    }
}

export function createIndexFile (_options: Options) {
    const features: LoginFeatures = getIndexFeatures(_options)
    const options = _options.login

    const identifyScript = '<script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>'

    return `<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="noindex" />
        <title>${options?.title ?? 'Content Manager'}</title>${features.netlify_identity ? identifyScript : ''}
        ${features.config_route ? `<link href="${features.config_route}" type="text/yaml" rel="cms-config-url">` : ''}
        ${(options?.head ?? []).join('\n' + ' '.repeat(8))}
    </head>
    <body>
        ${features.cdn_route ? `<script src="${features.cdn_route}"></script>` : ''}
        ${_options.script ? createScript(_options.script) : ''}
    </body>
</html>${features.custom_logo ? `\n\n<style>
span[class*='CustomIconWrapper'] {
    width: auto;
}
</style>` : ''}`
}
