import type {
    CollectionType,
    DecapCmsCollection,
    DecapCmsCollectionFile,
    DecapCmsFieldType,
    DecapCmsFieldWidget,
} from '../types'
import { keyof } from './object'

export function createField<T extends DecapCmsFieldType>(
    widget: T,
    data: Omit<DecapCmsFieldWidget<T>, 'widget'>
): DecapCmsFieldWidget<T> {
    return <never>{
        ...data,
        widget,
    }
}

export function createFolderCollection(data: DecapCmsCollection<'folder'>) {
    return data
}

export function createFile(data: DecapCmsCollectionFile) {
    return data
}

export function createFileCollection(data: DecapCmsCollection<'file'>) {
    return data
}

type SharedAction<Type> = (Type extends (string | undefined) ? true : Type extends (unknown[] | undefined) ? true : false) extends true ? ({
    /**
     * The action to take when combining options from shared and collection options:
     * - append: if specified in another collection, the new options will be appended to the shared value
     * - overwrite: if specified in another collection, the new options will overwrite the share value
     * @default 'overwrite'
     */
    action?: 'append' | 'overwrite'
    value: Type
} | Type) : Type

type PartialIf<If extends boolean, T> = If extends true ? Partial<T> : T

export type SharedDecapCmsCollection<Type extends CollectionType> = Omit<DecapCmsCollection<Type>,
    | 'fields'
    | 'files'
>

export type SharedDecapCmsCollectionOptions<Type extends CollectionType> = {
    [K in keyof SharedDecapCmsCollection<Type>]: SharedAction<SharedDecapCmsCollection<Type>[K]>
}

export interface SharedOptions<Parent extends boolean = true> extends Pick<Exclude<SharedAction<string>, string>, 'action'> {
    /**
     * Changes the types on where required name fields (name, labels) must be defined:
     * on the shared or collection options.
     * @default true
     */
    requiredNameOnChildOptions?: Parent
}

export function createSharedCollectionOptions <
    Type extends CollectionType = CollectionType,
    Parent extends boolean = true,
    ChildType extends CollectionType = Type,
>(
    shared: PartialIf<Parent, SharedDecapCmsCollectionOptions<Type>>,
    options?: SharedOptions<Parent>,
) {
    return function (
        collection: PartialIf<Parent extends false ? true : false, SharedDecapCmsCollection<ChildType>>,
    ): SharedDecapCmsCollection<ChildType> {
        // Exclude the shared option if field is in the options, since the filter field also has a value property
        const isSharedOptions = (value: unknown) => {
            return value != undefined && typeof value === 'object' && 'value' in value && !('field' in value)
        }

        const combinedWithShared = keyof(collection).reduce<PartialIf<Parent extends false ? true : false, SharedDecapCmsCollection<ChildType>>>((output, key) => {
            const collectionValue = collection[key]
            const sharedValue = shared[key as keyof typeof shared]
            
            if (sharedValue != undefined) {
                if (isSharedOptions(sharedValue)) {
                    const sharedOptions: Exclude<SharedAction<string | string[]>, string | string[]> = <never>sharedValue
                    const action = sharedOptions.action ?? options?.action ?? 'overwrite'

                    if (action === 'overwrite') {
                        output[key] = collectionValue
                        return output
                    } else if (action === 'append') {
                        if (typeof collectionValue === 'string') {
                            output[key] = <never>(sharedOptions.value + collectionValue)
                        } else if (Array.isArray(collectionValue)) {
                            output[key] = <never>(<string[]>sharedOptions.value).concat(collectionValue)
                        }

                        return output
                    }
                }
            }

            output[key] = collectionValue
            return output
        }, <never>{})

        const sharedRaw = keyof(shared).reduce<PartialIf<Parent, SharedDecapCmsCollectionOptions<Type>>>((output, key) => {
            const value = shared[key]

            if (isSharedOptions(value)) {
                output[key] = (<{ value: never }>value).value
            } else {
                output[key] = value
            }

            return output
        }, <never>{})

        return {
            ...sharedRaw,
            ...combinedWithShared,
        } as SharedDecapCmsCollection<ChildType>
    }
}
