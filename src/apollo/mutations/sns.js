import { setupSNS, setupIERC20 } from 'sns-app-contract-api'
import { isENSReadyReactive } from '../reactiveVars'

const INFURA_ID =
  window.location.host === 'sns.chat'
    ? '5a380f9dfbb44b2abf9f681d39ddc382' // High performance version
    : '5a380f9dfbb44b2abf9f681d39ddc382' // Free version

let sns = {},
  snsResolver = {},
  snsAddress = undefined,
  snsWithdraw = {},
  snsInvite = {},
  provider

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
    snsWithdraw: snsWithdrawInstance,
    invite: snsInviteInstance,
    providerObject
  } = await setupSNS(option)

  sns = snsInstance
  snsResolver = snsResolverInstance
  snsWithdraw = snsWithdrawInstance
  snsInvite = snsInviteInstance

  provider = providerObject
  isENSReadyReactive(true)
  return { sns, snsResolver, providerObject, snsWithdraw, snsInvite }
}

export function getSnsResolver() {
  return snsResolver
}

export default function getSNS() {
  return sns
}

export function getSNSAddress() {
  return sns.registryAddress
}

export function getSNSWithdraw() {
  return snsWithdraw
}

export const getSNSInvite = () => {
  return snsInvite
}

export async function getSNSIERC20(address) {
  const snsIERC20Instance = await setupIERC20({ snsAddress: address, provider })
  return snsIERC20Instance
}
