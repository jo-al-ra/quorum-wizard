# Quorum Creator

Quorum Creator is a tool that allows you to quickly set up and run Quorum networks.
You can control consensus, privacy, network details and more for a customized setup.
Additionally you can choose to deploy our chain explorer, [Cakeshop](https://github.com/jpmorganchase/cakeshop), to easily view and monitor your network.

## Getting Started

Clone the [quorum-creator](https://github.com/QuorumEngineering/quorum-creator) repo

```
git clone https://github.com/QuorumEngineering/quorum-creator.git
```

To build the project run:
```
yarn install
yarn start
```

To start the cli run:
```
node build/index.js
```

## Using the CLI

The CLI has 3 options to generate the necessary files to start up your quorum networks

### Quickstart

This is the fastest way to set up a quorum network.
Selecting this option will create bash scripts to run a 3 node raft network with tessera and cakeshop

To start the network:

```
cd network/3-nodes-raft-tessera-bash
./start.sh
```

To stop the network:

```
./stop.sh
```

To easily test the network we provide a private contract and a public contract:

```
./runscript.sh private-contract-3nodes.js
./runscript.sh public-contract.js
```

### Replicating quorum-examples 7nodes network

The easiest way to bring up the 7nodes network from [quorum-examples](https://github.com/jpmorganchase/quorum-examples/tree/master/examples/7nodes)
This selection will use the pregenerated keys from 7nodes example.
It also provides options for minor customization:

  * Consensus algorithm
    * Istanbul - a pbft inspired algorithm with transaction finality
    * Raft - provides faster blocktimes, transaction finality, on demand block creation
  * Number of nodes (2-7)
    * A minimum of 3 nodes are recommended for raft consensus
    * A minimum of 5 nodes are recommended for istanbul consensus
    * Maximum number of nodes is 7 - which will replicate the 7nodes example
  * Transaction Manager
    * tessera - if you would like to use the privacy features of Quorum
    * none - if you will only need to support public transactions
  * Cakeshop
    * true - will start up cakeshop alongside your network

### Custom network

The option designed for a fully customized quorum network.
In addition to customizing consensus, node count, transaction manager, and cakeshop, this option provides even more customization:

  * Key generation
    * instead of using pregenerated keys from 7nodes, you can choose to generate fresh keys
    * default = false
  * Network id
    * 10 is the default id, but you have the option to enter a different one
  * Genesis location
    * quorum-creator will automatically generate the genesis file based on your consensus selection
    * or you can provide your own genesis file
  * Port customization
    * if you don't want to use the default ports from 7nodes examples select this option
    * bash
      * will be able to enter custom ip, rpc port, websocket port, and raft port for each quorum node
      * will be able to enter custom ip, third party port, p2p port, and enclave port for each tessera node
    * docker
      * will be able to enter custom exposed rpc port and raft port for quorum configuration
      * will be able to enter custom exposed third party port and p2p port for tessera configuration

## Starting/Stopping the Quorum network

After quorum-creator finishes generating the necessary files to bring up your network, it will give you the location of where these files are located.

All created networks are stored in the network folder and by the following naming convention: numberOfNodes-consensus-txManager-generationType

To start a network, either bash or docker, cd into the network folder and run ./start.sh

To stop a network, run ./stop.sh for the same location

## Sample interation with the Quorum network

In the your network's directory we provide a runscript.sh to run test contracts.

A sample public-contract.js is provided to test deploying a simpleStorage public contract

Sample private-contracts.js for a 3+ node network and a 7+ node network are provided. These will only be successful if the nodes in the network use the pregenerated 7nodes keys

If you chose to generate new tessera keys, you will need to replace the tessera public key in private-contract.js with the public key of the desired tessera recipient (tm.pub)

## Developing
`yarn install` to get all the dependencies.

`yarn test:watch` to automatically run tests on changes

`yarn start` to automatically build on changes to any files in the src directory

`node build/index.js` to run
