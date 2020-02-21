import { join } from 'path'
import { generateKeys } from './keyGen'
import { isTessera } from '../model/NetworkConfig'
import { pathToQuorumBinary, pathToBootnode, pathToTesseraJar } from './binaryHelper'
import { executeSync } from '../utils/execUtils'
import { createFolder, writeFile } from '../utils/fileUtils'

jest.mock('./binaryHelper')
jest.mock('../utils/execUtils')
jest.mock('../utils/fileUtils')

describe('generates keys', () => {
  it('generates quorum keys', () => {
    const config = {
      network: {
        transactionManager: 'none'
      },
      nodes : ['nodes']
    }
    pathToQuorumBinary.mockReturnValueOnce('quorumPath')
    pathToBootnode.mockReturnValue('bootnodePath')
    generateKeys(config, 'keyPath')

    const expected = `cd keyPath/key1 && quorumPath account new --keystore keyPath/key1 --password password.txt 2>&1
  bootnodePath -genkey=nodekey
  bootnodePath --nodekey=nodekey --writeaddress > enode
  find . -type f -name 'UTC*' -execdir mv {} key ';'
  `
    expect(createFolder).toBeCalledWith(join('keyPath', 'key1'), true)
    expect(writeFile).toBeCalledWith(join('keyPath', 'key1', 'password.txt'), '')
    expect(executeSync).toHaveBeenCalledWith(expected)
  })

  it('generates quorum and tessera keys', () => {
    const config = {
      network: {
        transactionManager: 'tessera'
      },
      nodes : ['nodes']
    }
    pathToQuorumBinary.mockReturnValueOnce('quorumPath')
    pathToBootnode.mockReturnValueOnce('bootnodePath')
    pathToTesseraJar.mockReturnValueOnce('tesseraPath')
    generateKeys(config, 'keyPath')

    const withTessera = `cd keyPath/key1 && quorumPath account new --keystore keyPath/key1 --password password.txt 2>&1
  bootnodePath -genkey=nodekey
  bootnodePath --nodekey=nodekey --writeaddress > enode
  find . -type f -name 'UTC*' -execdir mv {} key ';'
  java -jar tesseraPath -keygen -filename tm`

    expect(createFolder).toBeCalledWith(join('keyPath', 'key1'), true)
    expect(writeFile).toBeCalledWith(join('keyPath', 'key1', 'password.txt'), '')
    expect(executeSync).toHaveBeenCalledWith(withTessera)
  })
})
