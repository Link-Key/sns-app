// import { setupENS } from '@ensdomains/ui'
import { setupSNS, setupSNSResolver } from 'sns-app-contract-api'
import { isENSReadyReactive } from '../reactiveVars'

const INFURA_ID =
  window.location.host === 'sns.chat'
    ? '5a380f9dfbb44b2abf9f681d39ddc382' // High performance version
    : '5a380f9dfbb44b2abf9f681d39ddc382' // Free version

let sns = {},
  snsResolver = {},
  snsAddress = undefined

export async function setup({
  reloadOnAccountsChange,
  enforceReadOnly,
  enforceReload,
  customProvider,
  snsAddress
}) {
  let option = {
    reloadOnAccountsChange: false,
    enforceReadOnly,
    enforceReload,
    customProvider,
    snsAddress
  }
  option.infura = INFURA_ID
  if (enforceReadOnly) {
    option.infura = INFURA_ID
  }
  const {
    sns: snsInstance,
    snsResolver: snsResolverInstance,
    providerObject
  } = await setupSNS(option)
  sns = snsInstance
  snsResolver = snsResolverInstance
  isENSReadyReactive(true)
  return { sns, snsResolver, providerObject }
}

export function getSnsResolver() {
  // if (JSON.stringify(snsResolver) === '{}') {
  //   snsResolver = await setupSNSResolver({
  //     reloadOnAccountsChange: false,
  //     enforceReadOnly: true,
  //     enforceReload: false,
  //     infura: INFURA_ID,
  //     name: name,
  //     sns: sns
  //   })
  // }
  return snsResolver
}

export default function getSNS() {
  return sns
}

export function getSNSAddress() {
  return sns.registryAddress
}
