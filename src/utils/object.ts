type CamelToSnakeCase<S extends string, I extends string = never> = S extends `${infer T}${infer U}` ?
    S extends I ? S :
    `${T extends Capitalize<T> ? '_' : ''}${Lowercase<T>}${CamelToSnakeCase<U>}` :
    S

export type KeysToSnakeCase<T> = {
    // eslint-disable-next-line @typescript-eslint/ban-types
    [K in keyof T as CamelToSnakeCase<string & K, 'i18n'>]: T[K] extends boolean ? T[K] : T[K] extends {} ? T[K] extends unknown[] ? KeysToSnakeCase<T[K][number]>[] : KeysToSnakeCase<T[K]> : T[K]
}

type CamelCase<S extends string> = S extends `${infer P1}_${infer P2}${infer P3}`
  ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
  : Lowercase<S>

export type KeysToCamelCase<T> = {
    // eslint-disable-next-line @typescript-eslint/ban-types
    [K in keyof T as CamelCase<string &K>]: T[K] extends boolean ? T[K] : T[K] extends {} ? T[K] extends unknown[] ? KeysToCamelCase<T[K][number]>[] : KeysToCamelCase<T[K]> : T[K]
}

export const objToSnakeCase = <T extends object>(obj: T) => {
    const ignoredKeys = ['i18n']
    const camelToSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)

    return Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [ignoredKeys.includes(k) ? k : camelToSnakeCase(k), v])
    ) as KeysToSnakeCase<{ [k in keyof T]: T[k] }>
}

export const keyof = <T extends object> (obj: T) => Object.keys(obj) as (keyof T)[]

export function filterUndefined<T>(item: T | undefined): item is T {
    return item != undefined
}

export function omit<
    // eslint-disable-next-line @typescript-eslint/ban-types
    T extends {},
    K extends string
>(obj: T | undefined, keys: K[]): Omit<T, K> {
    if (!obj) return {} as Omit<T, K>

    const validEntries = Object.entries(obj).filter(([key]) => !(<string[]>keys).includes(key))
    return Object.fromEntries(validEntries) as Omit<T, K>
}

export type PickRequired<O extends object, K extends keyof O> = Omit<O, K> & Required<Pick<O, K>>

export function pick<
    // eslint-disable-next-line @typescript-eslint/ban-types
    T extends {},
    K extends keyof T
>(obj: T | undefined, keys: K[]): Pick<T, K> {
    if (!obj) return {} as Pick<T, K>

    const validEntries = Object.entries(obj).filter(([key]) => (<string[]>keys).includes(key))
    return Object.fromEntries(validEntries) as Pick<T, K>
}
