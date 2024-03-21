---
outline: deep
---

# Reference

## Plugin config

### config

The configuration for Decap CMS

- Type: [Decap config](#decap-config)
- Required: `true`

### login

Options to customize the login screen (by default on `/admin/index.html`).

- Type: `LoginPageOptions`
- Required: `false`

#### title

The page title for the CMS

- Type: `string`
- Default: `'Content Manager'`

#### icon

The favicon for the CMS

- Type: `'string'`
- Required: `false`

#### html

Use this to replace the login page from the plugin with your own html

- Type: `'string'`
- Required: `false`

#### head

Additional head items for the page. The following items are configured already:

- title
- viewport
- robots
- charset
- favicon (if used in the config)
- Netlify Identity script (if used in the config)
- custom config path (if used in the config)

Only the title, Netlify Identity script and custom config path cannot be overwritten by this option.
To disable these fields, do not use the feature.

- Type: `HeadConfig[]`
- Required: `false`

#### netlifyIdentityVersion

The version to use for the Netlify Identity widget.

- Type: `string`
- Default: `'1'`

## Decap config

While most options are the same as the [Decap CMS configuration options](https://decapcms.org/docs/configuration-options/), there are a few differences:

- all plugin config options are in **camel case**, not snake case! The plugin will convert it to snake case for the final `config.yml`.
- some plugin options are dependent on the Vite command run, so the final config can be different between your development and production setup
- some properties are changed, removed or added. See the list below for all differences.

### backend

#### local

This option replaces `local_backend` and allows you to set the value based on the Vite command run

#### useCurrentBranch

A new option to overwrite `backend.branch` if your backend is git based. Will read the current branch from `HEAD`.

### dir

The directory in the public dir where to write the Decap CMS configuration (`config.yml`) file.

- Default: `'admin'`
