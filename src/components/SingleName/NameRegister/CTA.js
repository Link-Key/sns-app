import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import styled from '@emotion/styled/macro'
import moment from 'moment'
import { css } from 'emotion'
import { useHistory } from 'react-router-dom'
import { Mutation } from '@apollo/client/react/components'
import { useTranslation } from 'react-i18next'
import EthVal from 'ethval'

import { trackReferral } from '../../../utils/analytics'
import { COMMIT, REGISTER } from '../../../graphql/mutations'

import Tooltip from 'components/Tooltip/Tooltip'
import PendingTx from '../../PendingTx'
import SnsButton from '../../Forms/Button'
import AddToCalendar from '../../Calendar/RenewalCalendar'
import { ReactComponent as DefaultPencil } from '../../Icons/SmallPencil.svg'
import { ReactComponent as DefaultOrangeExclamation } from '../../Icons/OrangeExclamation.svg'
import { useAccount } from '../../QueryAccount'
import { Modal, Button, Select, message } from 'antd'
import getSNS, { getSNSAddress, getSNSIERC20 } from 'apollo/mutations/sns'
import { UnknowErrMsgComponent } from 'components/UnknowErrMsg'
import messageMention from 'utils/messageMention'

const CTAContainer = styled('div')`
  display: flex;
  justify-content: flex-end;
  align-items: center;
`

const Pencil = styled(DefaultPencil)`
  margin-right: 5px;
`

const Prompt = styled('span')`
  color: #ffa600;
  margin-right: 10px;
`

const OrangeExclamation = styled(DefaultOrangeExclamation)`
  margin-right: 5px;
  height: 12px;
  width: 12px;
`

const LeftLink = styled(Link)`
  margin-right: 20px;
`

const ChooseCoinsBtn = styled('div')`
  display: flex;
  flex-direction: column;

  button {
    margin-top: 20px;
  }

  button:hover {
    color: white;
    background: #ea6060 !important;
  }
`

const { Option } = Select

