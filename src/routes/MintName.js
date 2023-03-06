import styled from '@emotion/styled/macro'
import {
  Modal,
  Select,
  Space,
  Steps,
  Typography,
  Button as AntButton,
  Input
} from 'antd'
import getSNS, { getSNSIERC20 } from 'apollo/mutations/sns'
import MainContainer from 'components/Basic/MainContainer'
import TopBar from 'components/Basic/TopBar'
import Copy from 'components/CopyToClipboard/CopyToClipboard'
import Button from 'components/Forms/Button'
import { useAccount } from 'components/QueryAccount'
import RegisterHint from 'components/SingleName/RegisterHint'
import { gql, useQuery } from '@apollo/client'
import { Title } from 'components/Typography/Basic'
import { useCallback } from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BNformatToWei,
  emptyAddress,
  ethFormatToWei,
  handleContractError,
  hexToNumber,
  removeSuffixOfKey,
  weiFormatToEth
} from 'utils/utils'
import { LoadingOutlined } from '@ant-design/icons'
import messageMention from 'utils/messageMention'
import { useHistory } from 'react-router'
import EthVal from 'ethval'

const NameWrapper = styled('div')`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
`

const RegisterContent = styled('div')`
  padding: 20px 40px;
`

const StepsWrapper = styled(Steps)`
  width: 100%;

  padding: 20px 40px;
  margin: 0 auto;
`

const ButtonWrapper = styled('div')`
  padding: 20px 40px;
  text-align: right;
`

const ModalTitle = styled(Typography.Title)`
  font-weight: 700;
  text-align: center;
`

const SelectWrapper = styled(Select)`
  width: 100%;
  margin: 0 auto;
`

const ModalContent = styled('div')`
  display: flex;
  flex-direction: column;
  justify-content: center;

  width: 80%;
  margin: 0 auto;
  gap: 20px;
  margin-top: 20px;
  button: {
    width: 100px !important;
  }
`

const SEARCH_QUERY = gql`
  query searchQuery {
    isENSReady @client
  }
`

const { Step } = Steps
const { Option } = Select

const exceedValue = 115792089237316195423570985008687907853269984665640564039457584007913129639935

