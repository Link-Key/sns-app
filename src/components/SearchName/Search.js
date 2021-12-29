import React, { useState } from 'react'
import styled from '@emotion/styled/macro'
import { useTranslation } from 'react-i18next'
import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client'

import { parseSearchTerm } from '../../utils/utils'
import '../../api/subDomainRegistrar'
import { withRouter } from 'react-router'
import searchIcon from '../../assets/search.svg'
import mq, { useMediaMin, useMediaMax } from 'mediaQuery'

const SearchForm = styled('form')`
  display: flex;
  position: relative;
  ${p => (p && p.pathName === '/' ? ` z-index:100;` : ``)}

  &:before {
    content: '';
    position: absolute;
    left: 20px;
    top: 50%;
    transform: translate(0, -50%);
    display: block;
    width: 27px;
    height: 27px;
  }

  input {
    padding: 20px 10px;
    width: 100%;
    border: none;
    border-radius: 14px 0 0 14px;
    // ${p =>
      p.mediumBP ? `border-radius:14px 0 0 14px;` : `border-radius:0;`}
    font-size: 18px;
    font-family: Overpass;
    font-weight: 100;
    ${mq.medium`
      width: calc(100% - 162px);
      font-size: 28px;
      padding: 20px 30px;
    `}

    &:focus {
      outline: 0;
    }

    &::-webkit-input-placeholder {
      /* Chrome/Opera/Safari */
      color: #ccd4da;
    }
  }

  button {
    ${p =>
      p && p.hasSearch
        ? 'background: #eb8b8c;color: white;'
        : 'background: #eee; color:#eb8b8c;'}
    //background: #eb8b8c;
    font-size: 22px;
    font-family: Overpass;
    padding: 20px 0;
    width: calc(100% - 162px);
    border: none;
    border-radius: 0 14px 14px 0;
    ${mq.medium`
      display: block;
      width: 162px;
      height: 90px;
      border-radius: 0 14px 14px 0;
    `}
    &:hover {
      ${p => (p && p.hasSearch ? 'cursor: pointer;' : 'cursor: default;')}
    }
  }
`

const GlobalContainer = styled(`div`)`
  ${p =>
    p && !p.mediumBP && p.pathName === '/'
      ? `display:block; z-index:10;`
      : `display:none;z-index:-10;`}
  position:absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #ea6060;
`

const SEARCH_QUERY = gql`
  query searchQuery {
    isENSReady @client
  }
`

function Search({ history, className, style }) {
  const mediumBP = useMediaMin('medium')
  const mediumBPMax = useMediaMax('medium')
  const { t } = useTranslation()
  const [inputValue, setInputValue] = useState(null)
  const [foucsState, setFoucsState] = useState(false)
  const {
    data: { isENSReady }
  } = useQuery(SEARCH_QUERY)
  let input
  const handleParse = e => {
    setInputValue(
      e.target.value
        .split('.')
        .map(term => term.trim())
        .join('.')
    )
  }
  const hasSearch = inputValue && inputValue.length > 0 && isENSReady
  return (
    <>
      <SearchForm
        className={className}
        style={style}
        action="#"
        hasSearch={hasSearch}
        pathName={history.location.pathname}
        mediumBP={mediumBP}
        mediumBPMax={mediumBPMax}
        onSubmit={async e => {
          e.preventDefault()
          if (!hasSearch) return
          const type = await parseSearchTerm(inputValue)
          let searchTerm
          if (input && input.value) {
            // inputValue doesn't have potential whitespace
            searchTerm = inputValue.toLowerCase()
          }
          if (!searchTerm || searchTerm.length < 1) {
            return
          }

          if (type === 'address') {
            history.push(`/address/${searchTerm}`)
            return
          }

          input.value = ''
          if (type === 'supported' || type === 'short') {
            history.push(`/name/${searchTerm}`)
            return
          } else {
            let suffix
            if (searchTerm.split('.').length === 1) {
              suffix = searchTerm + '.key'
            } else {
              suffix = searchTerm
            }
            history.push(`/name/${suffix}`)
          }
        }}
      >
        <input
          placeholder={t('search.placeholder')}
          ref={el => (input = el)}
          onChange={handleParse}
          onFocus={() => setFoucsState(true)}
          onBlur={() => setFoucsState(false)}
        />
        <button
          disabled={!hasSearch}
          type="submit"
          data-testid={'home-search-button'}
        >
          {t('search.button')}
        </button>
      </SearchForm>
      {foucsState && (
        <GlobalContainer
          mediumBP={mediumBP}
          pathName={history.location.pathname}
        />
      )}
    </>
  )
}

const SearchWithRouter = withRouter(Search)

const SearchContainer = ({ searchDomain, className, style }) => {
  return (
    <SearchWithRouter
      searchDomain={searchDomain}
      className={className}
      style={style}
    />
  )
}

export { SearchWithRouter as Search }

export default SearchContainer
