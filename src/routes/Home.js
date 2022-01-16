import React, { useState } from 'react'
import { useQuery } from '@apollo/client'
import { Link } from 'react-router-dom'
import styled from '@emotion/styled/macro'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import mq, { useMediaMin } from 'mediaQuery'

import SearchDefault from '../components/SearchName/Search'
import NoAccountsDefault from '../components/NoAccounts/NoAccountsModal'
import bg from '../assets/homeBg.png'
import TextBubbleDefault from '../components/Icons/TextBubble'
import QuestionMarkDefault from '../components/Icons/QuestionMark'
import HowToUseDefault from '../components/HowToUse/HowToUse'
// import ENSLogo from '../components/HomePage/images/ENSLogo.svg'
import ENSLogo from '../components/HomePage/images/logo.svg'
import DiscordIcon from '../assets/D.png'
import TelegramIcon from '../assets/tg.png'
import TwitterIcon from '../assets/t.png'
import GithubIcon from '../assets/github.png'
import { aboutPageURL } from '../utils/utils'
import { connectProvider, disconnectProvider } from '../utils/providerUtils'
import { gql } from '@apollo/client'
import {
  MainPageBannerContainer,
  DAOBannerContent,
  MainPageMetaTimeBannerContainer
} from '../components/Banner/DAOBanner'
import LanguageSwitcher from '../components/LanguageSwitcher'
import MetaTime from '../components/HomePage/MetaTime'
import Hamburger from 'components/Header/Hamburger'
import SideNav from 'components/SideNav/SideNav'

const HeroTop = styled('div')`
  display: flex;
  padding: 20px;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  justify-content: space-around;
  flex-wrap: wrap;
  font-size: 16px;
  flex-direction: row-reverse;
  ${mq.small`
    flex-wrap: nowrap;
    flex-direction: row-reverse;
    justify-content: space-between;
    font-size: 14px;
  `}
  ${mq.medium`
    flex-wrap: nowrap;
    flex-direction: row-reverse;
    justify-content: space-between;
    font-size: 16px;
  `}
  z-index:100;
`

const NoAccounts = styled(NoAccountsDefault)`
  div {
    margin: 0 auto;
  }
`

const Network = styled('div')`
  margin-bottom: 5px;
`
const Name = styled('span')`
  margin-left: 5px;
  text-transform: none;
  display: inline-block;
  width: 100px;
`

const NetworkStatus = styled('div')`
  color: white;
  font-weight: 200;
  text-transform: capitalize;
  ${mq.small`
    display: block;
  `}
  ${mq.medium`
    left: 40px;
  `}

  &:before {
    position: absolute;
    right: 100%;
    top: 50%;
    transform: translate(-5px, -50%);
    content: '';
    display: block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #fff;
  }
`

const Nav = styled('div')`
  display: flex;
  justify-content: center;
  align-self: center;

  ${mq.small`
    justify-content: flex-end;
  `}
  a {
    font-weight: 300;
    color: white;
  }
`

const NavLink = styled(Link)`
  margin-left: 20px;
  &:first-child {
    margin-left: 0;
  }
`

const ExternalLink = styled('a')`
  margin-left: 20px;
  &:first-child {
    margin-left: 0;
  }
`

const Announcement = styled('div')`
  display: flex;
  justify-content: center;
  flex-direction: column;
  background: #ea6060;
  padding: 0 10px;
  border-bottom: #ea6060 solid 3px;
  h3 {
    color: white;
    font-weight: 400;
    text-align: center;
    padding: 0 20px;
    margin-bottom: 10px;
  }
  p {
    text-align: center;
    color: white;
  }
  a {
    color: white;
    text-decoration: none;
  }
`

const HowToUse = styled(HowToUseDefault)`
  padding: 70px;
`

export const Hero = styled('section')`
  background: url(${bg}) center center no-repeat;
  background-size: cover;
  padding: 60px 20px 20px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  ${mq.medium`
    padding: 0 20px 0;
  `}
`