function getCTA({
  step,
  incrementStep,
  secret,
  duration,
  label,
  hasSufficientBalance,
  coinsValueRef,
  coinsValueObj,
  setCoinsValue,
  txHash,
  setTxHash,
  setCommitmentTimerRunning,
  commitmentTimerRunning,
  isAboveMinDuration,
  refetch,
  refetchIsMigrated,
  readOnly,
  price,
  years,
  premium,
  history,
  t,
  ethUsdPrice,
  account,
  isSuspendRegister
}) {
  const [keyPrice, setKeyPrice] = useState(async () => {
    const sns = getSNS()
    sns.getKeyCoinsPrice().then(price => {
      setKeyPrice(new EthVal(`${price || 0}`).toEth().toFixed(3))
    })
  })

  const maticPrice = new EthVal(`${price || 0}`).toEth().toFixed(3)

  useEffect(() => {
    coinsValueRef.current = { ...coinsValueObj }
  }, [coinsValueObj])

  // use key coins register operation
  const getApproveOfKey = async mutate => {
    const sns = getSNS()
    const keyAddress = await sns.getKeyCoinsAddress()
    const keyCoins = await sns.getKeyCoinsPrice()

    // get IERC20 contract instance object
    const snsIERC20 = await getSNSIERC20(keyAddress)

    // get sns address
    const snsAddress = await getSNSAddress()

    // Authorization to SNS
    await snsIERC20.approve(snsAddress, keyCoins)

    message.loading({
      key: 1,
      content: t('z.transferSending'),
      duration: 0,
      style: { marginTop: '20vh' }
    })

    // Query if the authorization is successful
    // Query every three seconds, query ten times
    setTimeout(async () => {
      let timer,
        count = 0,
        allowancePrice
      timer = setInterval(async () => {
        try {
          count += 1
          // query authorization sns key price
          allowancePrice = await snsIERC20.allowance(account, snsAddress)
          const price = new EthVal(`${allowancePrice || 0}`).toEth().toFixed(3)
          if (price > 0) {
            clearInterval(timer)
            // destroy message mention
            message.destroy(1)
            // mint nft of key
            mutate()
          }
        } catch (e) {
          console.log('allowance:', e)
          clearInterval(timer)
          message.error({
            key: 2,
            content: <UnknowErrMsgComponent />,
            duration: 3,
            style: { marginTop: '20vh' }
          })
          // destroy message mention
          message.destroy(1)
        }
        if (count === 20) {
          clearInterval(timer)
          message.error({
            key: 3,
            content: t('z.transferBusy'),
            duration: 3,
            style: { marginTop: '20vh' }
          })
          // destroy message mention
          message.destroy(1)
        }
      }, 3000)
    }, 0)
  }

  switch (step) {
    case 'PRICE_DECISION':
      return (
        <Mutation
          mutation={COMMIT}
          variables={{ ownerAddress: account, ...coinsValueObj }}
          onCompleted={data => {
            const txHash = Object.values(data)[0]
            setTxHash(txHash)
            setCommitmentTimerRunning(true)
            incrementStep()
          }}
        >
          {mutate =>
            isAboveMinDuration && !readOnly ? (
              // hasSufficientBalance ? (
              !isSuspendRegister ? (
                <SnsButton
                  data-testid="request-register-button"
                  onClick={async () => {
                    if (label.length > 3) {
                      Modal.info({
                        style: { top: '20vh' },
                        title: (
                          <div
                            style={{ textAlign: 'center', fontWeight: '700' }}
                          >
                            {t('c.selectCoins')}
                          </div>
                        ),
                        content: (
                          <ChooseCoinsBtn>
                            <Button
                              danger
                              shape="round"
                              block
                              size="large"
                              onClick={() => {
                                Promise.resolve()
                                  .then(() => {
                                    const obj = {
                                      ...coinsValueObj,
                                      coinsType: 'key'
                                    }
                                    setCoinsValue(obj)
                                    return obj
                                  })
                                  .then(async obj => {
                                    setCoinsValue({ ...obj, coinsType: 'key' })
                                    try {
                                      await getApproveOfKey(mutate)
                                    } catch (e) {
                                      console.log('getApproveOfKey:', e)
                                    }
                                    // mutate()
                                  })
                                Modal.destroyAll()
                              }}
                            >
                              {keyPrice} Key
                            </Button>
                            <Button
                              danger
                              shape="round"
                              block
                              size="large"
                              onClick={() => {
                                Promise.resolve()
                                  .then(() => {
                                    const obj = {
                                      ...coinsValueObj,
                                      coinsType: 'matic'
                                    }
                                    setCoinsValue(obj)
                                    return obj
                                  })
                                  .then(obj => {
                                    setCoinsValue({
                                      ...obj,
                                      coinsType: 'matic'
                                    })
                                    mutate()
                                  })
                                Modal.destroyAll()
                              }}
                            >
                              {maticPrice} Matic
                            </Button>
                          </ChooseCoinsBtn>
                        ),
                        icon: null,
                        okButtonProps: {
                          danger: true,
                          shape: 'round',
                          hidden: true
                        },
                        closable: true
                      })
                    } else {
                      messageMention({
                        content: t('register.notOpen'),
                        type: 'error'
                      })
                    }
                  }}
                >
                  {t('register.buttons.request')}
                </SnsButton>
              ) : (
                <SnsButton
                  data-testid="request-register-button"
                  type="disabled"
                >
                  {t('register.buttons.suspend')}
                </SnsButton>
              )
            ) : readOnly ? (
              <Tooltip
                text="<p>You are not connected to a web3 browser. Please connect to a web3 browser and try again</p>"
                position="top"
                border={true}
                offset={{ left: -30, top: 10 }}
              >
                {({ showTooltip, hideTooltip }) => {
                  return (
                    <SnsButton
                      data-testid="request-register-button"
                      type="disabled"
                      onMouseOver={() => {
                        showTooltip()
                      }}
                      onMouseLeave={() => {
                        hideTooltip()
                      }}
                    >
                      {t('register.buttons.request')}
                    </SnsButton>
                  )
                }}
              </Tooltip>
            ) : (
              <SnsButton data-testid="request-register-button" type="disabled">
                {t('register.buttons.request')}
              </SnsButton>
            )
          }
        </Mutation>
      )
    case 'COMMIT_SENT': // get sns instance object
      return <PendingTx txHash={txHash} />
    case 'COMMIT_CONFIRMED':
      return (
        <SnsButton data-testid="disabled-register-button" type="disabled">
          {t('register.buttons.register')}
        </SnsButton>
      )
    case 'AWAITING_REGISTER':
      return (
        <Mutation
          mutation={REGISTER}
          variables={{ label, duration, secret }}
          onCompleted={data => {
            const txHash = Object.values(data)[0]
            setTxHash(txHash)
            incrementStep()
          }}
        >
          {mutate => (
            <>
              {hasSufficientBalance ? (
                <>
                  <Prompt>
                    <OrangeExclamation />
                    {t('register.buttons.warning')}
                  </Prompt>
                  <SnsButton data-testid="register-button" onClick={mutate}>
                    {t('register.buttons.register')}
                  </SnsButton>
                </>
              ) : (
                <>
                  <Prompt>
                    <OrangeExclamation />
                    {t('register.buttons.insufficient')}
                  </Prompt>
                  <SnsButton data-testid="register-button" type="disabled">
                    {t('register.buttons.register')}
                  </SnsButton>
                </>
              )}
            </>
          )}
        </Mutation>
      )
    case 'REVEAL_SENT':
      return (
        <PendingTx
          txHash={txHash}
          onConfirmed={async () => {
            5
            if (ethUsdPrice) {
              // this is not set on local test env
              trackReferral({
                transactionId: txHash,
                labels: [label],
                type: 'register', // renew/register
                price: new EthVal(`${price._hex}`)
                  .toEth()
                  .mul(ethUsdPrice)
                  .toFixed(2), // in wei, // in wei
                years,
                premium
              })
            }
            incrementStep()
          }}
        />
      )
    default:
      return (
        <>
          <AddToCalendar
            css={css`
              margin-right: 20px;
            `}
            name={`${label}.key`}
            startDatetime={moment()
              .utc()
              .local()
              .add(duration, 'seconds')
              .subtract(30, 'days')}
          />
          <LeftLink
            onClick={async () => {
              await Promise.all([refetch(), refetchIsMigrated()])
              history.push(`/name/${label}.key`)
            }}
            data-testid="manage-name-button"
          >
            {t('register.buttons.manage')}
          </LeftLink>
          <SnsButton
            onClick={async () => {
              await Promise.all([refetchIsMigrated()])
              history.push(`/address/${account}`)
              window.location.reload()
            }}
          >
            <Pencil />
            {t('register.buttons.setreverserecord')}
          </SnsButton>
        </>
      )
  }
}

