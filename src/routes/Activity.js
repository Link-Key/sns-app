import styled from '@emotion/styled/macro'
import {
  Modal,
  Select,
  Space,
  Steps,
  Typography,
  Button as AntButton
} from 'antd'
import getSNS from 'apollo/mutations/sns'
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

  const keyRegisterFn = useCallback(async () => {}, [])
  const maticRegisterFn = useCallback(async () => {
    const sns = await getSNS()
    console.log('searchTerm:', searchTerm)
    console.log('maticPrice:', registerInfo.maticPrice)

    const mintShort = await sns.shortNameMint(
      searchTerm,
      1,
      registerInfo.maticPrice
    )
    console.log('mintShort:', mintShort)
  }, [])

  const handleRegisterFn = useCallback(async () => {
    console.log('selectCoins:', selectCoins)
    if (selectCoins === 1) {
      await maticRegisterFn()
    }
  }, [selectCoins])

  const getRegisterPrice = useCallback(async () => {
    const sns = await getSNS()
    const coinPrice = await sns.getInfo(account, '', 0)
    if (coinPrice && coinPrice.priceOfShort) {
      const maticAmount = BNformatToWei(coinPrice.priceOfShort.maticPrice)
      const keyAmount = BNformatToWei(coinPrice.priceOfShort.keyPrice)
      serRegisterInfo({
        keyPrice: keyAmount,
        maticPrice: maticAmount,
        keyAddress: coinPrice.priceOfShort.keyAddress
      })
    }
  }, [])

  useEffect(() => {
    if (isENSReady) {
      getRegisterPrice()
    }
  }, [isENSReady])

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

      <StepsWrapper>
        <Step
          title={t('register.buttons.request')}
          description={
            t('register.step1.text') + ' ' + t('register.step1.text2')
          }
        />
        <Step
          title={t('register.step2.title')}
          description={t('register.step2.text')}
        />
        <Step
          title={t('register.step3.title')}
          description={t('register.step3.text')}
        />
      </StepsWrapper>

      <ButtonWrapper>
        <Button
          onClick={() => {
            setRegisterVisible(true)
          }}
        >
          {t('register.buttons.request')}
        </Button>
      </ButtonWrapper>

      <Modal
        visible={registerVisible}
        onCancel={() => {
          setRegisterVisible(false)
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
            defaultValue={selectCoins}
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
