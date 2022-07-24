import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import styled from '@emotion/styled'
import { useQuery } from '@apollo/client'
import { useLocation } from 'react-router-dom'
import { useTranslation, Trans } from 'react-i18next'
import moment from 'moment'
import { useAccount } from '../QueryAccount'

import {
  GET_FAVOURITES,
  GET_DOMAINS_SUBGRAPH,
  GET_REGISTRATIONS_SUBGRAPH,
  GET_SNS_NAME,
  GET_SINGLE_NAME
} from '../../graphql/queries'
import { decryptName, checkIsDecrypted } from '../../api/labels'

import mq from 'mediaQuery'

import AddressContainer from '../Basic/MainContainer'
import DefaultTopBar from '../Basic/TopBar'
import { Title as DefaultTitle } from '../Typography/Basic'
import DefaultEtherScanLink from '../Links/EtherScanLink'
import DefaultOpenseaLink from '../Links/OpenseaLink'
import DefaultRaribleLink from '../Links/RaribleLink'
import {
  getEtherScanAddr,
  filterNormalised,
  getOwnerNameAndAddress
} from '../../utils/utils'
import { calculateIsExpiredSoon } from '../../utils/dates'
import DomainList from './DomainList'
import RenewAll from './RenewAll'
import Sorting from './Sorting'
import Filtering from './Filtering'
import Loader from '../Loader'
import Banner from '../Banner'
import Checkbox from '../Forms/Checkbox'
import { SingleNameBlockies } from '../Blockies'
import Pager from './Pager'
import AddReverseRecord from '../AddReverseRecord'

import warning from '../../assets/yellowwarning.svg'
import close from '../../assets/close.svg'
import { useBlock } from '../hooks'
import { gql } from '@apollo/client'
import {
  NonMainPageBannerContainerWithMarginBottom,
  DAOBannerContent
} from '../Banner/DAOBanner'
import getSNS from 'apollo/mutations/sns'
import * as PropTypes from 'prop-types'
import PolygonscanIcon from 'components/Icons/PolygonscanIcon'
import { Tooltip } from 'antd'
import RaribleIcon from 'components/Icons/RaribleIcon'
import OpenseaIcon from 'components/Icons/OpenseaIcon'
import TooltipAnt from 'utils/tooltipAnt'

const DEFAULT_RESULTS_PER_PAGE = 25

const TopBar = styled(DefaultTopBar)`
  justify-content: space-between;
  margin-bottom: 40px;
`

const AddressTitleContainer = styled('div')`
  display: flex;
  overflow: hidden;
  text-overflow: ellipsis;
`

const SingleNameBlockiesWrapper = styled('div')`
  display: block;
`

const Title = styled(DefaultTitle)`
  white-space: nowrap;
  line-height: 50px;
  overflow: hidden;
  text-overflow: ellipsis;
`

const GoToIconWrapper = styled('div')`
  display: flex;
  align-items: center;
`

const EtherScanLink = styled(DefaultEtherScanLink)`
  width: 25px;
  height: 25px;
  color: #8247e5;
  margin-left: auto;
  &:hover {
    transform: scale(1.1);
  }
  &:active {
    transform: scale(1.2);
  }
`

const TooltipTitleWrapper = styled('div')`
  font-size: 16px;
  font-weight: 700;
  color: black;
`

const OpenseaLink = styled(DefaultOpenseaLink)`
  margin-left: 10px;
  svg {
    opacity: 1;
    transition: 0.1s;
  }
  &:hover {
    transform: scale(1.1);
  }
  &:active {
    transform: scale(1.2);
  }
`

const RaribleLink = styled(DefaultRaribleLink)`
  margin-left: 10px;
  svg {
    opacity: 1;
    transition: 0.1s;
  }
  &:hover {
    transform: scale(1.1);
  }
  &:active {
    transform: scale(1.2);
  }
`

const Close = styled('img')`
  position: absolute;
  right: 20px;
  top: 20px;
  &:hover {
    cursor: pointer;
  }
`