const SearchContainer = styled('div')`
  margin: 20px auto 0;
  display: flex;
  flex-direction: column;
  min-width: 100%;
  ${mq.medium`
    min-width: 60%;
  `}
  > h2 {
    color: white;
    font-size: 38px;
    font-weight: 100;
    margin-bottom: 10px;
  }

  > h3 {
    color: white;
    font-weight: 100;
    font-size: 24px;
    margin-top: 0;
  }
`

const Search = styled(SearchDefault)`
  min-width: 90%;
  ${mq.medium`
    min-width: 780px;
  `}

  input {
    width: 100%;
    border-radius: 7px 0 0 7px;
    ${mq.medium`
      font-size: 28px;
      border-radius: 16px 0 0 16px;
    `}
  }

  button {
    border-radius: 0 7px 7px 0;
    ${mq.medium`
    border-radius: 0 16px 16px 0;
    `}
  }
`

const Explanation = styled('div')`
  display: grid;
  width: 100%;

  grid-template-columns: 1fr;
  grid-template-rows: auto;
  ${mq.medium`
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto;
  `}
  grid-gap: 0;
`

const H2 = styled('h2')`
  font-size: 30px;
  font-weight: 500;
`

const Section = styled('section')`
  display: flex;
  justify-content: center;
  align-items: center;
`

const WhatItIs = styled(Section)`
  padding: 40px 20px 80px;
  p {
    font-size: 18px;
  }
`

const HowItWorks = styled(Section)`
  background: #f0f6fa;
  padding: 40px 20px 80px;
`

const Inner = styled('div')`
  flex-direction: column;
  justify-content: center;
  align-items: center;
  max-width: 350px;

  > p {
    font-weight: 300;
    font-size: 20px;
    margin-bottom: 1.5em;
  }
`
const NameAnimation = styled(Section)`
  display: block;
  height: 100%;
`

const TextBubble = styled(TextBubbleDefault)`
  margin-right: 10px;
`

const QuestionMark = styled(QuestionMarkDefault)`
  transform: scale(1.18);
  margin-right: 10px;
`

const LogoLarge = styled(motion.img)`
  width: 50%;
  margin: 0 auto 0;
  ${mq.medium`
    width: 223px;
  `}
`

const SocialIconLarge = styled(motion.div)`
  bottom: 50px;
  display: flow;
  margin: 50px auto 20px;
  text-align: center;
  > a {
    img {
      width: 25px;
      margin: 0 15px;
    }
  }
  ${mq.small`
    > a{img{
      width: 30px;
      margin: 0 20px;
    }}
  `}
`
const LinkkeyCopyRight = styled(motion.div)`
  display: block;
  width: 100%;
  margin: 0 auto 0;
  > a {
    color: #fff;
  }
  font-size: 14px;
  text-align: center;
  ${mq.small`
    font-size: 16px;
  `}
`

const PermanentRegistrarLogo = styled(motion.h1)`
  font-family: Overpass;
  font-weight: 800;
  font-size: 18px;
  text-transform: uppercase;
  color: #fff;
  letter-spacing: 1.8px;
  text-align: right;
  line-height: 24px;
  margin-top: 10px;
  margin-bottom: 50px;
  text-align: center;
`

const ReadOnly = styled('span')`
  margin-left: 1em;
`

const MobileHeaderContainer = styled(`div`)`
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  grid-gap: 35px;
`

const SideNavDropDownContainer = styled(`div`)`
  position: absolute;
  top: 90px;
  width: 100%;
`

const HamburgerContainer = styled(`div`)`
  padding: 0 13px;
`

export const HOME_DATA = gql`
  query getHomeData($address: string) @client {
    network
    displayName(address: $address)
    isReadOnly
    isSafeApp
  }
`

export const GET_ACCOUNT = gql`
  query getAccounts @client {
    accounts
  }
`

const animation = {
  initial: {
    scale: 0,
    opacity: 0
  },
  animate: {
    opacity: 1,
    scale: 1
  }
}

