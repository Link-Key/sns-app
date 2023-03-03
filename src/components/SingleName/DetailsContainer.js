import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import styled from '@emotion/styled'
import mq from '../../mediaQuery'

import SetupName from '../SetupName/SetupName'
import RegistryMigration from './RegistryMigration'
import { DetailsItem, DetailsKey, DetailsValue } from './DetailsItem'
import { ReactComponent as ExternalLinkIcon } from '../Icons/externalLink.svg'
import DetailsItemEditable from './DetailsItemEditable'
import {
  RECLAIM,
  RENEW,
  SET_OWNER,
  SET_REGISTRANT,
  SET_SUBNODE_OWNER
} from '../../graphql/mutations'
import { SingleNameBlockies } from '../Blockies'
import You from '../Icons/You'
import SubmitProof from './SubmitProof'
import Tooltip from '../Tooltip/Tooltip'
import { H2, HR } from '../Typography/Basic'
import { formatDate } from '../../utils/dates'
import ResolverAndRecords from './ResolverAndRecords'
import NameClaimTestDomain from './NameClaimTestDomain'
import DefaultLoader from '../Loader'
import DefaultButton from '../Forms/Button'
import DefaultAddressLink from '../Links/AddressLink'

import { ReactComponent as DefaultOrangeExclamation } from '../Icons/OrangeExclamation.svg'
import { containZeroWidthStr, emptyAddress } from '../../utils/utils'
import * as PropTypes from 'prop-types'

const Details = styled('section')`
  padding: 20px;
  transition: 0.4s;
  ${mq.small`
    padding: 40px;
  `}
`

const Loader = styled(DefaultLoader)`
  width: 30%;
  margin: auto;
`

const Button = styled(DefaultButton)`
  position: absolute;
  width: 130px;
  background-colore: white;
`

const ButtonContainer = styled('div')`
  margin-top: 20px;
  height: 50px;
  ${mq.small`
    height: 50px;
    width: 50px;
    position: absolute;
    right: 128px;
    -webkit-transform: translate(0, -65%);
    -ms-transform: translate(0, -65%);
    transform: translate(0, -65%);
  `}
`

const ExpirationDetailsValue = styled(DetailsValue)`
  color: ${p => (p.isExpired ? 'red' : null)};
`

const AddressLink = styled(DefaultAddressLink)`
  display: flex;
  align-items: center;
`

const Explainer = styled('div')`
  background: #f0f6fa;
  color: #adbbcd;
  display: flex;
  padding: 1em 0;
  margin-left: 0px;
  ${mq.small`
    margin-left: 180px;
  `}

  margin-bottom: 45px;
  padding-left: 24px;
`

const ErrorExplainer = styled(Explainer)`
  background: #fef7e9;
`

const OutOfSyncExplainer = styled('div')`
  margin-top: 20px;
  background: #fef7e9;
  display: flex;
`

const OutOfSyncExplainerContainer = styled('div')`
  margin-top: 15px;
`

const EtherScanLinkContainer = styled('span')`
  display: inline-block;
  transform: translate(25%, 20%);
`

const LinkToLearnMore = styled('a')`
  margin-right: ${props => (props.outOfSync ? '' : '')};
  font-size: 14px;
  letter-spacing: 0.58px;
  text-align: center;
  margin-left: auto;
  min-width: 130px;
`

const OrangeExclamation = styled(DefaultOrangeExclamation)`
  margin-right: 5px;
  margin-top: 6px;
  width: 20px;
  height: 20px;
`

const DNSOwnerError = styled('span')`
  color: #f5a623;
`

const OwnerFields = styled('div')`
  background: ${props => (props.outOfSync ? '#fef7e9' : '')};
  padding: ${props => (props.outOfSync ? '1.5em' : '0')};
  margin-bottom: ${props => (props.outOfSync ? '1.5em' : '0')};
`

const DomainOwnerAddress = styled('span')`
  color: ${props => (props.outOfSync ? '#CACACA' : '')};
`

const GracePeriodWarningContainer = styled('div')`
  font-family: 'Overpass';
  background: ${p => (p.isExpired ? '#ff926f' : '#fef7e9')};
  padding: 10px 20px;
  margin: 5px 0px;
`

const GracePeriodText = styled('span')`
  color: ${p => (p.isExpired ? 'white' : '#cacaca')};
  margin-left: 0.5em;
`

const GracePeriodDate = styled('span')`
  font-weight: bold;
`

const Expiration = styled('span')`
  color: ${p => (p.isExpired ? 'white' : '#f5a623')};
  font-weight: bold;
`

const ZeroWidth = styled('div')`
  background: #f0f6fa;
  padding: 20px 40px;
  margin-bottom: 40px;
  color: #adbbcd;
  font-size: 18px;
`

