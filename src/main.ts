import * as core from '@actions/core'
import * as exec from '@actions/exec'
import os from 'os'
import fs from 'fs'

import getOptions, {Options, validateOptions} from './options'

const main = async () => {
  // retrieve the options
  const options: Options = getOptions()

  if (!validateOptions(options)) {
    process.exit(1)
  }

  const sshDir = os.homedir() + '/.ssh'

  // ensure clear ssh setup
  await exec.exec('rm', ['-rf', sshDir])
  await exec.exec('mkdir', ['-p', sshDir])

  // write necessary files & set modes
  fs.writeFileSync(`${sshDir}/id_rsa`, options.sshKey)
  await exec.exec('chmod', ['400', `${sshDir}/id_rsa`])

  // pass host validation
  if (options.skipStrictHostKeyChecking) {
    fs.writeFileSync(`${sshDir}/config`, 'Host *\n  StrictHostKeyChecking no')
    await exec.exec('chmod', ['400', `${sshDir}/config`])
  } else {
    fs.writeFileSync(`${sshDir}/known_hosts`, options.knownHosts!)
    await exec.exec('chmod', ['400', `${sshDir}/known_hosts`])
  }

  // setup remote docker environment
  core.exportVariable('DOCKER_HOST', `ssh://${options.remoteHostUser}@${options.remoteHost}`)
}

try {
  main()
} catch (error) {
  core.setFailed(`${error}`)
}