const CTA = ({
  step,
  incrementStep,
  secret,
  duration,
  label,
  hasSufficientBalance,
  setTimerRunning,
  setCommitmentTimerRunning,
  commitmentTimerRunning,
  setBlockCreatedAt,
  isAboveMinDuration,
  refetch,
  refetchIsMigrated,
  readOnly,
  price,
  years,
  premium,
  ethUsdPrice,
  isSuspendRegister
}) => {
  const { t } = useTranslation()
  const history = useHistory()
  const account = useAccount()
  const [txHash, setTxHash] = useState(undefined)
  const [coinsValueObj, setCoinsValue] = useState({
    label,
    ownerAddress: account,
    coinsType: ''
  })
  const coinsValueRef = React.useRef()

  useEffect(() => {
    return () => {
      if (step === 'REVEAL_CONFIRMED') {
        refetch()
      }
    }
  }, [step])

  return (
    <CTAContainer>
      {getCTA({
        step,
        incrementStep,
        secret,
        duration,
        label,
        hasSufficientBalance,
        txHash,
        setTxHash,
        coinsValueRef,
        coinsValueObj,
        setCoinsValue,
        setTimerRunning,
        setBlockCreatedAt,
        setCommitmentTimerRunning,
        commitmentTimerRunning,
        isAboveMinDuration,
        refetch,
        refetchIsMigrated,
        readOnly,
        price,
        years,
        premium,
        history,
        t,
        ethUsdPrice,
        account,
        isSuspendRegister
      })}
    </CTAContainer>
  )
}

export default CTA