const GracePeriodWarning = ({ date, expiryTime }) => {
  let { t } = useTranslation()
  let isExpired = new Date() > new Date(expiryTime)
  return (
    <GracePeriodWarningContainer isExpired={isExpired}>
      <Expiration isExpired={isExpired}>
        {isExpired
          ? t('singleName.expiry.expired')
          : t('singleName.expiry.expiringSoon')}
      </Expiration>
      <GracePeriodText isExpired={isExpired}>
        {t('singleName.expiry.gracePeriodEnds')}{' '}
        <GracePeriodDate>{formatDate(date)}</GracePeriodDate>
      </GracePeriodText>
    </GracePeriodWarningContainer>
  )
}

function canClaim(domain) {
  if (!domain.name?.match(/\.test$/)) return false
  return parseInt(domain.owner) === 0 || domain.expiryTime < new Date()
}

ZeroWidth.propTypes = { children: PropTypes.node }

function DetailsContainer({
  isMigratedToNewRegistry,
  isDeedOwner,
  isRegistrant,
  showExplainer,
  canSubmit,
  outOfSync,
  loading,
  setLoading,
  isOwnerOfParent,
  isOwner,
  refetch,
  domain,
  dnssecmode,
  account,
  loadingIsMigrated,
  refetchIsMigrated,
  isParentMigratedToNewRegistry,
  loadingIsParentMigrated
}) {
  const { t } = useTranslation()

  const isExpired = false
  const domainOwner =
    domain.available || domain.owner === emptyAddress ? null : domain.owner
  const registrant =
    domain.available || domain.registrant === emptyAddress
      ? null
      : domain.registrant
  const domainParent =
    domain.name === '[root]' ? null : domain.parent ? domain.parent : '[root]'

  const is2ld = domain.name?.split('.').length === 2
  const showUnclaimableWarning =
    is2ld &&
    parseInt(domain.owner) === 0 &&
    domain.parent !== 'key' &&
    !domain.isDNSRegistrar

  const containZeroWidth = containZeroWidthStr(domain.name)
  const encodeName = encodeURI(domain.name)

  return (
    <Details data-testid="name-details">
      {containZeroWidth ? (
        <ZeroWidth>
          {' '}
          ⚠️{t('singleName.containZeroWidth')} + {encodeName}{' '}
        </ZeroWidth>
      ) : (
        ''
      )}
      {isOwner && <SetupName initialState={showExplainer} />}
      {domainParent ? (
        <DetailsItem uneditable>
          <DetailsKey>{t('c.parent')}</DetailsKey>
          <DetailsValue>
            <Link to={`/name/${domainParent}`}>{domainParent}</Link>
          </DetailsValue>
        </DetailsItem>
      ) : (
        ''
      )}
      <OwnerFields outOfSync={outOfSync}>
        <>
          <DetailsItemEditable
            domain={domain}
            keyName="registrant"
            value={registrant}
            canEdit={isOwner}
            isExpiredRegistrant={isRegistrant && isExpired}
            type="address"
            editButton={t('c.transfer')}
            mutationButton={t('c.transfer')}
            mutation={SET_REGISTRANT}
            refetch={refetch}
            confirm={true}
            copyToClipboard={true}
          />
        </>

        {domain.registrationDate ? (
          <DetailsItem uneditable>
            <DetailsKey>{t('c.registrationDate')}</DetailsKey>
            <DetailsValue>{formatDate(domain.registrationDate)}</DetailsValue>
          </DetailsItem>
        ) : (
          ''
        )}
        {!domain.available ? (
          domain.isNewRegistrar || domain.gracePeriodEndDate ? (
            <>
              <DetailsItemEditable
                domain={domain}
                keyName="Expiration Date"
                value={domain.expiryTime}
                canEdit={parseInt(account, 16) !== 0}
                type="date"
                editButton={t('c.renew')}
                mutationButton={t('c.renew')}
                mutation={RENEW}
                refetch={refetch}
                confirm={true}
              />
              {domain.gracePeriodEndDate ? (
                <GracePeriodWarning
                  expiryTime={domain.expiryTime}
                  date={domain.gracePeriodEndDate}
                />
              ) : (
                ''
              )}
            </>
          ) : domain.expiryTime ? (
            <DetailsItem uneditable>
              <DetailsKey>{t("c['Expiration Date']")}</DetailsKey>
              <ExpirationDetailsValue isExpired={isExpired}>
                {formatDate(domain.expiryTime)}
              </ExpirationDetailsValue>
            </DetailsItem>
          ) : (
            ''
          )
        ) : (
          ''
        )}
      </OwnerFields>
      <HR />
      <ResolverAndRecords
        domain={domain}
        isOwner={isOwner}
        refetch={refetch}
        account={account}
        isMigratedToNewRegistry={isMigratedToNewRegistry}
      />
      {canClaim(domain) ? (
        <NameClaimTestDomain domain={domain} refetch={refetch} />
      ) : null}
    </Details>
  )
}

export default DetailsContainer