const Controls = styled('div')`
  padding-left: 8px;
  display: grid;
  align-content: center;
  grid-template-columns: 1fr;
  grid-template-rows: auto;
  grid-template-areas:
    'filters'
    'actions'
    'renew'
    'sorting'
    'selectall';
  grid-gap: 20px 10px;
  margin: 20px;

  ${mq.large`
    margin: 20px 30px;
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
    'filters actions'
    'renew renew'
    'sorting selectall'
    ;
  `}
`

const SelectAll = styled('div')`
  grid-area: selectall;
  display: flex;
  justify-content: flex-end;
  padding-right: 40px;

  ${mq.large`
    padding-right: 10px;
  `}
`

const LinkList = styled('div')`
  display: block;
  justify-content: center;
  text-align: right;
`

function filterOutReverse(domains) {
  return domains.filter(domain => domain.parent)
}

function normaliseAddress(address) {
  return address.toLowerCase()
}

function decryptNames(domains) {
  return domains.map(d => {
    const name = decryptName(d.domain.name)
    return {
      ...d,
      domain: {
        ...d.domain,
        name: name,
        labelName: checkIsDecrypted(name[0]) ? name.split('.')[0] : null
      }
    }
  })
}

function useDomains({
  resultsPerPage,
  domainType,
  address,
  sort,
  page,
  expiryDate
}) {
  const skip = (page - 1) * resultsPerPage
  // const registrationsQuery = useQuery(GET_REGISTRATIONS_SUBGRAPH, {
  //   variables: {
  //     id: address,
  //     first: resultsPerPage,
  //     skip,
  //     orderBy: sort.type,
  //     orderDirection: sort.direction,
  //     expiryDate
  //   },
  //   skip: domainType !== 'registrant',
  //   fetchPolicy: 'no-cache'
  // })
  //
  // const controllersQuery = useQuery(GET_DOMAINS_SUBGRAPH, {
  //   variables: {
  //     id: address,
  //     first: resultsPerPage,
  //     skip
  //   },
  //   skip: domainType !== 'controller',
  //   fetchPolicy: 'no-cache'
  // })

  if (domainType === 'registrant') {
    return registrationsQuery
  } else if (domainType === 'controller') {
    return controllersQuery
  } else {
    throw new Error('Unrecognised domainType')
  }
}

function getSNSNameInfo(address) {
  const data2 = useQuery(GET_SNS_NAME, {
    variables: {
      address: address
    }
  })

  // console.log('data2.data--------', data2.data)
  let SNSName
  if (data2.data) {
    SNSName = data2.data.getSnsName
  }
  // console.log('SNSName--------', SNSName)

  const { data, loading, error } = useQuery(GET_SINGLE_NAME, {
    variables: {
      name: SNSName
    }
  })
  // console.log('!loading && !error', !loading && !error)
  // console.log('data-------', data)
  if (!loading && !error) {
    return data
  }
  return null
}

const RESET_STATE_QUERY = gql`
  query resetStateQuery @client {
    networkId
    isENSReady
  }
`
export const useResetState = (
  setYears,
  setCheckedBoxes,
  setSelectAll,
  networkId
) => {
  useEffect(() => {
    setYears(1)
    setCheckedBoxes({})
    setSelectAll(null)
  }, [networkId])
}

