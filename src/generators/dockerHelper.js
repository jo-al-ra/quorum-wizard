import {
  formatNewLine,
  libRootDir,
  readFileToString,
  writeFile,
} from '../utils/fileUtils'
import { getFullNetworkPath } from './networkCreator'
import { buildCakeshopDir } from './cakeshopHelper'
import {
  isTessera,
  isCakeshop,
} from '../model/NetworkConfig'
import { info } from '../utils/log'
import { joinPath } from '../utils/pathUtils'

export function buildDockerCompose(config) {
  const hasTessera = isTessera(config.network.transactionManager)
  const hasCakeshop = isCakeshop(config.network.cakeshop)

  const quorumDefinitions = readFileToString(joinPath(
    libRootDir(),
    'lib/docker-compose-definitions-quorum.yml',
  ))

  const tesseraDefinitions = hasTessera ? readFileToString(joinPath(
    libRootDir(),
    'lib/docker-compose-definitions-tessera.yml',
  )) : ''

  const cakeshopDefinitions = hasCakeshop ? readFileToString(joinPath(
    libRootDir(),
    'lib/docker-compose-definitions-cakeshop.yml',
  )) : ''

  let services = config.nodes.map((node, i) => {
    let allServices = buildNodeService(node, i, hasTessera)
    if (hasTessera) {
      allServices = [allServices, buildTesseraService(node, i)].join('')
    }
    return allServices
  })
  if (hasCakeshop) {
    services = [services.join(''), buildCakeshopService(config.network.cakeshopPort)]
  }

  return [
    formatNewLine(quorumDefinitions),
    formatNewLine(tesseraDefinitions),
    formatNewLine(cakeshopDefinitions),
    'services:',
    services.join(''),
    buildEndService(config),
  ].join('')
}

export async function createDockerCompose(config) {
  info('Building docker-compose file...')
  const file = buildDockerCompose(config)

  const networkPath = getFullNetworkPath(config)
  const qdata = joinPath(networkPath, 'qdata')

  if (isCakeshop(config.network.cakeshop)) {
    buildCakeshopDir(config, qdata)
  }

  info('Writing start scripts...')
  const startCommands = 'docker-compose up -d'

  writeFile(joinPath(networkPath, 'docker-compose.yml'), file, false)
  writeFile(joinPath(networkPath, '.env'), createEnvFile(config, isTessera(config.network.transactionManager)), false)
  writeFile(joinPath(networkPath, 'start.sh'), startCommands, true)
  writeFile(joinPath(networkPath, 'stop.sh'), 'docker-compose down', true)
  info('Done')
}

function createEnvFile(config, hasTessera) {
  let env = `QUORUM_CONSENSUS=${config.network.consensus}
QUORUM_DOCKER_IMAGE=quorumengineering/quorum:${config.network.quorumVersion}`
  if (hasTessera) {
    env = env.concat(`
QUORUM_TX_MANAGER_DOCKER_IMAGE=quorumengineering/tessera:${config.network.transactionManager}`)
  }
  return env
}

function buildNodeService(node, i, hasTessera) {
  const txManager = hasTessera
    ? `depends_on:
      - txmanager${i + 1}
    environment:
      - PRIVATE_CONFIG=/qdata/tm/tm.ipc`
    : `environment:
      - PRIVATE_CONFIG=ignore`

  return `
  node${i + 1}:
    << : *quorum-def
    hostname: node${i + 1}
    ports:
      - "${node.quorum.rpcPort}:8545"
      - "${node.quorum.wsPort}:8645"
    volumes:
      - vol${i + 1}:/qdata
      - ./qdata:/examples:ro
    ${txManager}
      - NODE_ID=${i + 1}
    networks:
      quorum-examples-net:
        ipv4_address: 172.16.239.1${i + 1}`
}

function buildTesseraService(node, i) {
  return `
  txmanager${i + 1}:
    << : *tx-manager-def
    hostname: txmanager${i + 1}
    ports:
      - "${node.tm.thirdPartyPort}:9080"
    volumes:
      - vol${i + 1}:/qdata
      - ./qdata:/examples:ro
    networks:
      quorum-examples-net:
        ipv4_address: 172.16.239.10${i + 1}
    environment:
      - NODE_ID=${i + 1}`
}

function buildCakeshopService(port) {
  return `
  cakeshop:
    << : *cakeshop-def
    hostname: cakeshop
    ports:
      - "${port}:8999"
    volumes:
      - cakeshopvol:/qdata
      - ./qdata:/examples:ro
    networks:
      quorum-examples-net:
        ipv4_address: 172.16.239.186`
}

function buildEndService(config) {
  return `
networks:
  quorum-examples-net:
    name: quorum-examples-net
    driver: bridge
    ipam:
      driver: default
      config:
        - subnet: 172.16.239.0/24
volumes:
${config.nodes.map((_, i) => `  "vol${i + 1}":`).join('\n')}
  "cakeshopvol":`
}
