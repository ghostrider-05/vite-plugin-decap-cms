import { defineConfig } from 'vitepress'

import VitePluginDecapCMS from '../../../../src'
import pluginOptions from './plugin'
import { PluginOption } from 'vite'

export default defineConfig({
    vite: {
        plugins: [
            <PluginOption>VitePluginDecapCMS(pluginOptions),
        ],
    },

    title: 'vite-plugin-decap-cms',
    description: 'Connect your Vite project easily with Decap CMS',
    themeConfig: {
        nav: [
            { text: 'Guide', link: '/guide/' },
            { text: 'Reference', link: '/reference/' },
            {
                text: 'Examples',
                items: [
                    { text: 'Demo', link: '/demo/test-page' },
                    { text: 'Admin', link: '/admin/index.html', target: '_self' },
                ],
            },
        ],

        sidebar: {
            '/demo/': {
                base: '/demo/',
                items: [
                    {
                        text: 'Test page',
                        link: 'test-page'
                    },
                    {
                        text: 'Test 2',
                        link: 'test-2'
                    }
                ]
            },
            '/guide/': {
                base: '/guide/',
                items: [
                    { text: 'Introduction', link: 'index.html' },
                    { text: 'Getting started', link: 'getting-started' },
                    { text: 'Configuration', link: 'configuration' },
                    { text: 'VitePress', link: 'vitepress' },
                ]
            }
        },

        externalLinkIcon: true,
        editLink: {
            pattern: ({ relativePath }) => `/admin/index.html#/edit/${relativePath.replace('.md', '').replace}`
        },

        socialLinks: [
            { icon: 'github', link: 'https://github.com/ghostrider-05/vite-plugin-decap-cms' },
        ],
    }
})