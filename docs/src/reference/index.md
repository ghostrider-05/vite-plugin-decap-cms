# Reference

While most options are the same as the [Decap CMS configuration options](https://decapcms.org/docs/configuration-options/), there are a few differences:

- all plugin config options are in **camel case**, not snake case! The plugin will convert it to snake case for the final `config.yml`.
- some plugin options are dependent on the Vite command run, so the final config can be different between your development and production setup

## Decap config

### backend

#### local

This option replaces `local_backend` and allows you to set the value based on the Vite command run

#### useCurrentBranch

A new option to overwrite `backend.branch` if your backend is git based. Will read the current branch from `HEAD`.

### dir

The directory in the public dir where to write the Decap CMS configuration (`config.yml`) file.

- Default: `'admin'`
