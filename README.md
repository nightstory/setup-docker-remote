# Setup SSH & DOCKER_HOST in a GitHub Action

A small wrapper to set up SSH and DOCKER_HOST for the remote deployment.<br/>
⚠️ Resets `.ssh` before and after running the action. Sets and resets `DOCKER_HOST`.

## Inputs
- `ssh_key`
    - Raw content of the private key (`~/.ssh/id_rsa`)
    - Environment alternative: `SDR_SSH_KEY`
- `ssh_host_user`
    - SSH username, e.g. from `username@host` use `username`
    - Environment alternative: `SDR_SSH_HOST_USER`
- `ssh_host`
    - SSH host, e.g. from `username@host` use `host`
    - Environment alternative: `SDR_SSH_HOST`
- `ssh_known_hosts`
    - Raw content of the known_hosts file (`~/.ssh/known_hosts`)
    - Environment alternative: `SDR_SSH_KNOWN_HOSTS`
- `ssh_skip_strict_host`
    - If true, will set `StrictHostKeyChecking` to `no` for `*` host
    - default: `true`
    - Environment alternative: `SDR_SSH_SKIP_STRICT_HOST`

## Example usage

Without explicit `known_hosts` used:
```yaml
uses: nightstory/setup-docker-remote@v1
with:
  ssh_key: ${{ env.SSH_PRIVATE_KEY_ID_RSA }}
  ssh_host_user: root
  ssh_host: ${{ env.DEV_SERVER_IP }}
```

With explicit `known_hosts` used:
```yaml
uses: nightstory/setup-docker-remote@v1
with:
  ssh_key: ${{ env.SSH_PRIVATE_KEY_ID_RSA }}
  ssh_host_user: root
  ssh_host: ${{ env.DEV_SERVER_IP }}
  ssh_skip_strict_host: false
  ssh_known_hosts: ${{ env.SSH_KNOWN_HOSTS }}
```

With environment variables:
```yaml
name: 'remote-deploy'

on:
  push:
    branches: [ '*' ]

env:
  SDR_SSH_KEY: ${{ secrets.SSH_PRIVATE_KEY_ID_RSA }}
  SDR_SSH_HOST_USER: ${{ secrets.SDR_SSH_HOST_USER }}
  SDR_SSH_HOST: ${{ secrets.DEV_SERVER_IP }}

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: 'Setup SSH and docker remote host'
        uses: nightstory/setup-docker-remote@v1
      
      - name: 'Execute docker ps via remote host'
        run: docker ps
```

## What it essentially does
```shell
rm -rf $HOME/.ssh && \
  mkdir -p $HOME/.ssh && \
  echo "$ssh_key" > $HOME/.ssh/id_rsa && \
  echo  "$ssh_known_hosts" > $HOME/.ssh/known_hosts && \
  chmod 400 $HOME/.ssh/id_rsa && \
  chmod 400 $HOME/.ssh/known_hosts

export DOCKER_HOST="ssh://$ssh_host_user@$ssh_host"
```
Or, in the unsafe way (instead of the known_hosts part):
```shell
printf "Host *\n  StrictHostKeyChecking no" >> $HOME/.ssh/config
```

...and cleanup:
```shell
rm -rf $HOME/.ssh
unset DOCKER_HOST
```

## License
Licensed under MIT license.<br/>
Please also see [licenses.txt](lib_main/licenses.txt)