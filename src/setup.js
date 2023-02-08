// import { getAccounts, getNetwork, getNetworkId } from '@ensdomains/ui'
import { Trans } from 'react-i18next'
import { getAccounts, getNetwork, getNetworkId } from 'sns-app-contract-api'

import { isReadOnly } from 'sns-app-contract-api/src/web3'

// import { setup } from './apollo/mutations/ens'
import { setup } from './apollo/mutations/sns'
import { connect } from './api/web3modal'
import {
  accountsReactive,
  favouritesReactive,
  globalErrorReactive,
  isAppReadyReactive,
  isReadOnlyReactive,
  networkIdReactive,
  networkReactive,
  reverseRecordReactive,
  subDomainFavouritesReactive,
  web3ProviderReactive,
  snsNameReactive
} from './apollo/reactiveVars'
import { setupAnalytics } from './utils/analytics'
import { getReverseRecord } from './apollo/sideEffects'
import { safeInfo, setupSafeApp } from './utils/safeApps'
import getSNS from './apollo/mutations/sns'
import messageMention from 'utils/messageMention'

export const setFavourites = () => {
  favouritesReactive(
    JSON.parse(window.localStorage.getItem('ensFavourites')) || []
  )
}

export const setSubDomainFavourites = () => {
  subDomainFavouritesReactive(
    JSON.parse(window.localStorage.getItem('ensSubDomainFavourites')) || []
  )
}

export const handleUnsupportedNetwork = (provider = window.ethereum) => {
  try {
    if (provider) {
      provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x89' }]
      })
      provider.on('chainChanged', function(networkId) {
        console.log('networkId:', networkId)
        window.location.reload()
      })
    }
    globalErrorReactive({
      ...globalErrorReactive(),
      network: 'Unsupported Network'
    })
  } catch (error) {
    console.log('handleUnsupportedNetworkErr:', error)
    window.location.reload()
  }
}

export const isSupportedNetwork = networkId => {
  switch (networkId) {
    // case 1:
    // case 3:
    // case 4:
    // case 5:
    case 137:
    case 80001:
      return true
    default:
      return false
  }
}

export const getProvider = async reconnect => {
  try {
    let provider
    if (
      process.env.REACT_APP_STAGE === 'local' &&
      process.env.REACT_APP_ENS_ADDRESS
    ) {
      const { providerObject } = await setup({
        reloadOnAccountsChange: false,
        customProvider: 'http://localhost:8545',
        ensAddress: process.env.REACT_APP_ENS_ADDRESS
      })
      provider = providerObject
      let labels = window.localStorage['labels']
        ? JSON.parse(window.localStorage['labels'])
        : {}
      window.localStorage.setItem(
        'labels',
        JSON.stringify({
          ...labels,
          ...JSON.parse(process.env.REACT_APP_LABELS)
        })
      )
      return provider
    }

    const safe = await safeInfo()
    if (safe) {
      const provider = await setupSafeApp(safe)
      return provider
    }
    // Used to delete localStorage cache
    // window.localStorage.clear()
    if (
      window.localStorage.getItem('WEB3_CONNECT_CACHED_PROVIDER') ||
      reconnect
    ) {
      provider = await connect()
      return provider
    }

    const { providerObject } = await setup({
      reloadOnAccountsChange: false,
      enforceReadOnly: true,
      enforceReload: false
    })
    provider = providerObject
    return provider
  } catch (e) {
    if (e.error && e.error.message.match(/Unsupported network/)) {
      handleUnsupportedNetwork(e.provider)
      return
    }
  }

  try {
    const { providerObject } = await setup({
      reloadOnAccountsChange: false,
      enforceReadOnly: true,
      enforceReload: false
    })
    let provider = providerObject
    return provider
  } catch (e) {
    console.error('getProvider readOnly error: ', e)
  }
}

export const setWeb3Provider = async provider => {
  web3ProviderReactive(provider)

  const accounts = await getAccounts()

  if (provider) {
    if (provider.events?.removeAllListeners)
      provider.events.removeAllListeners()
    accountsReactive(accounts)
    const account = accounts[0]
    const sns = getSNS()
    const name = await sns.getNameOfOwner(account)
    snsNameReactive(name)
  }

  provider?.on('chainChanged', async _chainId => {
    const networkId = await getNetworkId()
    if (!isSupportedNetwork(networkId)) {
      handleUnsupportedNetwork(provider)
      return
    }

    await setup({
      customProvider: provider,
      reloadOnAccountsChange: false,
      enforceReload: true
    })

    networkIdReactive(networkId)
    networkReactive(await getNetwork())
  })

  provider?.on('accountsChanged', async accounts => {
    accountsReactive(accounts)
    const account = accounts[0]
    const sns = getSNS()
    const name = await sns.getNameOfOwner(account)
    snsNameReactive(name)
  })

  return provider
}

export default async reconnect => {
  try {
    // setFavourites()
    // setSubDomainFavourites()

    const provider = await getProvider(reconnect)

    if (!provider) throw 'Please install a wallet'

    const networkId = await getNetworkId()

    if (!isSupportedNetwork(networkId)) {
      handleUnsupportedNetwork(provider)
      return
    }

    networkIdReactive(await getNetworkId())
    networkReactive(await getNetwork())

    await setWeb3Provider(provider)

    if (accountsReactive?.[0]) {
      reverseRecordReactive(await getReverseRecord(accountsReactive?.[0]))
    }

    isReadOnlyReactive(isReadOnly())

    setupAnalytics()

    isAppReadyReactive(true)
  } catch (e) {
    messageMention({
      type: 'warn',
      content: <Trans i18nKey={'warnings.wallerCon'} />
    })
    console.error('setup error: ', e)
  }
}
