import React, { useState } from 'react'
import styled from '@emotion/styled/macro'
import { useTranslation } from 'react-i18next'
import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client'
import { LoadingOutlined, RightOutlined } from '@ant-design/icons'
import { parseSearchTerm } from '../../utils/utils'
import '../../api/subDomainRegistrar'
import { withRouter } from 'react-router'
import searchIcon from '../../assets/search.png'
import mq, { useMediaMin, useMediaMax } from 'mediaQuery'
import { useCallback } from 'react'
import getSNS from 'apollo/mutations/sns'
import { checkKeyName } from 'api/reqList'

const SearchForm = styled('form')`
  display: flex;
  position: relative;
  ${p => (p && p.pathName === '/' ? ` z-index:100;` : ``)}
  align-self:center;

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
    height: 40px;
    border: none;
    border-radius: 14px 0 0 14px;
    font-size: 16px;
    font-family: Overpass;
    font-weight: 100;
    padding: 3px 15px 0;
    ${mq.medium`
      width: calc(600px - 162px);
      height:45px;
      font-size: 18px;
      padding: 3px 15px 0;
    `}

    &:focus {
      outline: 0;
    }

    &::-webkit-input-placeholder {
      // Chrome/Opera/Safari
      color: #ccd4da;
      line-height: 47px;
    }
  }

  button {
    ${p =>
      p && p.hasSearch
        ? 'background: #eb8b8c;color: white;'
        : 'background: #ddd; color:#fff;'}
    font-size: 18px;
    height: 40px;
    font-family: Overpass;
    line-height: 36px;
    width: calc(350px - 240px);
    border: none;
    border-radius: 0 14px 14px 0;
    ${mq.medium`
      display: block;
      width: 115px;
      height: 45px;
      line-height: 47px;
      border-radius: 0 14px 14px 0;
    `}
    &:hover {
      ${p => (p && p.hasSearch ? 'cursor: pointer;' : 'cursor: default;')}
    }
    &:active {
      ${p => (p && p.hasSearch ? 'background:#eb8b8caa;' : '')}
    }
    img {
      width: 25px;
      height: 25px;
    }
  }
`
const SearchResult = styled('div')`
  display: flex;
  justify-content: space-between;
  align-items: center;

  position: absolute;
  top: 50px;
  width: 100%;
  height: 60px;
  border-radius: 14px;
  padding: 10px 15px;
  background-color: white;
  ${mq.medium`
    top:80px
  `}
`

const NoData = styled('div')`
  color: #888;
`

const StatusWrapper = styled('div')`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 100%;
  span {
    font-size: 16px;
    margin-left: 10px;
  }

  &:hover {
    border-radius: 14px;
    background-color: #eee;
  }
`

const TagWrapper = styled('div')`
  display: flex;
  align-items: center;
`

const TagStatus = styled('div')`
  display: flex;
  align-items: center;
  padding: 2px 30px;
  border-radius: 50px;
  color: #fff;
`

const GlobalContainer = styled('div')`
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
  const [focusState, setFocusState] = useState(false)
  const [loading, setLoading] = useState(false)
  const [registerStatus, setRegisterStatus] = useState(null)

  const {
    data: { isENSReady }
  } = useQuery(SEARCH_QUERY)
  let input
  const judgeHasKeySuffix = value => {
    if (value.split('.').length === 2) {
      return value
    } else {
      return `${value}.key`
    }
  }

  const queryDomain = async value => {
    const resp = await checkKeyName({ keyName: value })
    if (resp && resp.data && resp.data.code === 200) {
      setRegisterStatus(resp.data.data.registered)
    }
  }

  const handleParse = e => {
    e.persist()
    setInputValue(
      e.target.value
        .split('.')
        .map(term => term.trim())
        .join('.')
    )
    if (e.target.value.length >= 3) {
      setLoading(true)
      if (window.inputTimeout) clearTimeout(window.inputTimeout)
      window.inputTimeout = setTimeout(async () => {
        const value = judgeHasKeySuffix(e.target.value)
        await queryDomain(value)
        setLoading(false)
      }, [800])
    }
  }

  const addressRegisteredFn = async name => {
    const sns = await getSNS()
    const info = await sns.recordExists(name)
    return info
  }

  const hasSearch = inputValue && inputValue.length > 0 && isENSReady

  const handleSubmit = async () => {
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

    let isRegister = false
    if (searchTerm.split('.').length === 2) {
      isRegister = await addressRegisteredFn(searchTerm)
    } else {
      isRegister = await addressRegisteredFn(`${searchTerm}.key`)
    }
    // input.value = ''
    if (type === 'supported' || type === 'short') {
      if (searchTerm.split('.')[0].length === 3 && !isRegister) {
        history.push(`/ShortName/${searchTerm}`)
        return
      }
      history.push(`/name/${searchTerm}`)
      return
    } else {
      let suffix
      if (searchTerm.split('.').length === 1) {
        suffix = searchTerm + '.key'
      } else {
        suffix = searchTerm
      }
      suffix.length === 7 && !isRegister
        ? history.push(`/ShortName/${suffix}`)
        : history.push(`/name/${suffix}`)
    }
  }

  const handlePopover = useCallback(() => {
    if (loading) {
      return (
        <div style={{ color: '#888' }}>
          <LoadingOutlined
            style={{
              color: '#ea6060',
              fontSize: '16px',
              fontWeight: 500,
              marginRight: '10px'
            }}
          />{' '}
          loading...
        </div>
      )
    } else {
      if (inputValue && inputValue.length < 3) {
        return <NoData>{t('search.noData')}</NoData>
      } else {
        return (
          <StatusWrapper
            onClick={async () => {
              await handleSubmit()
            }}
          >
            <span>{judgeHasKeySuffix(inputValue)}</span>
            <TagWrapper>
              <TagStatus
                style={{ backgroundColor: registerStatus ? '#bbb' : '#81B337' }}
              >
                {registerStatus
                  ? t('search.registered')
                  : t('search.unRegistered')}
              </TagStatus>
              {!registerStatus && <RightOutlined />}
            </TagWrapper>
          </StatusWrapper>
        )
      }
    }
  }, [inputValue, loading, registerStatus, t])

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
          await handleSubmit()
        }}
      >
        <input
          placeholder={t('search.placeholder')}
          ref={el => (input = el)}
          onChange={handleParse}
          onFocus={() => setFocusState(true)}
          onBlur={() =>
            setTimeout(() => {
              setFocusState(false)
            }, [300])
          }
        />

        {focusState && inputValue && (
          <SearchResult>{handlePopover()}</SearchResult>
        )}
        <button
          disabled={!hasSearch}
          type="submit"
          data-testid={'home-search-button'}
        >
          {mediumBP ? (
            t('search.button')
          ) : (
            <img src={searchIcon} alt="search" />
          )}
        </button>
      </SearchForm>
      {focusState && (
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
