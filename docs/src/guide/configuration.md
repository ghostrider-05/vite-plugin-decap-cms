# Configuration

This plugin will create the two required files for Decap CMS: `index.html` and `config.yml`

## Load

By default, this plugin will use the `unpkg` CDN to serve Decap CMS.
You can also change this CDN url or the version imported.

```ts
export const options: Options = {
    load: {
        method: 'cdn',
        options: '<my_cdn_url>'
    }
}
```

:::info Other methods
Contributions for other methods, such as `NPM`, are appreciated!
:::

## Login screen

You can customize the contents of `index.html`, which is the screen you see when you log in, with [the login options](../reference/index.md#login).

## CMS configuration

The `config.yml` file is the core of the CMS. You can specify all options, such as backend and collections, with [the config option](../reference/index.md#config)

## CMS customization

Most advanced CMS customization options can be set in [the script option](../reference/index.md#script)