export default ({ match }) => {
  const mediumBP = useMediaMin('medium')
  const [isMenuOpen, setMenuOpen] = useState(false)
  const toggleMenu = () => setMenuOpen(!isMenuOpen)
  const { url } = match
  const { t } = useTranslation()

  const TwitterUrl = 'https://twitter.com/LinkkeyOfficial'
  const TelegramUrl = 'https://t.me/linkkeydao'
  const DiscordUrl = 'https://discord.com/invite/UMNRQryyts'
  const GithubUrl = 'https://github.com/Link-Key'
  const LinkkeyUrl = 'https://linkkey.io'

  const {
    data: { accounts }
  } = useQuery(GET_ACCOUNT)

  const {
    data: { network, displayName, isReadOnly, isSafeApp }
  } = useQuery(HOME_DATA, {
    variables: { address: accounts?.[0] }
  })

  return (
    <Hero>
      <HeroTop>
        {mediumBP ? (
          <>
            <Nav>
              {accounts?.length > 0 && !isReadOnly && (
                <NavLink
                  active={url === '/address/' + accounts[0]}
                  to={'/address/' + accounts[0]}
                >
                  {t('c.mynames')}
                </NavLink>
              )}
              <NavLink to="/regisertProcess">{t('c.registProcess')}</NavLink>
              <NavLink to="/faq">{t('c.faq')}</NavLink>
              <ExternalLink href={aboutPageURL()}>
                {t('c.linkkey')}
              </ExternalLink>
              <LanguageSwitcher />
            </Nav>
            <NetworkStatus>
              <Network>
                {`${network} ${t('c.network')}`}
                {isReadOnly && <ReadOnly>({t('c.readonly')})</ReadOnly>}
                {!isReadOnly && displayName && (
                  <Name data-testid="display-name">({displayName})</Name>
                )}
              </Network>
              <NoAccounts
                onClick={isReadOnly ? connectProvider : disconnectProvider}
                buttonText={isReadOnly ? t('c.connect') : t('c.disconnect')}
              />
              {/* {!isSafeApp && (
              <NoAccounts
                onClick={isReadOnly ? connectProvider : disconnectProvider}
                buttonText={isReadOnly ? t('c.connect') : t('c.disconnect')}
              />
            )} */}
            </NetworkStatus>
          </>
        ) : (
          <MobileHeaderContainer>
            <HamburgerContainer>
              <Hamburger isMenuOpen={isMenuOpen} openMenu={toggleMenu} />
            </HamburgerContainer>
            <NoAccounts
              onClick={isReadOnly ? connectProvider : disconnectProvider}
              buttonText={isReadOnly ? t('c.connect') : t('c.disconnect')}
            />
            <LanguageSwitcher />
          </MobileHeaderContainer>
        )}
      </HeroTop>
      {/* <MainPageBannerContainer>
       <DAOBannerContent />
      </MainPageBannerContainer> */}

      <MainPageMetaTimeBannerContainer>
        <MetaTime />
      </MainPageMetaTimeBannerContainer>

      <SearchContainer>
        <>
          <LogoLarge
            initial={animation.initial}
            animate={animation.animate}
            src={ENSLogo}
          />
          <PermanentRegistrarLogo
            initial={animation.initial}
            animate={animation.animate}
          >
            Everyone needs to register for the WEB3.0
          </PermanentRegistrarLogo>
          <Search />
          <SocialIconLarge>
            <a href={TwitterUrl}>
              <img src={TwitterIcon} alt="twitter" />
            </a>
            <a href={TelegramUrl}>
              <img src={TelegramIcon} alt="telegram" />
            </a>
            <a href={DiscordUrl}>
              <img src={DiscordIcon} alt="discord" />
            </a>
            <a href={GithubUrl}>
              <img src={GithubIcon} alt="github" />
            </a>
          </SocialIconLarge>

          <LinkkeyCopyRight>
            <a href={LinkkeyUrl}>@2021 By Linkkey DAO</a>
          </LinkkeyCopyRight>
        </>
      </SearchContainer>
      {!mediumBP && (
        <SideNavDropDownContainer>
          <SideNav isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
        </SideNavDropDownContainer>
      )}
    </Hero>
  )
}
