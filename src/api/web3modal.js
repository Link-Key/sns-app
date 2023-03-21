import { setup as setupSNS } from '../apollo/mutations/sns'
import {
  isReadOnlyReactive,
  networkIdReactive,
  networkReactive,
  web3ProviderReactive
} from '../apollo/reactiveVars'
// import { getNetwork, getNetworkId, isReadOnly } from '@ensdomains/ui'
import { getNetwork, getNetworkId, isReadOnly } from 'sns-app-contract-api'
import { providers } from 'ethers'
import OkxIconSvg from '../assets/okxWalletIcon.svg'
import messageMention from 'utils/messageMention'
import { handleUnsupportedNetwork, isSupportedNetwork } from 'setup'

const INFURA_ID =
  window.location.host === 'sns.chat'
    ? '5a380f9dfbb44b2abf9f681d39ddc382'
    : '5a380f9dfbb44b2abf9f681d39ddc382'

const PORTIS_ID = '57e5d6ca-e408-4925-99c4-e7da3bdb8bf5'

let provider
const option = {
  network: 'mainnet', // optional
  cacheProvider: true, // optional
  providerOptions: {
    walletconnect: {
      package: () => import('@walletconnect/web3-provider'),
      packageFactory: true,
      options: {
        infuraId: INFURA_ID
      }
    },
    bitkeep: {
      package: true
    },
    'custom-okx': {
      display: {
        logo: OkxIconSvg,
        name: 'OKX Wallet',
        description: 'Connect to your OKX Wallet'
      },
      options: {
        // infuraId: INFURA_ID
        jsonRpcUrl: `https://polygon-mainnet.infura.io/v3/${INFURA_ID}`
      },
      package: () => import('@walletconnect/ethereum-provider'),
      connector: async (ProviderPackage, options) => {
        try {
          const provider = window.okexchain
          if (!window.okxwallet) {
            throw 'Please install OKX Wallet'
          }
          await okxwallet.enable()
          // await provider.enable()
          return provider
        } catch (error) {
          console.log('connectorErr:', error)
        }
      }
    }
  }
}

let web3Modal
export const connect = async () => {
  try {
    const Web3Modal = (await import('bitkeep-web3modal')).default

    web3Modal = new Web3Modal(option)
    provider = await web3Modal.connect()

    if (!provider) throw 'Please install a wallet!'

    const chainIdHex = await provider.request({ method: 'eth_chainId' })

    if (!isSupportedNetwork(parseInt(chainIdHex, 16))) {
      handleUnsupportedNetwork(provider)
      return
    }

    await setupSNS({
      customProvider: provider,
      reloadOnAccountsChange: false,
      enforceReload: true
    })
    return provider
  } catch (e) {
    if (e !== 'Modal closed by user') {
      throw e
    }
    throw e
  }
}

export const disconnect = async function() {
  if (web3Modal) {
    await web3Modal.clearCachedProvider()
  }

  // Disconnect wallet connect provider
  if (provider && provider.disconnect) {
    provider.disconnect()
  }
  await setupSNS({
    reloadOnAccountsChange: false,
    enforceReadOnly: true,
    enforceReload: false
  })

  isReadOnlyReactive(isReadOnly())
  web3ProviderReactive(null)
  networkIdReactive(await getNetworkId())
  networkReactive(await getNetwork())
}

export const setWeb3Modal = x => {
  web3Modal = x
}
