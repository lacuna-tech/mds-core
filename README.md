# Overview

Repo for LADOT MDS implementation for contribution to the Open Mobility Foundation.  It represents what is currently up and running for Los Angeles production MDS as well as new features under development.  Includes the following:

* A current LADOT implementation of all MDS endpoints
* Development versions of mds-audit, mds-policy, and mds-compliance
* MDS logging (mds-logger), daily metrics (mds-daily) and Google sheet reporting app for technical compliance.

## Installation

### Dependencies

* PostgreSQL
* Redis
* [Yarn](https://yarnpkg.com/en/docs/install#mac-stable)
* [NVM](https://github.com/nvm-sh/nvm#installation-and-update)

#### Database config on macOS
If you haven't installed PostegreSQL and Redis you can install them with homebrew on macOS
```
brew install postgresql
brew install redis
```

Make sure they are running before you run the tests
```
brew services start postgresql
brew services start redis
```

If you encounter the following error:
`FATAL: database “<user>” does not exist`

The following command should fix your issue
`createdb -h localhost`

To run tests, you will need this:
`createdb -h localhost mdstest`

Then add `export PG_NAME=mdstest` to your shell's environment file.  (The name is not important, but you'll need to point it somehwere.)

#### Node setup

You should have NVM already installed from the link above.  The top level directory of the project has a `.nvmrc` file and you should be able to run `nvm install` to get the right version of Node.

#### Package setup
Install [Lerna](https://lerna.js.org/)

```sh
yarn global add lerna
```

Install all packages.  Uses Yarn workspaces.

```sh
yarn install
```

#### Launching a local server for a package
Now you can work with each package

```sh
cd packages/mds-audit
yarn test
yarn start
```

#### Running the tests
You can also run all tests from the project root with
```
yarn test
```

### Package Management - Lerna

This repository is a monorepo and uses Lerna for working with its packages.

#### Example commands

Run all test suites at once

```sh
lerna run test
```

Run all tests suites sequentially

```sh
lerna run test --concurrency 1
```

Run tests for a particular package

```sh
lerna run test --scope mds-audit
```

Clean all dependencies

```sh
lerna run clean
```

Format all files

```sh
lerna run prettier
```

## Debugging with Visual Studio Code

### Node.js: Express Server

* Select the `Node.js Express Server` debug configuration
* Select the file that implements the Node/Express server for a package (typically `server.ts`) in the Explorer panel
* Press `F5`

### Mocha Tests

* Select the `Node.js: Mocha Tests` debug configuration
* Select any one of the files in a package's test folder
* Press `F5`

### Kubernetes

MDS can readily be provisioned to a [Kubernetes](https://kubernetes.io) capable cluster, be it a local or remote. The following steps describe how to build, deploy and operate against a local MDS cluster.

#### Prerequisites

Obtain a local working copy of MDS:

```sh
% git clone https://github.com/lacuna-tech/mds-core
% cd mds-core
```

OSX (Linux and Windows tbd)

Install [Docker Desktop](https://download.docker.com/mac/stable/Docker.dmg):

```sh
% open https://download.docker.com/mac/stable/Docker.dmg
```

Run:

```sh
% open /Applications/Docker.app
```

Lastly, configure Kubernetes in Docker Desktop:

```
preferences / resources / advanced: CPUs:6, Memory:8G, Swap:1G (minimal, apply more as possible)
preferences / kubernetes: enable kubernetes
```

Verify:

```sh
% which kubectl
% kubectl config set-context docker-desktop
% kubectl cluster-info
```

#### Bootstrap : install operational dependencies

In order to build and operate MDS, a number of suporting technologies are leveraged by ensuring they are installed and operational via a one-time `bootstap` process:

```sh
% ./bin/mdsctl bootstrap
```

The principle tools are: [homebrew](https://brew.sh), [bash-4.x+](https://www.gnu.org/software/bash/), [oq](https://github.com/Blacksmoke16/oq), [jq](https://stedolan.github.io/jq/), [yarn](https://yarnpkg.com/), [nvm](https://github.com/nvm-sh/nvm), [helm-2.14.1](https://helm.sh), [k9s](https://github.com/derailed/k9s), [kubectx](https://github.com/ahmetb/kubectx), [git](https://git-scm.com/), [gcloud](https://cloud.google.com/sdk/) and [awscli](https://aws.amazon.com/cli/). Additionally the following services are provisioned: [istio](https://istio.io) and [nats](https://nats.io).

Verify:

```sh
% kubectl -n istio-system get pods
% kubectl -n nats get pods
% k9s &
```

#### Build : compile source into deployable images

Compiling and packaging MDS into a deployable form is achived as follows:

```sh
% ./bin/mdsctl build
```

Verify:

```sh
% docker images | grep mds*
```

#### Run : install MDS

(tbd: ?best profile?)

```sh
% ./bin/mdsctl -p minimal install:mds
```

Verify:

```sh
% curl localhost/agency
```

#### MDS Operations

MDS operates atop the following services: [Kubernetes](https://kubernetes.io), [Istio](https://istio.io), [NATS](https://nats.io), [PostgreSQL](https://www.postgresql.org) and [Redis](https://redis.io).

(tbd)

#### Additional Considerations

Access the database:

```sh
% ./bin/mdsctl cli:postgresql
```

Access the cache:

```sh
% ./bin/mdsctl cli:redis
```

(tbd) Access the event stream:

```sh
% ./bin/mdsctl install:natsbox
```

Access the MDS cluster:

```sh
% k9s
```

Display the complete set of operations:

```sh
% ./bin/mdsctl
```

#### Cleanup

```sh
% ./bin/mdsctl uninstall:mds uninstall
```

## Other

To commit code, you will need the pre-commit tool, which can be installed via `brew install pre-commit`.  For more information, see [SECURITY.md](.github/SECURITY.md)

## Contributing

See [CONTRIBUTING.md](.github/CONTRIBUTING.md)
