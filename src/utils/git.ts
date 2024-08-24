import { execSync } from 'node:child_process'

export function getGitData() {
    const executeGit = (command: string) => {
        try {
            return execSync(command)
                .toString('utf8')
                .replace(/[\n\r\s]+$/, '')
        } catch {
            // error
        }
    }

    return {
        getBranch() {
            return executeGit('git rev-parse --abbrev-ref HEAD')
        },
        getCommitSha() {
            return executeGit('git rev-parse HEAD')
        },
    }
}