LinkList.propTypes = { children: PropTypes.node }
export default function Address({
  url,
  address,
  showOriginBanner,
  domainType = 'registrant'
}) {
  const {
    data: { networkId, isENSReady }
  } = useQuery(RESET_STATE_QUERY)
  const normalisedAddress = normaliseAddress(address)
  const { search } = useLocation()
  const account = useAccount()
  const pageQuery = new URLSearchParams(search).get('page')
  const page = pageQuery ? parseInt(pageQuery) : 1
  const { block } = useBlock()
  let [resultsPerPage, setResultsPerPage] = useState(DEFAULT_RESULTS_PER_PAGE)
  let { t } = useTranslation()
  let [showOriginBannerFlag, setShowOriginBannerFlag] = useState(true)
  let [etherScanAddr, setEtherScanAddr] = useState(null)
  let [activeSort, setActiveSort] = useState({
    type: 'expiryDate',
    direction: 'asc'
  })
  let [checkedBoxes, setCheckedBoxes] = useState({})
  let [years, setYears] = useState(1)
  const [selectAll, setSelectAll] = useState(false)
  useResetState(setYears, setCheckedBoxes, setSelectAll, networkId)

  let currentDate, expiryDate
  if (process.env.REACT_APP_STAGE === 'local') {
    if (block) {
      currentDate = moment(block.timestamp * 1000)
    }
  } else {
    currentDate = moment()
  }
  if (currentDate) {
    expiryDate = currentDate.subtract(90, 'days').unix()
  }

  let snsNameInfo = getSNSNameInfo(address)

  const [tokenIdState, setTokenId] = useState()

  const handleTokenIdState = () => {
    const sns = getSNS()
    let tokenId = ''
    try {
      sns.getNameOfOwner(address).then(resp => {
        sns.getTokenIdOfName(resp).then(res => {
          tokenId = parseInt(res._hex, 16)
          return tokenId
        })
      })
    } finally {
      return tokenId
    }
  }

  const { data: { favourites } = [] } = useQuery(GET_FAVOURITES)
  useEffect(() => {
    if (isENSReady) {
      getEtherScanAddr().then(setEtherScanAddr)
      const tokenId = handleTokenIdState()
      console.log('tokenId:', tokenId)
    }
  }, [isENSReady])

  // if (error) {
  //   console.log(error)
  //   return <>Error getting domains. {JSON.stringify(error)}</>
  // }
  //
  // if (loading) {
  //   return <Loader withWrap large />
  // }

  let normalisedDomains = []

  // if (domainType === 'registrant' && data.account) {
  //   normalisedDomains = [...data.account.registrations]
  // } else if (domainType === 'controller' && data.account) {
  //   normalisedDomains = [
  //     ...filterOutReverse(data.account.domains).map(domain => ({ domain }))
  //   ]
  // }

  let decryptedDomains = filterNormalised(
    decryptNames(normalisedDomains),
    'labelName',
    true
  )
  // let sortedDomains = decryptedDomains.sort(getSortFunc(activeSort))
  let domains = decryptedDomains
  const selectedNames = Object.entries(checkedBoxes)
    .filter(([key, value]) => value)
    .map(([key]) => key)

  const allNames = domains
    .filter(d => d.domain.labelName)
    .map(d => d.domain.name)

  const selectAllNames = () => {
    const obj = allNames.reduce((acc, name) => {
      acc[name] = true
      return acc
    }, {})

    setCheckedBoxes(obj)
  }

  const hasNamesExpiringSoon = !!domains.find(domain =>
    calculateIsExpiredSoon(domain.expiryDate)
  )

  let ownerMsgObj = getOwnerNameAndAddress()

  return (
    <>
      {/*<NonMainPageBannerContainerWithMarginBottom>*/}
      {/*  <DAOBannerContent />*/}
      {/*</NonMainPageBannerContainerWithMarginBottom>*/}

      {/*{showOriginBanner && showOriginBannerFlag && (*/}
      {/*  <Banner>*/}
      {/*    <Close onClick={() => setShowOriginBannerFlag(false)} src={close} />*/}
      {/*    {t('address.transactionBanner')}*/}
      {/*  </Banner>*/}
      {/*)}*/}
      {/*{hasNamesExpiringSoon && (*/}
      {/*  <Banner>*/}
      {/*    <h3>*/}
      {/*      <img alt="exclamation mark" src={warning} />*/}
      {/*      &nbsp; {t('address.namesExpiringSoonBanner.title')}*/}
      {/*      <p>*/}
      {/*        <Trans i18nKey="address.namesExpiringSoonBanner.text">*/}
      {/*          One or more names are expiring soon, renew them all in one*/}
      {/*          transaction by selecting multiple names and click "Renew"*/}
      {/*        </Trans>*/}
      {/*      </p>*/}
      {/*    </h3>*/}
      {/*  </Banner>*/}
      {/*)}*/}

      <AddressContainer>
        <TopBar>
          <AddressTitleContainer>
            <SingleNameBlockiesWrapper>
              <SingleNameBlockies address={address} />
            </SingleNameBlockiesWrapper>
            <Link to={`/name/${ownerMsgObj?.displayName}`}>
              <Title>{ownerMsgObj?.displayName}</Title>
            </Link>
          </AddressTitleContainer>
          <GoToIconWrapper>
            <TooltipAnt title={t('address.etherscanButton')}>
              <LinkList>
                {etherScanAddr && (
                  <EtherScanLink address={address}>
                    <PolygonscanIcon />
                  </EtherScanLink>
                )}
              </LinkList>
            </TooltipAnt>
            <TooltipAnt title={t('address.raribleButton')}>
              <LinkList>
                {tokenIdState ? (
                  <RaribleLink tokenId={tokenIdState}>
                    <RaribleIcon />
                  </RaribleLink>
                ) : (
                  ''
                )}
              </LinkList>
            </TooltipAnt>
            <TooltipAnt title={t('address.openseaButton')}>
              <LinkList>
                {tokenIdState ? (
                  <OpenseaLink tokenId={tokenIdState}>
                    <OpenseaIcon />
                  </OpenseaLink>
                ) : (
                  ''
                )}
              </LinkList>
            </TooltipAnt>
          </GoToIconWrapper>
        </TopBar>
        {/*<AddReverseRecord account={account} currentAddress={address} />*/}
        {/*<Controls>*/}
        {/*  <Filtering*/}
        {/*    activeFilter={domainType}*/}
        {/*    setActiveSort={setActiveSort}*/}
        {/*    url={url}*/}
        {/*  />*/}

        {/*  {domainType === 'registrant' && (*/}
        {/*    <RenewAll*/}
        {/*      years={years}*/}
        {/*      setYears={setYears}*/}
        {/*      activeFilter={domainType}*/}
        {/*      selectedNames={selectedNames}*/}
        {/*      setCheckedBoxes={setCheckedBoxes}*/}
        {/*      setSelectAll={setSelectAll}*/}
        {/*      allNames={allNames}*/}
        {/*      address={address}*/}
        {/*      data={data}*/}
        {/*      refetch={refetch}*/}
        {/*      getterString="account.registrations"*/}
        {/*    />*/}
        {/*  )}*/}
        {/*  <Sorting*/}
        {/*    activeSort={activeSort}*/}
        {/*    setActiveSort={setActiveSort}*/}
        {/*    activeFilter={domainType}*/}
        {/*  />*/}

        {/*  {domainType === 'registrant' && (*/}
        {/*    <>*/}
        {/*      <SelectAll>*/}
        {/*        <Checkbox*/}
        {/*          testid="checkbox-renewall"*/}
        {/*          type="double"*/}
        {/*          checked={selectAll}*/}
        {/*          onClick={() => {*/}
        {/*            if (!selectAll) {*/}
        {/*              selectAllNames()*/}
        {/*            } else {*/}
        {/*              setCheckedBoxes({})*/}
        {/*            }*/}
        {/*            setSelectAll(selectAll => !selectAll)*/}
        {/*          }}*/}
        {/*        />*/}
        {/*      </SelectAll>*/}
        {/*    </>*/}
        {/*  )}*/}
        {/*</Controls>*/}

        <DomainList
          snsNameInfo={snsNameInfo}
          snsName={snsNameInfo}
          setSelectAll={setSelectAll}
          address={address}
          domains={domains}
          favourites={filterNormalised(favourites, 'labelName')}
          activeSort={activeSort}
          activeFilter={domainType}
          checkedBoxes={checkedBoxes}
          setCheckedBoxes={setCheckedBoxes}
          showBlockies={false}
        />
        {/*<Pager*/}
        {/*  variables={{ id: address, expiryDate }}*/}
        {/*  currentPage={page}*/}
        {/*  resultsPerPage={resultsPerPage}*/}
        {/*  setResultsPerPage={setResultsPerPage}*/}
        {/*  pageLink={`/address/${address}/${domainType}`}*/}
        {/*  query={*/}
        {/*    domainType === 'registrant'*/}
        {/*      ? GET_REGISTRATIONS_SUBGRAPH*/}
        {/*      : GET_DOMAINS_SUBGRAPH*/}
        {/*  }*/}
        {/*/>*/}
      </AddressContainer>
    </>
  )
}
