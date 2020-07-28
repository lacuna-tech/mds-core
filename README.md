# Introduction

The `mds-core` repo contains a deployable reference implementation for working with MDS data. It is a beta release meant for testing by cities and other entities to gather feedback and improve the product.

The [Mobility Data Specification](https://github.com/openmobilityfoundation/mobility-data-specification/) (MDS) is a project of the [Open Mobility Foundation](http://www.openmobilityfoundation.org) (OMF) focused on digitally managing dockless e-scooters, bicycles and carshare in public spaces.

`mds-core` is...
- a reference MDS implementation usable by cities
- on-ramp for developers joining MDS ecosystem
- a tool for validating software implementations and data

`mds-core` is not...
- the only implementation of MDS
- where the specification is officially defined
- a place to define local policies or performance metrics
- a cloud service that will be operated by the OMF

**See the `mds-core` [Wiki](https://github.com/openmobilityfoundation/mds-core/wiki) for more details and help, including how to use it, architecture diagrams, release goals, how to help, the technical stack used, and slideshows and a video presentation.**

# Overview of `mds-core`

The included code represents what is currently up and running for Los Angeles as well as new features under development.  Includes the following:

* A current LADOT implementation of all MDS endpoints
* Development versions of mds-audit, mds-policy, and mds-compliance
* MDS logging (mds-logger), daily metrics (mds-daily) and Google sheet reporting app for technical compliance.

![Applications Overview](https://i.imgur.com/AGRubjE.png)

# Contributing, Code of Coduct, Licensing

Read the [CONTRIBUTING.md](.github/CONTRIBUTING.md) document for rules and guidelines on contribution, code of conduct, license, development dependencies, and release guidelines.

# Contents

### Stable Content
#### APIs
1. MDS-Agency 0.4.0 Implementation
2. MDS-Policy 0.4.0 Implementation

### Experimental Content
#### APIs
1. MDS-Agency `/stops` [PR](https://github.com/openmobilityfoundation/mobility-data-specification/pull/430)
2. MDS-Audit [PR](https://github.com/openmobilityfoundation/mobility-data-specification/pull/326)
3. MDS-Compliance [PR](https://github.com/openmobilityfoundation/mobility-data-specification/pull/333)
4. MDS-Config
5. MDS-Daily
6. MDS-Metrics-Sheet
7. MDS-Policy-Author
8. MDS-Web-Sockets

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

## Local Kubernetes Install

MDS can readily be provisioned to a [Kubernetes](https://kubernetes.io) capable cluster, be it a local or remote. The following steps describe how to build, deploy and operate against a local MDS cluster.

### Prerequisites

Obtain a local working copy of MDS:

```sh
git clone https://github.com/lacuna-tech/mds-core
cd mds-core
```

#### Docker/Kubernetes
OSX (Linux and Windows tbd)

Install [Docker Desktop](https://download.docker.com/mac/stable/Docker.dmg):

```sh
open https://download.docker.com/mac/stable/Docker.dmg
```

Start Docker-Desktop:

```sh
open /Applications/Docker.app
```

Configure Kubernetes in Docker:

```txt
select the 'Preferences' option
select the 'Resources' option
  apply the following minimal resource changes:
    CPUs: 4
    Memory: 8G
    Swap: 1G
select the 'Kubernetes' option
  select 'Enable Kubernetes' option
select 'Apply & Restart'
```

Verify:

```sh
which kubectl
kubectl config use-context docker-desktop
kubectl cluster-info
```

#### Install Istio
TBD

#### Build : compile source into deployable images

This will run the build, create the docker container images, and generate a manifest of the build output for use with Helm.

```sh
yarn clean
NODE_ENV=development yarn image
```

note that setting `NODE_ENV=development` will enable images to be built with the `:latest` tag instead of a specific version-branch-commit tag.

Verify:

```sh
docker images --filter reference='mds-*'
```

#### Run : install MDS

```sh
helm install --name mds ./helm/mds
```

Verify:

```sh
curl localhost/agency
```

#### In-Cluster Development
Due to the nature of `mds-core` being a highly portable Typescript project that compiles down into minified javascript for its images, rapidly development in-cluster can be quite challenging. `mds-core` utilizes [Okteto](https://okteto.com) to enable developers to actively develop their code in-cluster.

After following the above steps to set up a local MDS cluster, you can override an existing service's deployment with these steps.
1. Update `mds-core/okteto.yml`'s `name` field to be set to the service you wish to replace (e.g. `mds-agency`)
2.
```sh
curl https://get.okteto.com -sSfL | sh
```
3. Install the `Remote - Kubernetes` VSCode extension.
4. Run `> Okteto Up` from the VSCode command palette.
* After the remote session opens, execute this in the new shell window:
```sh
yarn
cd packages/${SERVICE_NAME}
yarn start
```
5. This session is now safe to close, and you can reattach with the `okteto.${SERVICE_NAME}` ssh profile automatically added for you using the VSCode `Remote - SSH` package.
6. When you're completely done with your session, run `> Okteto Down` from the VSCode command palette, or `okteto down` from terminal to revert the changes made by Okteto, and return your service to its previous deployment.

#### MDS Operations

MDS operates atop the following services: [Kubernetes](https://kubernetes.io), [Istio](https://istio.io), [NATS](https://nats.io), [PostgreSQL](https://www.postgresql.org) and [Redis](https://redis.io).

(tbd)

#### Additional Considerations

Access the database:

```sh
kubectl port-forward svc/mds-postgresql 5432 &
psql -h localhost -U mdsadmin mds
```

Access the cache:

```sh
kubectl port-forward svc/mds-redis-master 6379 &
redis-cli
```

#### Cleanup

```sh
helm del --purge mds
```

## Other

To commit code, you will need the pre-commit tool, which can be installed via `brew install pre-commit`.  For more information, see [SECURITY.md](.github/SECURITY.md)
