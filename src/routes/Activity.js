import styled from '@emotion/styled/macro'
import {
  Modal,
  Select,
  Space,
  Steps,
  Typography,
  Button as AntButton
} from 'antd'
import getSNS, { getSNSIERC20 } from 'apollo/mutations/sns'
import MainContainer from 'components/Basic/MainContainer'
import TopBar from 'components/Basic/TopBar'
import Copy from 'components/CopyToClipboard/CopyToClipboard'
import Button from 'components/Forms/Button'
import { useAccount } from 'components/QueryAccount'
import Pricer from 'components/SingleName/Pricer'
import { gql, useQuery } from '@apollo/client'
import { Title } from 'components/Typography/Basic'
import { useCallback } from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BNformatToWei,
  ethFormatToWei,
  hexToNumber,
  weiFormatToEth
} from 'utils/utils'
import { LoadingOutlined } from '@ant-design/icons'
import messageMention from 'utils/messageMention'
import { useHistory } from 'react-router'

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

const Activity = ({
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
  const [selectCoins, setSelectCoins] = useState(1)
  const [registerInfo, serRegisterInfo] = useState({
    keyPrice: 0,
    maticPrice: 0,
    keyAddress: '-'
  })
  const [snsInstance, setSNS] = useState({})
  const [IERC20Instance, setIERC20Instance] = useState({})
  const [stepCurrent, setCurrentStep] = useState(0)

  const history = useHistory()

  const handleCloseFn = useCallback(() => {
    setRegisterVisible(false)
    setSelectCoins(1)
  }, [])

  const queryAllowance = useCallback(async () => {
    try {
      const value = await IERC20Instance.allowance(
        account,
        snsInstance.registryAddress
      )
      return hexToNumber(value)
    } catch (error) {
      console.log('queryAllowanceErr:', error)
    }
  }, [account, IERC20Instance, snsInstance])

  const approveFn = useCallback(async () => {
    const value = await queryAllowance()
    console.log('queryAllowance:', value)
    try {
      if (value >= weiFormatToEth(registerInfo.keyPrice)) {
        console.log('approve')
        return 'approve'
      } else {
        const resp = await IERC20Instance.approve(
          snsInstance.registryAddress,
          registerInfo.keyPrice
        )
        console.log('approveResp:', resp)
        return 'unApprove'
      }
    } catch (error) {
      console.log('callApproveErr:', error)
      return false
    }
  }, [queryAllowance, registerInfo.keyPrice, snsInstance, IERC20Instance])

  const handleKeyRegisterFn = useCallback(async () => {
    clearInterval(window.shortNameKeyTimer)
    try {
      snsInstance
        .shortNameMint(searchTerm, 2, registerInfo.keyPrice)
        .then(() => {
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
        })
    } catch (error) {
      console.log('handleKeyRegisterFnErr:', error)
      messageMention({ type: 'error', content: 'mint error' })
      setCurrentStep(0)
    }
  }, [snsInstance, registerInfo.keyPrice])

  const keyRegisterFn = useCallback(async () => {
    const isApprove = await approveFn()
    if (isApprove === 'unApprove') {
      setCurrentStep(2)
      setTimeout(() => {
        window.shortNameKeyTimer = setInterval(async () => {
          const allowancePrice = await queryAllowance()
          console.log('allowancePrice:', allowancePrice)
          if (allowancePrice > 0) {
            await handleKeyRegisterFn()
          }
        }, 2000)
      }, 0)
    }

    if (isApprove === 'approve') {
      setCurrentStep(2)
      await handleKeyRegisterFn()
    }
  }, [approveFn, handleKeyRegisterFn, queryAllowance])

  const maticRegisterFn = useCallback(async () => {
    setCurrentStep(2)
    console.log('maticPrice:', registerInfo.maticPrice)
    try {
      snsInstance
        .shortNameMint(searchTerm, 1, registerInfo.maticPrice)
        .then(() => {
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
        })
    } catch (error) {
      console.log('maticRegisterFnErr:', error)
      messageMention({ type: 'error', content: 'mint error' })
      setCurrentStep(0)
    }
  }, [registerInfo.maticPrice, searchTerm, snsInstance])

  const handleRegisterFn = useCallback(async () => {
    console.log('selectCoins:', selectCoins)
    if (selectCoins === 1) {
      await maticRegisterFn()
    }
    if (selectCoins === 2) {
      console.log('key register')
      await keyRegisterFn()
    }
    handleCloseFn()
  }, [selectCoins, maticRegisterFn, keyRegisterFn, handleCloseFn])

  const getRegisterPrice = useCallback(async sns => {
    const coinPrice = await sns.getInfo(sns.registryAddress, '', 0)
    if (coinPrice && coinPrice.priceOfShort) {
      const maticAmount = BNformatToWei(coinPrice.priceOfShort.maticPrice)
      const keyAmount = BNformatToWei(coinPrice.priceOfShort.keyPrice)
      const info = {
        keyPrice: keyAmount,
        maticPrice: maticAmount,
        keyAddress: coinPrice.priceOfShort.keyAddress
      }
      serRegisterInfo({
        ...info
      })
      return info
    }
    return {}
  }, [])

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

  const getIERC20Instance = useCallback(async address => {
    try {
      const IERC20 = await getSNSIERC20(address)
      setIERC20Instance(IERC20)
    } catch (error) {
      console.log('getIERC20InstanceErr:', error)
    }
  }, [])

  useEffect(() => {
    if (isENSReady) {
      getSNSInstance().then(sns => {
        console.log('registryAddress:', sns.registryAddress)
        if (sns && sns.registryAddress) {
          getRegisterPrice(sns).then(info => {
            if (info && info.keyAddress) {
              getIERC20Instance(info.keyAddress)
            }
          })
        }
      })
    }
  }, [isENSReady, getSNSInstance, getRegisterPrice, getIERC20Instance])

  console.log('stepCurrent:', stepCurrent)
  console.log('stepCurrent bool:', stepCurrent === 0 || stepCurrent === 3)

  return (
    <MainContainer state="Open">
      <TopBar percentDone={100}>
        <NameWrapper>
          <Title>{searchTerm}</Title>
          <Copy value={searchTerm} />
        </NameWrapper>
      </TopBar>

      <RegisterContent>
        <Pricer />
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
          <Button
            onClick={() => {
              history.push(`/address/${account}`)
            }}
          >
            {t('register.buttons.setreverserecord')}
          </Button>
        ) : stepCurrent === 2 || stepCurrent === 1 ? (
          <Typography>{t('pendingTx.text')}</Typography>
        ) : (
          <Button
            onClick={() => {
              setRegisterVisible(true)
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
            onChange={value => {
              setSelectCoins(value)
            }}
          >
            <Option value={1}>
              {weiFormatToEth(registerInfo.maticPrice)} Matic
            </Option>
            <Option value={2}>
              {weiFormatToEth(registerInfo.keyPrice)} Key
            </Option>
          </SelectWrapper>

          <AntButton
            danger
            shape="round"
            block
            type="primary"
            onClick={async () => {
              await handleRegisterFn()
            }}
          >
            {t('c.register')}
          </AntButton>
        </ModalContent>
      </Modal>
    </MainContainer>
  )
}

export default memo(Activity)
