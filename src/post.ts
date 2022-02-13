import * as core from '@actions/core'
import * as exec from '@actions/exec'
import os from 'os'

const main = async () => {
  // reset docker host
  core.exportVariable('DOCKER_HOST', null)

  // reset ssh
  await exec.exec('rm', ['-rf', os.homedir() + '/.ssh'])
}

try {
  main()
} catch (error) {
  core.setFailed(`${error}`)
}