const MintName = ({
  match: {
    params: { name: searchTerm }
  },
  location: { pathname }
}) => {
  const {
    data: { isENSReady }
  } = useQuery(SEARCH_QUERY)

  const { t } = useTranslation()
  const account = useAccount()
  const [registerVisible, setRegisterVisible] = useState(false)
  const [selectCoins, setSelectCoins] = useState(0)
  const [registerInfo, serRegisterInfo] = useState({
    keyPrice: 0,
    maticPrice: 0,
    usdcPrice: 0,
    keyAddress: '-'
  })
  const [snsInstance, setSNS] = useState({})
  const [stepCurrent, setCurrentStep] = useState(0)
  const [inviteValue, setInviteValue] = useState(
    localStorage.getItem('sns_invite')
  )

  const history = useHistory()

  const handleInviteInpChange = e => {
    setInviteValue(e.target.value)
  }

  const handleCloseFn = useCallback(() => {
    setRegisterVisible(false)
    setSelectCoins(0)
    setInviteValue(localStorage.getItem('sns_invite'))
  }, [])

  const handleRegisterFn = useCallback(
    async inviteName => {
      setCurrentStep(2)
      let inviteAdd = emptyAddress
      if (inviteName) {
        try {
          inviteAdd = await snsInstance.getResolverOwner(inviteName)
        } catch (error) {
          throw error
        }
      }
      snsInstance
        .mint(removeSuffixOfKey(searchTerm), selectCoins, inviteAdd)
        .then(
          () => {
            window.registerComTimer = setTimeout(() => {
              setInterval(async () => {
                const isSuccessRegister = await snsInstance.recordExists(
                  searchTerm
                )
                console.log('isSuccessRegister:', isSuccessRegister)
                if (isSuccessRegister) {
                  clearInterval(window.registerComTimer)
                  setCurrentStep(3)
                }
              }, 2000)
            }, 0)
          },
          error => {
            console.log('handleRegisterFnErr:', error)
            if (error && error.data && error.data.message) {
              messageMention({
                type: 'error',
                content: handleContractError(error.data.message)
              })
            } else if (error && error.message) {
              messageMention({
                type: 'error',
                content: handleContractError(error.message)
              })
            } else {
              messageMention({ type: 'error', content: 'mint error' })
            }
            setCurrentStep(0)
          }
        )
      handleCloseFn()
    },
    [emptyAddress, snsInstance, handleCloseFn, removeSuffixOfKey, selectCoins]
  )

  const getRegisterPrice = useCallback(
    async sns => {
      try {
        const coinPrice = await sns.getPriceInfo(
          account,
          removeSuffixOfKey(searchTerm),
          emptyAddress
        )
        if (coinPrice) {
          const maticAmount = BNformatToWei(coinPrice.maticPrice)
          const keyAmount = BNformatToWei(coinPrice.keyPrice)
          const usdcWeiValue = BNformatToWei(coinPrice.usdcPrice)
          const usdcAmount =
            usdcWeiValue >= exceedValue
              ? usdcWeiValue
              : new EthVal(`${coinPrice.usdcPrice || 0}`).scaleUp(6).toNumber()
          const info = {
            maticPrice: maticAmount,
            keyPrice: keyAmount,
            usdcPrice: usdcAmount
          }
          console.log('info:', info)
          console.log('coinPrice:', coinPrice)
          serRegisterInfo({
            ...info
          })
          return info
        }
      } catch (error) {
        console.log('getRegisterPriceErr:', error)
        return {}
      }
    },
    [account, emptyAddress, removeSuffixOfKey]
  )

  const getSNSInstance = useCallback(async () => {
    try {
      const sns = await getSNS()
      setSNS(sns)
      return sns
    } catch (error) {
      console.log('getSNSInstanceErr:', error)
      return {}
    }
  }, [])

  useEffect(() => {
    if (isENSReady) {
      getSNSInstance()
        .then(sns => {
          if (sns && sns.registryAddress && account !== emptyAddress) {
            getRegisterPrice(sns)
          }
        })
        .catch(e => {
          console.log('getSNSInstanceError:', e)
        })
    }
  }, [isENSReady, getSNSInstance, getRegisterPrice, account, searchTerm])

  return (
    <MainContainer state="Open">
      <TopBar percentDone={100}>
        <NameWrapper>
          <Title>{searchTerm}</Title>
          <Copy value={searchTerm} />
        </NameWrapper>
      </TopBar>

      <RegisterContent>
        <RegisterHint />
      </RegisterContent>

      <StepsWrapper current={stepCurrent}>
        <Step
          title={t('register.buttons.request')}
          description={
            t('register.step1.text') + ' ' + t('register.step1.text2')
          }
        />
        <Step
          title={t('register.step2.title')}
          icon={stepCurrent === 2 ? <LoadingOutlined /> : ''}
          description={t('register.step2.text')}
        />
        <Step
          title={t('register.step3.title')}
          description={t('register.step3.text')}
        />
      </StepsWrapper>

      <ButtonWrapper>
        {stepCurrent === 3 ? (
          <Space>
            <Button
              type="hollow-primary"
              onClick={() => {
                window.open('https://app.linkkey.io/')
              }}
            >
              Launch APP
            </Button>
            <Button
              onClick={() => {
                history.push(`/address/${account}`)
              }}
            >
              {t('register.buttons.setreverserecord')}
            </Button>
          </Space>
        ) : stepCurrent === 2 || stepCurrent === 1 ? (
          <Typography>{t('pendingTx.text')}</Typography>
        ) : (
          <Button
            onClick={() => {
              if (removeSuffixOfKey(searchTerm).length >= 8) {
                handleRegisterFn(inviteValue)
              } else if (removeSuffixOfKey(searchTerm).length < 3) {
                messageMention({
                  type: 'warn',
                  content: t('searchErrors.tooShort.short2')
                })
              } else {
                setRegisterVisible(true)
              }
            }}
          >
            {t('register.buttons.request')}
          </Button>
        )}
      </ButtonWrapper>

      <Modal
        visible={registerVisible}
        onCancel={() => {
          handleCloseFn()
        }}
        maskClosable={false}
        footer={null}
        style={{
          top: '20vh'
        }}
      >
        <ModalTitle level={5}>{t('c.selectCoins')}</ModalTitle>

        <ModalContent>
          <SelectWrapper
            status="error"
            value={selectCoins}
            size="middle"
            width="100%"
            placeholder={t('c.selectCoins')}
            onChange={value => {
              setSelectCoins(value)
            }}
          >
            <Option value={0} disabled={registerInfo.maticPrice >= exceedValue}>
              {weiFormatToEth(registerInfo.maticPrice)} Matic
            </Option>
            {registerInfo.usdcPrice >= exceedValue ? (
              ''
            ) : (
              <Option
                value={3}
                // disabled={registerInfo.usdcPrice >= exceedValue}
              >
                {registerInfo.usdcPrice} USDC
              </Option>
            )}
          </SelectWrapper>
          <Input
            value={inviteValue}
            size="middle"
            status="error"
            placeholder={t('invite.inp')}
            onChange={handleInviteInpChange}
          />

          <AntButton
            danger
            shape="round"
            block
            type="primary"
            disabled={
              registerInfo.usdcPrice >= exceedValue &&
              registerInfo.maticPrice >= exceedValue
            }
            onClick={() => {
              handleRegisterFn(inviteValue)
            }}
          >
            {t('c.register')}
          </AntButton>
        </ModalContent>
      </Modal>
    </MainContainer>
  )
}

export default memo(MintName)
