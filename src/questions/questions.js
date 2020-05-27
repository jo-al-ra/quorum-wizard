import {
  transformCakeshopAnswer,
  validateNetworkId,
  validateNumberStringInRange,
} from './validators';
import {
  getDownloadableGethChoices,
  getDownloadableTesseraChoices,
} from '../generators/binaryHelper';
import {isRaft} from '../model/NetworkConfig';

export const INITIAL_MODE = {
  type: 'list',
  name: 'mode',
  message: `
Welcome to Quorum Wizard!

This tool allows you to easily create bash and docker files to start up a quorum network.
You can control consensus, privacy, network details and more for a customized setup.
Additionally you can choose to deploy our chain explorer, Cakeshop, to easily view and monitor your network.

We have 3 options to help you start exploring Quorum:

  1.  Quickstart - our 1 click option to create a 3 node raft network with tessera and cakeshop

  2.  Simple Network - using pregenerated keys from quorum 7nodes example,
      this option allows you to choose the number of nodes (7 max), consensus mechanism, transaction manager, and the option to deploy cakeshop

  3.  Custom Network - In addition to the options available in #2, this selection allows for further customization of your network.
      Choose to generate keys, customize ports for both bash and docker, or change the network id

Quorum Wizard will generate your startup files and everything required to bring up your network.
All you need to do is go to the specified location and run ./start.sh

`,

  choices: [
    {
      name: 'Quickstart (3-node raft network with tessera and cakeshop)',
      value: 'quickstart',
    },
    {name: 'Simple Network', value: 'simple'},
    {name: 'Custom Network', value: 'custom'},
    {name: 'Exit', value: 'exit'},
  ],
};

export const DEPLOYMENT_TYPE = {
  type: 'list',
  name: 'deployment',
  message:
    'Would you like to generate bash scripts or a docker-compose file to bring up your network?',
  choices: [
    'bash',
    'docker-compose',
    // 'kubernetes',
    // 'vagrant',
  ],
};

export const NUMBER_NODES = {
  type: 'input',
  name: 'numberNodes',
  message: (answers) =>
    isRaft(answers.consensus)
      ? 'Input the number of nodes (1-7) you would like in your network - a minimum of 3 is recommended'
      : 'Input the number of nodes (1-7) you would like in your network - a minimum of 4 is recommended',
  default: (answers) => (isRaft(answers.consensus) ? '3' : '4'),
  validate: (input) => validateNumberStringInRange(input, 1, 7),
};

export const CONSENSUS_MODE = {
  type: 'list',
  name: 'consensus',
  message:
    'Select your consensus mode - istanbul is a pbft inspired algorithm with transaction finality while raft provides faster blocktimes, transaction finality and on-demand block creation',
  choices: ['istanbul', 'raft'],
};

export const QUORUM_VERSION = {
  type: 'list',
  name: 'quorumVersion',
  message: 'Which version of Quorum would you like to use?',
  choices: ({deployment}) => getDownloadableGethChoices(deployment),
};

export const TRANSACTION_MANAGER = {
  type: 'list',
  name: 'transactionManager',
  message:
    'Choose a version of tessera if you would like to use private transactions in your network, otherwise choose "none"',
  choices: ({deployment}) => getDownloadableTesseraChoices(deployment),
};

export const CAKESHOP = {
  type: 'list', // can't transform answer from boolean on confirm questions, so it had to be a list
  name: 'cakeshop',
  message:
    'Do you want to run Cakeshop (our chain explorer) with your network?',
  choices: ['No', 'Yes'],
  default: 'No',
  filter: transformCakeshopAnswer,
};

export const KEY_GENERATION = {
  type: 'confirm',
  name: 'generateKeys',
  message:
    "Would you like to generate keys for your network? (selecting 'no' will use insecure keys that are not suitable for Production use)",
  default: true,
};

export const NETWORK_ID = {
  type: 'input',
  name: 'networkId',
  message:
    '10 is the default network id in quorum but you can use a different one',
  default: '10',
  validate: (input) => validateNetworkId(input),
};

export const HOST_IP = {
  type: 'input',
  name: 'hostIP',
  message: 'Please enter the IP address of this host',
  default: 'none',
};

export const EXTEND_NETWORK = {
  type: 'confirm',
  name: 'extendNetwork',
  message: 'Do you want to extend an existing network?',
  default: false,
};

export const INIT_FOLDER_LOCATION = {
  type: 'input',
  name: 'genesisLocation',
  message: `Enter the location of the folder containing the existing genesis.json, permissioned-nodes.json and static-nodes.json.

    If the files are not present, a dummy genesis.json containing data for this node will be generated.
    The existing nodes will have to accept the new node and their config files have to be copied here.`,
  default: 'none',
};

export const CUSTOMIZE_PORTS = {
  type: 'confirm',
  name: 'customizePorts',
  message: 'Would you like to customize your node ports?',
  default: false,
};

export const QUICKSTART_QUESTIONS = [];
export const SIMPLE_QUESTIONS = [
  DEPLOYMENT_TYPE,
  CONSENSUS_MODE,
  NUMBER_NODES,
  QUORUM_VERSION,
  TRANSACTION_MANAGER,
  CAKESHOP,
];
export const CUSTOM_QUESTIONS = [
  ...SIMPLE_QUESTIONS,
  KEY_GENERATION,
  NETWORK_ID,
  HOST_IP,
  EXTEND_NETWORK,
  INIT_FOLDER_LOCATION,
  CUSTOMIZE_PORTS,
];
