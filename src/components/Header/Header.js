import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from '@emotion/styled/macro'

import mq, { useMediaMin, useMediaMax } from 'mediaQuery'

import DefaultLogo from '../Logo'
import Search from '../SearchName/Search'
import Hamburger from './Hamburger'
import SideNav from '../SideNav/SideNav'
import Banner from '../Banner'

import { hasNonAscii } from '../../utils/utils'
import LanguageSwitcher from '../LanguageSwitcher'
import AvatarAndInfoDropdown from '../AvatarAndInfoDropdown'

const StyledBanner = styled(Banner)`
  margin-bottom: 0;
  text-align: center;
  z-index: 0;
  margin-top: 50px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;

  ${mq.medium`
    top: 90px;
    position: fixed;
    margin-top: 0;
  `}
`

const StyledBannerInner = styled('div')`
  max-width: 720px;
  color: #fff;
`

const Header = styled('header')`
  display: flex;
  flex-direction: row;
  justify-content: center;
  background: #ea6060;
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  z-index: 2;
  height: auto;
  align-item: center;
  box-shadow: rgb(4 17 29 / 25%) 0px 0px 8px 0px;
  ${mq.medium`
    height: auto;
  `}
`

const SearchHeader = styled(Search)`
  background-color: transparent;
  margin-top: 60px;
  width: 100%;
  padding: 5px 20px 0px;
  ${mq.medium`
    margin-top: 0;
    padding:0px 20px;
    width: calc(100% - 200px);
  `}
`

const SideNavContainer = styled(`div`)`
  position: absolute;
  display: flex;
  flex-flow: row-reverse;
  right: 0;
`

const Logo = styled(DefaultLogo)`
  background: transparent;
  position: relative;
  display: flex;
  width: 100%;
  ${p =>
    p.isMenuOpen
      ? `
    opacity: 0;
  `
      : ''}

  ${mq.medium`
    opacity: 1;
    &:before {
      background: #d3d3d3;
      height: 32px;
      content: '';
      width: 1px;
      right: 35px;
      position: absolute;
    }
  `}
`

function HeaderContainer() {
  const [isMenuOpen, setMenuOpen] = useState(false)
  const mediumBP = useMediaMin('medium')
  const mediumBPMax = useMediaMax('medium')
  const toggleMenu = () => setMenuOpen(!isMenuOpen)
  const { t } = useTranslation()

  return (
    <>
      <Header isMenuOpen={isMenuOpen}>
        <Logo />
        {mediumBP ? (
          <>
            <SearchHeader />
            <AvatarAndInfoDropdown />
            <LanguageSwitcher />
          </>
        ) : (
          <>
            <LanguageSwitcher />
            <Hamburger
              isMenuOpen={isMenuOpen}
              openMenu={toggleMenu}
              closeMenu={setMenuOpen}
            />
          </>
        )}
      </Header>
      {hasNonAscii() && (
        <StyledBanner>
          <StyledBannerInner>
            <p>
              ⚠️ <strong>{t('warnings.homoglyph.title')}</strong>:{' '}
              {t('warnings.homoglyph.content')}{' '}
              <a
                target="_blank"
                href="https://en.wikipedia.org/wiki/IDN_homograph_attack"
                rel="noreferrer"
                style={{ color: '#ddd' }}
              >
                {t('warnings.homoglyph.link')}
              </a>
              .
            </p>
          </StyledBannerInner>
        </StyledBanner>
      )}
      {mediumBPMax && (
        <>
          {/* {!isMenuOpen && <SearchHeader />} */}
          <SearchHeader />
          <SideNavContainer>
            <SideNav isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
          </SideNavContainer>
        </>
      )}
    </>
  )
}

export default HeaderContainer
