import * as core from '@actions/core'

export interface Options {
  readonly sshKey: string
  readonly skipStrictHostKeyChecking: boolean
  readonly knownHosts: string | null
  readonly remoteHostUser: string
  readonly remoteHost: string
}

const findOption: (inputKey: string, envKey: string) => (string | null) =
  (inputKey, envKey) => {
    const input = core.getInput(inputKey)

    if (input.length === 0) {
      return process.env[envKey] ?? null
    } else {
      return input
    }
  }

const requireOption: (inputKey: string, envKey: string) => string =
  (inputKey, envKey) => {
    const result = findOption(inputKey, envKey)
    if (!result) {
      core.setFailed(`input ${inputKey} (or env ${envKey}) is required but was missing`)
      process.exit(1)
    }
    return result!
  }

const getFlag: (inputKey: string, envKey: string, def: boolean) => boolean =
  (inputKey, envKey, def) => {
    const result = findOption(inputKey, envKey)
    return result ? result === 'true' : def
  }

const getOptions: () => Options = () => ({
  sshKey: requireOption('ssh_key', 'SDR_SSH_KEY')!,
  skipStrictHostKeyChecking: getFlag('ssh_skip_strict_host', 'SDR_SSH_SKIP_STRICT_HOST', true),
  knownHosts: findOption('ssh_known_hosts', 'SDR_SSH_KNOWN_HOSTS'),
  remoteHostUser: requireOption('ssh_host_user', 'SDR_SSH_HOST_USER'),
  remoteHost: requireOption('ssh_host', 'SDR_SSH_HOST'),
})

export const validateOptions: (options: Options) => boolean =
  (o) => {
    let result = true

    if ([o.sshKey, o.remoteHostUser, o.remoteHost].some(v => v.length === 0)) {
      core.setFailed(`ssh_key, ssh_host and ssh_host_user must not be empty`)
      result = false
    }

    if (!o.skipStrictHostKeyChecking && (!o.knownHosts || o.knownHosts.length === 0)) {
      core.setFailed(`if ssh_skip_strict_host is false then ssh_known_hosts must be provided`)
      result = false
    }

    return result
  }

export default getOptions