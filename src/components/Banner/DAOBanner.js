import styled from '@emotion/styled/macro'
import mq from 'mediaQuery'

import { motion } from 'framer-motion'
import ENSIcon from './images/logo_single_linkkey.svg'
import Arrow from './images/Arrow.svg'

const LogoSmall = styled(motion.img)`
  width: 60px;
  //padding: 10px;
  border-radius: 30%;
  margin: auto;
  display: block;
  //background: linear-gradient(
  //  330.4deg,
  //  #44bcf0 4.54%,
  //  #7298f8 59.2%,
  //  #a099ff 148.85%
  //
  //);
  background: #ea6060;
  box-shadow: 0px 4px 26px rgba(0, 0, 0, 0.06);
`

const Link = styled(`a`)`
  display: block;
`

const ArrowSmall = styled(motion.img)`
  height: 100%;
  margin: auto;
  display: block;
  width: 22px;
  color: #b3b3b3;
`

const BannerTitle = styled(`div`)`
  color: #0e0e0e;
  font-weight: bold;
`

const BannerContent = styled(`div`)`
  color: #787878;
  font-size: 18px;
  font-weight: 500;
  font-size: 15px;
`

export const MainPageBannerContainer = styled(`div`)`
  position: absolute;
  top: 135px;
  margin-left: auto;
  margin-right: auto;
  left: 0;
  right: 0;
  background: #ffffff;
  border-radius: 14px;
  max-width: 90%;
  padding: 15px 0px;
  a {
    display: grid;
    grid-template-columns: 73px 1fr 50px;
  }
  ${mq.medium`
    width: 700px;
    height: 78px;
  `}
`

export const MainPageMetaTimeBannerContainer = styled(`div`)`
  position: absolute;
  top: 15%;
  margin-left: auto;
  margin-right: auto;
  left: 0;
  right: 0;
  //background: #ffffff 0%;
  text-align: center;
  border-radius: 14px;
  max-width: 90%;
  padding: 15px 0px;
  font-size: 18px;
  color: #fff;
  a {
    display: grid;
    grid-template-columns: 73px 1fr 50px;
  }
  ${mq.medium`
    width: 700px;
    height: 78px;
  `}
`

export const NonMainPageBannerContainer = styled(`div`)`
  margin-left: auto;
  margin-right: auto;
  left: 0;
  right: 0;
  background: #ffffff;
  border-radius: 14px;
  display: grid;
  padding: 15px 0px;
  a {
    display: grid;
    grid-template-columns: 73px 1fr 50px;
  }
  ${mq.medium`
    height: 78px;
  `}
`

const BannerSwitch = false

export const NonMainPageBannerContainerWithMarginBottom = styled(
  NonMainPageBannerContainer
)`
  margin-bottom: 20px;
`

export function DAOBannerContent() {
  return (
    <Link target="_blank" rel="noreferrer" href="https://linkkey.io">
      <LogoSmall src={ENSIcon} />
      <div>
        <BannerTitle>Linkkey airdrop is coming.</BannerTitle>
        <BannerContent>To see your account for airdrops.</BannerContent>
      </div>
      <ArrowSmall src={Arrow} />
    </Link>
  )
}
