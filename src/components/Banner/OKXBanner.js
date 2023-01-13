import styled from '@emotion/styled/macro'
import { memo } from 'react'
import { motion } from 'framer-motion'
import mq from 'mediaQuery'
import OKXIcon from './images/okx.png'
import Arrow from './images/Arrow.svg'
import { useTranslation } from 'react-i18next'

const OKXBannerWrapper = styled('div')`
  position: absolute;
  width: 90%;
  top: 70px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3px 15px;
  background: white;
  border-radius: 14px;
  z-index: 999;
  cursor: pointer;
  ${mq.small`
    width:500px;
    padding:8px 20px;
  `}
`

const LogoWrapper = styled('div')`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2px;
`

const LogoText = styled('span')`
  position: relative;
  top: 1px;
  font-size: 12px;
  font-weight: bold;
  ${mq.small`
    top:3px;
    font-size: 15px;
  `}
`

const ArrowSmall = styled(motion.img)`
  width: 22px;
  color: #b3b3b3;
`

const LogoSmall = styled(motion.img)`
  width: 30px;
`

const OKXBanner = () => {
  const { t } = useTranslation()
  return (
    <OKXBannerWrapper
      onClick={() => {
        window.open('https://www.okx.com/download')
      }}
    >
      <LogoWrapper>
        <LogoSmall src={OKXIcon} />
        <LogoText>{t('home.announcements.text')}</LogoText>
      </LogoWrapper>
      <ArrowSmall src={Arrow} />
    </OKXBannerWrapper>
  )
}

export default memo(OKXBanner)
