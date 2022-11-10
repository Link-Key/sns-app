import React, { useState, useEffect, useCallback } from 'react'
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
import { Modal, Button, Select, message, Radio, Input, Form } from 'antd'
import getSNS, { getSNSAddress, getSNSIERC20 } from 'apollo/mutations/sns'
import { UnknowErrMsgComponent } from 'components/UnknowErrMsg'
import messageMention from 'utils/messageMention'
import { emptyAddress } from 'sns-app-contract-api'
import { handleQueryAllowance } from 'utils/utils'
import mq from 'mediaQuery'

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

const SelectRegisterForm = styled(Form)`
  .ant-input {
    border-radius: 50px !important;
  }

  .ant-select-selector {
    border-radius: 50px !important;
  }
`

const CompleteBtnWrapper = styled('div')`
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
  ${mq.large`
    display: flex;
    flex-direction: row;
    align-items: center;
  `}
`

const { Option } = Select

function getCTA({
  step,
  incrementStep,
  secret,
  duration,
  label,
  hasSufficientBalance,
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
  const [coinForm] = Form.useForm()

  const [keyPrice, setKeyPrice] = useState(async () => {
    const sns = getSNS()
    sns.getKeyCoinsPrice(emptyAddress).then(price => {
      setKeyPrice(new EthVal(`${price || 0}`).toEth().toFixed(3))
    })
  })

  const [lowbPrice, setLowbPrice] = useState(async () => {
    const sns = getSNS()
    sns.getLowbCoinsPrice(emptyAddress).then(price => {
      setLowbPrice(new EthVal(`${price || 0}`).toEth().toFixed(3))
    })
  })

  const [usdcPrice, setUsdcPrice] = useState(async () => {
    const sns = getSNS()
    sns.getUsdcCoinsPrice(emptyAddress).then(price => {
      let newprice = new EthVal(`${price || 0}`).scaleUp(6).toNumber()
      setUsdcPrice(newprice)
    })
  })

  const maticPrice = new EthVal(`${price || 0}`).toEth().toFixed(3)

  // use key coins register operation
  const getApproveOfKey = async (mutate, inviteName) => {
    const sns = getSNS()
    const keyAddress = await sns.getKeyCoinsAddress()
    let inviteAdd = emptyAddress
    if (inviteName) {
      inviteAdd = await sns.getResolverOwner(inviteName)
    }
    setCoinsValue({ ...coinsValueObj, invite: inviteAdd })
    const keyPrice = await sns.getKeyCoinsPrice(inviteAdd)
    // get IERC20 contract instance object
    const IERC20 = await getSNSIERC20(keyAddress)

    // get sns address
    const snsAddress = await getSNSAddress()

    // Authorization to SNS
    await IERC20.approve(snsAddress, keyPrice)

    message.loading({
      key: 1,
      content: t('z.transferSending'),
      duration: 0,
      style: { marginTop: '20vh' }
    })

    // Query if the authorization is successful
    // Query every three seconds, query ten times
    // handleQueryAllowance(IERC20, account, snsAddress, mutate)
    setTimeout(async () => {
      let timer,
        count = 0,
        allowancePrice
      timer = setInterval(async () => {
        try {
          count += 1
          // query authorization sns key price
          allowancePrice = await IERC20.allowance(account, snsAddress)
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

  // use lowb coins register operation
  const getApproveOfLowb = async mutate => {
    const sns = getSNS()
    const lowbAddress = await sns.getLowbCoinsAddress()
    const lowbPrice = await sns.getLowbCoinsPrice()

    // get IERC20 contract instance object
    const IERC20 = await getSNSIERC20(lowbAddress)

    // get sns address
    const snsAddress = await getSNSAddress()

    // Authorization to SNS
    await IERC20.approve(snsAddress, lowbPrice)

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
          allowancePrice = await IERC20.allowance(account, snsAddress)
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

  // use usdc coins register operation
  const getApproveOfUsdc = async mutate => {
    const sns = getSNS()
    const usdcAddress = await sns.getUsdcCoinsAddress()
    const usdcPrice = await sns.getUsdcCoinsPrice()

    // get IERC20 contract instance object
    const IERC20 = await getSNSIERC20(usdcAddress)

    // get sns address
    const snsAddress = await getSNSAddress()

    // Authorization to SNS
    await IERC20.approve(snsAddress, usdcPrice)

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
          allowancePrice = await IERC20.allowance(account, snsAddress)
          const price = new EthVal(`${allowancePrice || 0}`).toNumber()
          console.log('allowancePrice', price)
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

  const handleSelectCoinsRegister = async mutate => {
    switch (coinForm.getFieldsValue().coins) {
      case 'key':
        try {
          await getApproveOfKey(mutate, coinForm.getFieldsValue().inviteName)
        } catch (error) {
          console.log('getApproveOfKeyError:', error)
        }
        break
      case 'matic':
        mutate()
        break
      case 'usdc':
        try {
          await getApproveOfUsdc(mutate)
        } catch (error) {
          console.log('getApproveOfUsdcError:', error)
        }
        break
      case 'lowb':
        try {
          await getApproveOfLowb(mutate)
        } catch (error) {
          console.log('getApproveOfLowbError:', error)
        }
        break
      default:
        try {
          await getApproveOfKey(mutate, coinForm.getFieldsValue().inviteName)
        } catch (error) {
          console.log('getApproveOfKeyError:', error)
        }
    }
    coinForm.resetFields()
    Modal.destroyAll()
  }

  const changeCoins = value => {
    coinForm.setFieldsValue({ coinsType: value })
    setCoinsValue({ ...coinsValueObj, coinsType: value })
  }

  useEffect(() => {
    console.log('coin:', coinsValueObj)
  }, [coinsValueObj])

  switch (step) {
    case 'PRICE_DECISION':
      return (
        <Mutation
          mutation={COMMIT}
          variables={{
            ownerAddress: account,
            label,
            coinsType: coinsValueObj.coinsType,
            invite: coinsValueObj.invite
          }}
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
                            style={{
                              textAlign: 'center',
                              fontWeight: '700',
                              marginBottom: '10px'
                            }}
                          >
                            {t('c.selectCoins')}
                          </div>
                        ),
                        content: (
                          <SelectRegisterForm
                            initialValues={{ coins: 'matic', inviteName: '' }}
                            form={coinForm}
                          >
                            <Form.Item name="coins">
                              <Select
                                status="error"
                                defaultValue="key"
                                size="middle"
                                onChange={changeCoins}
                              >
                                {/* <Option value="key">{keyPrice} Key</Option> */}
                                <Option value="matic">
                                  {maticPrice} Matic
                                </Option>
                                <Option value="usdc">{usdcPrice} USDC</Option>
                                {/* <Option value="lowb">{lowbPrice} Lowb</Option> */}
                              </Select>
                            </Form.Item>
                            <Form.Item
                              noStyle
                              shouldUpdate={(prevValues, currentValues) =>
                                prevValues.coins !== currentValues.coins
                              }
                            >
                              {({ getFieldValue }) =>
                                getFieldValue('coins') !== 'key' ? null : (
                                  <Form.Item name="inviteName">
                                    <Input
                                      size="middle"
                                      status="error"
                                      placeholder={t('invite.inp')}
                                    />
                                  </Form.Item>
                                )
                              }
                            </Form.Item>
                            <p>{t('invite.note')}</p>
                            <Form.Item>
                              <Button
                                danger
                                shape="round"
                                block
                                type="primary"
                                onClick={() =>
                                  handleSelectCoinsRegister(mutate)
                                }
                              >
                                {t('c.register')}
                              </Button>
                            </Form.Item>
                          </SelectRegisterForm>
                        ),
                        icon: null,
                        okButtonProps: {
                          hidden: true
                        },
                        closable: true,
                        onCancel: () => {
                          coinForm.resetFields()
                        }
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
        <CompleteBtnWrapper>
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
            }}
          >
            <Pencil />
            {t('register.buttons.setreverserecord')}
          </SnsButton>
        </CompleteBtnWrapper>
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
    coinsType: 'key'
  })

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
