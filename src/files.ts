import { mkdir, writeFile } from 'fs/promises'
import { resolve, isAbsolute, sep } from 'path'

export function resolveDir (publicDir: string, dir?: string) {
    return dir 
        ? (isAbsolute(dir) ? dir : resolve(dir))
        : publicDir
}

interface FolderWriteOptions {
    subfolder?: string
    files: {
        name: string
        content: string
        skip?: boolean
    }[]
}

export async function writeToFolder (folder: string, options: FolderWriteOptions) {
    const dir = folder + (options.subfolder ? (sep + options.subfolder) : '')
    await mkdir(dir, { recursive: true })

    for (const file of options.files.filter(f => !f.skip)) {
        await writeFile(dir + sep + file.name, file.content, {
            encoding: 'utf-8',
        })
    }
}
