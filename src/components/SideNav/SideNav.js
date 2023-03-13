import React from 'react'
import styled from '@emotion/styled/macro'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@apollo/client'
import NetworkInformation from '../NetworkInformation/NetworkInformation'
import { aboutPageURL, hasNonAscii } from '../../utils/utils'
import mq from 'mediaQuery'
import { Link, withRouter } from 'react-router-dom'
import gql from 'graphql-tag'

const SideNavContainer = styled('nav')`
  display: ${p => (p.isMenuOpen ? 'block' : 'none')};
  z-index: 999;
  ${mq.medium`
    z-index: 999;
  `}
  left: 0;
  height: auto;
  background: white;
  width: 230px;
  margin-top: -10px;
  border-radius: 14px;
  ${mq.medium`
    padding: 0;
    left: 35px;
    height: auto;
    background: transparent;
    width: 165px;
    display: block;
  `}

  ul {
    padding: 0;
    margin: 0;
    margin-left: 16px;
  }
  li {
    list-style: none;
  }

  ${p =>
    p.hasNonAscii
      ? `
      top: 200px;
      ${mq.medium`top: 200px`}
    `
      : `
      top: 100px;
      ${mq.medium`top: 100px`}
    `}
`

const NavLink = styled(Link)`
  display: flex;
  text-align: center;
  align-items: center;
  justify-content: flex-start;
  font-weight: 200;
  font-size: 16px;
  color: ${p => (p.active ? '#ea6060' : '#C7D3E3')};
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);

  ${mq.medium`
    justify-content: start;
    border-bottom: 0;
  `}
  ${mq.small`
    justify-content: start;
    border-bottom: 0;
    font-size: 18px;
  `}

  &:visited {
    color: #c7d3e3;
  }

  span {
    transition: 0.2s;
    margin-left: 15px;
    color: ${p => (p.active ? '#ea6060' : '#C7D3E3')};
  }

  &:hover {
    span {
      color: #ea6060;
    }
    path {
      fill: #ea6060;
    }
    g {
      fill: #ea6060;
    }
  }
`

const ThirdPartyLink = styled('a')`
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 200;
  font-size: 16px;
  color: ${p => (p.active ? '#ea6060' : '#C7D3E3')};
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);

  ${mq.medium`
    justify-content: start;
    border-bottom: 0;
  `}
  ${mq.small`
    justify-content: start;
    border-bottom: 0;
    font-size: 18px;
  `}

  &:visited {
    color: #c7d3e3;
  }

  span {
    transition: 0.2s;
    margin-left: 15px;
    color: ${p => (p.active ? '#ea6060' : '#C7D3E3')};
  }

  &:hover {
    span {
      color: #ea6060;
    }
    path {
      fill: #ea6060;
    }
    g {
      fill: #ea6060;
    }
  }
`

const SIDENAV_QUERY = gql`
  query getSideNavData {
    accounts
    isReadOnly
  }
`

function SideNav({ match, isMenuOpen, toggleMenu }) {
  const { url } = match
  const { t } = useTranslation()
  const {
    data: { accounts, isReadOnly }
  } = useQuery(SIDENAV_QUERY)

  return (
    <SideNavContainer isMenuOpen={isMenuOpen} hasNonAscii={hasNonAscii()}>
      <NetworkInformation />
      <ul data-testid="sitenav">
        {accounts?.length > 0 && !isReadOnly ? (
          <li>
            <NavLink
              onClick={toggleMenu}
              active={url === '/address/' + accounts[0] ? 1 : 0}
              to={'/address/' + accounts[0]}
            >
              {/*<File active={url === '/address/' + accounts[0]} />*/}
              <span>{t('c.mynames')}</span>
            </NavLink>
          </li>
        ) : null}
        <li>
          <NavLink
            onClick={toggleMenu}
            active={url === '/faq' ? 1 : 0}
            to="/faq"
          >
            {/*<FaqIcon />*/}
            <span>{t('c.faq')}</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="https://www.linkkey.io">
            <span>{t('c.linkkey')}</span>
          </NavLink>
        </li>
      </ul>
    </SideNavContainer>
  )
}
export default withRouter(SideNav)
