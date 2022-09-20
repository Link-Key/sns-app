import styled from '@emotion/styled/macro'
import { Steps } from 'antd'
import MainContainer from 'components/Basic/MainContainer'
import TopBar from 'components/Basic/TopBar'
import Copy from 'components/CopyToClipboard/CopyToClipboard'
import Button from 'components/Forms/Button'
import Pricer from 'components/SingleName/Pricer'

import { Title } from 'components/Typography/Basic'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

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
  /* button:{

  } */
`

const { Step } = Steps

const Activity = ({
  match: {
    params: { name: searchTerm }
  },
  location: { pathname }
}) => {
  const { t } = useTranslation()
  console.log('searchTerm:', searchTerm)
  console.log('pathname:', pathname)

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
        <Button>{t('register.buttons.request')}</Button>
      </ButtonWrapper>
    </MainContainer>
  )
}

export default memo(Activity)
