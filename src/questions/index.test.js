import { createQuickstartConfig, createReplica7NodesConfig, createCustomConfig, isBash, isTessera, isDocker } from '../model/NetworkConfig'
import { customize, quickstart, replica7Nodes } from './index'
import { buildBash } from '../generators/bashHelper'
import { createDockerCompose } from '../generators/dockerHelper'
import { prompt } from 'inquirer'
import { getCustomizedBashNodes, getCustomizedDockerPorts } from './promptHelper'
import { createDirectory, includeCakeshop } from '../generators/networkCreator'
import { copyFile, writeFile, cwd, libRootDir, readFileToString } from '../utils/fileUtils'
import { TEST_CWD, TEST_LIB_ROOT_DIR } from '../utils/testHelper'

jest.mock('inquirer')
jest.mock('../model/NetworkConfig')
jest.mock('../generators/bashHelper')
jest.mock('../generators/dockerHelper')
jest.mock('../questions/promptHelper')
jest.mock('../generators/networkCreator')
jest.mock('../utils/fileUtils')
cwd.mockReturnValue(TEST_CWD)
libRootDir.mockReturnValue(TEST_LIB_ROOT_DIR)

const REPLICA_7NODES_CONFIG = {
  numberNodes: '5',
  consensus: 'istanbul',
  quorumVersion: '2.4.0',
  transactionManager: '0.10.2',
  deployment: 'docker-compose',
  cakeshop: false
}

const CUSTOM_BASH_CONFIG = {
  numberNodes: '5',
  consensus: 'istanbul',
  quorumVersion: '2.4.0',
  transactionManager: '0.10.2',
  deployment: 'bash',
  cakeshop: true,
  generateKeys: false,
  networkId: 10,
  customizePorts: true,
  nodes: ['nodes'],
  dockerCustom: undefined
}

const CUSTOM_DOCKER_CONFIG = {
  numberNodes: '5',
  consensus: 'istanbul',
  quorumVersion: '2.4.0',
  transactionManager: '0.10.2',
  deployment: 'docker-compose',
  cakeshop: true,
  generateKeys: false,
  networkId: 10,
  customizePorts: true,
  nodes: [],
  dockerCustom: ['ports']
}

test('quickstart', async () => {
  const fakeConfig = { network: {name: 'test'}, nodes: ['nodes']}
  createQuickstartConfig.mockReturnValue(fakeConfig)
  isBash.mockReturnValue(true)
  isDocker.mockReturnValue(false)
  isTessera.mockReturnValue(true)
  includeCakeshop.mockReturnValue(true)
  await quickstart()
  expect(createQuickstartConfig).toHaveBeenCalled()
  expect(createDirectory).toHaveBeenCalledWith(fakeConfig)
  expect(buildBash).toHaveBeenCalledWith(fakeConfig)
})

test('7nodes replica', async () => {
  const fakeConfig = { network: {name: 'test'}, nodes: ['nodes']}
  prompt.mockResolvedValue(REPLICA_7NODES_CONFIG)
  createReplica7NodesConfig.mockReturnValue(fakeConfig)
  isBash.mockReturnValue(true)
  isTessera.mockReturnValue(true)
  isDocker.mockReturnValue(false)
  readFileToString.mockReturnValueOnce('pubKey')
  await replica7Nodes()
  expect(createReplica7NodesConfig)
    .toHaveBeenCalledWith(REPLICA_7NODES_CONFIG)
  expect(createDirectory).toHaveBeenCalledWith(fakeConfig)
  expect(buildBash).toHaveBeenCalledWith(fakeConfig)
})

test('customize bash', async () => {
  const fakeConfig = { network: {name: 'test'}, nodes: ['nodes']}
  createCustomConfig.mockReturnValue(fakeConfig)
  isBash.mockReturnValue(true)
  isTessera.mockReturnValue(true)
  isDocker.mockReturnValue(false)
  includeCakeshop.mockReturnValue(true)
  prompt.mockResolvedValue(CUSTOM_BASH_CONFIG)
  getCustomizedBashNodes.mockReturnValueOnce(['nodes'])
  readFileToString.mockReturnValueOnce('pubkey')
  await customize()

  expect(createCustomConfig).toHaveBeenCalledWith(CUSTOM_BASH_CONFIG)
  expect(createDirectory).toHaveBeenCalledWith(fakeConfig)
  expect(buildBash).toHaveBeenCalledWith(fakeConfig)
})

test('customize docker', async () => {
  const fakeConfig = { network: {name: 'test'}, nodes: []}
  createCustomConfig.mockReturnValue(fakeConfig)
  isBash.mockReturnValue(false)
  isTessera.mockReturnValue(true)
  isDocker.mockReturnValue(true)
  includeCakeshop.mockReturnValue(true)
  prompt.mockResolvedValue(CUSTOM_DOCKER_CONFIG)
  getCustomizedDockerPorts.mockReturnValueOnce(['ports'])
  await customize()

  expect(createCustomConfig).toHaveBeenCalledWith(CUSTOM_DOCKER_CONFIG)
  expect(createDirectory).toHaveBeenCalledWith(fakeConfig)
  expect(createDockerCompose).toHaveBeenCalledWith(fakeConfig)
})
