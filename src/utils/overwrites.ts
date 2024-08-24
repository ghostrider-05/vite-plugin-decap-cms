import type { CmsFieldBase } from 'decap-cms-core'

import type {
    DecapCmsFieldType,
    DecapCmsFieldWidget,
} from '../types'

import { createField } from './collection'

export type OverwriteOptions = Omit<CmsFieldBase, 'name'> & {
    /**
     * Hide this field in the CMS editor UI.
     * @default false
     */
    hidden?: boolean

    /**
     * Hide this field in the CMS editor UI and do not include it in the frontmatter.
     * @default false
     */
    deleted?: boolean
}

export function createOverwriteableField<T extends DecapCmsFieldType>(
    widget: T,
    data: Omit<DecapCmsFieldWidget<T>, 'widget'>,
    overwrites?: OverwriteOptions,
): DecapCmsFieldWidget<T> | DecapCmsFieldWidget<'hidden'> | undefined {
    if (overwrites != undefined) {
        const toAdd = (key: Exclude<keyof OverwriteOptions, 'hidden' | 'deleted'>): void => {
            if (overwrites?.[key] != undefined && data[key] !== overwrites[key]) data[key] = <never>overwrites[key]
        }

        for (const key of <(keyof OverwriteOptions)[]>Object.keys(overwrites)) {
            if (key !== 'hidden' && key !== 'deleted') {
                toAdd(key)
            }
        }
    }

    if (overwrites?.deleted) return undefined
    else if (overwrites?.hidden && widget !== 'hidden') return createField('hidden', data)
    else return <never>{
        ...data,
        widget,
    }
}
