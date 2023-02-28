import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  split
} from '@apollo/client'
import Observable from 'zen-observable'
import { Trans } from 'react-i18next'

import resolvers from '../api/rootResolver'
import typePolicies from './typePolicies'
import { networkIdReactive } from './reactiveVars'

import messageMention from '../utils/messageMention'

let client

const cache = new InMemoryCache({
  typePolicies
})

const endpoints = {
  '1': 'https://api.thegraph.com/subgraphs/name/ensdomains/ens',
  '3': 'https://api.thegraph.com/subgraphs/name/ensdomains/ensropsten',
  '4': 'https://api.thegraph.com/subgraphs/name/ensdomains/ensrinkeby',
  '5': 'https://api.thegraph.com/subgraphs/name/ensdomains/ensgoerli'
}

function getGraphQLAPI() {
  const network = networkIdReactive()

  if (network > 100 && process.env.REACT_APP_GRAPH_NODE_URI) {
    return process.env.REACT_APP_GRAPH_NODE_URI
  }

  if (endpoints[network]) {
    return endpoints[network]
  }

  return endpoints['1']
}

/**
 *
 *  Error: sending a transaction requires a signer (operation="sendTransaction", code=UNSUPPORTED_OPERATION, version=contracts/5.4.1)
 * @param {*} str
 */
function handleFromPromiseErrMsg(str) {
  // {operation:xxxx,code:xxxx,version:xxxx}
  let obj = {}
  if (
    str.includes('operation') &&
    str.includes('code') &&
    str.includes('version')
  ) {
    // get first char '(' , ')'.
    let firstChar = str.indexOf('(')
    let lastChar = str.indexOf(')')
    // split (****,****,....) put in arr
    let strArr = str.substring(firstChar + 1, lastChar).split(',')
    // handle arr to obj
    strArr.map(item => {
      if (item.split('=')[1].includes('"')) {
        obj[item.split('=')[0].trim()] = item.split('=')[1].slice(1, -1)
      } else {
        obj[item.split('=')[0].trim()] = item.split('=')[1].trim()
      }
    })
    return obj
  }
  return obj
}

function fromPromise(promise, operation) {
  console.log('fromPromise_operation:', operation)
  return new Observable(observer => {
    promise
      .then(value => {
        operation.setContext({ response: value })
        observer.next({
          data: { [operation.operationName]: value },
          errors: []
        })
        observer.complete()
      })
      .catch(e => {
        if (e && e.data && e.data.code && e.data.message) {
          let errorMessages = e.data.message.split('---')
          let errorContent
          if (errorMessages.length == 2) {
            // get errorCode
            let errCode = errorMessages[0].split(':')[1].trim()
            errorContent = <Trans i18nKey={`errorCode.${errCode}`} />
          } else if (
            errorMessages.length == 1 &&
            errorMessages[0].startsWith(
              'err: insufficient funds for gas * price + value:'
            )
          ) {
            errorContent = 'Your wallet does not have enough matic!'
          } else {
            errorContent = e.data.message
          }
          messageMention({
            type: 'error',
            content: errorContent,
            duration: 3,
            style: { marginTop: '20vh' }
          })
        }
        let obj = handleFromPromiseErrMsg(e.toString())
        if (
          obj.operation === 'sendTransaction' &&
          obj.code === 'UNSUPPORTED_OPERATION'
        ) {
          messageMention({
            type: 'warn',
            content: <Trans i18nKey={'warnings.wallerCon'} />
          })
        }
        console.error('fromPromise error: ', e)
        observer.error.bind(observer)
      })
  })
}

export function setupClient() {
  const httpLink = new HttpLink({
    uri: () => getGraphQLAPI()
  })

  const web3Link = new ApolloLink(operation => {
    const { variables, operationName } = operation
    if (resolvers.Query[operationName]) {
      return fromPromise(
        resolvers.Query[operationName]?.apply(null, [null, variables]),
        operation
      )
    }

    return fromPromise(
      resolvers.Mutation[operationName]?.apply(null, [null, variables]),
      operation
    )
  })

  const splitLink = split(
    ({ operationName }) => {
      return resolvers.Query[operationName] || resolvers.Mutation[operationName]
    },
    web3Link,
    httpLink
  )

  const option = {
    cache,
    link: splitLink
  }

  client = new ApolloClient(option)
  return client
}

export default function getClient() {
  return client
}
