import React, { useEffect, useState } from 'react'
import styled from '@emotion/styled/macro'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DELETE_SUBDOMAIN } from 'graphql/mutations'
import { SingleNameBlockies } from '../Blockies'
import Checkbox from '../Forms/Checkbox'
import mq, { useMediaMin } from 'mediaQuery'
import Tooltip from '../Tooltip/Tooltip'
import DefaultOpenseaLink from 'components/Links/OpenseaLink'
import QuestionMark from '../Icons/QuestionMark'
import { checkIsDecrypted, truncateUndecryptedName } from '../../api/labels'
import ExpiryDate from './ExpiryDate'
import { useMutation } from '@apollo/client'
import Bin from '../Forms/Bin'
import { useEditable } from '../hooks'
import PendingTx from '../PendingTx'
import AddFavourite from '../AddFavourite/AddFavourite'
import axios from 'axios'
import messageMention from 'utils/messageMention'
import { getAirdropData } from '../../api/reqList'
import { Card, Row, Col, Typography, Button, Modal } from 'antd'
import getSNS, { getSNSWithdraw } from 'apollo/mutations/sns'
import { H2, Title } from 'components/Typography/Basic'
import { InfoCircleOutlined } from '@ant-design/icons'
import TooltipAnt from 'utils/tooltipAnt'
import Loading from 'components/Loading/Loading'
import { Trans } from 'react-i18next'
import { handleEmptyValue } from 'utils/utils'
import './ChildDomainItem.css'
import { UnknowErrMsgComponent } from 'components/UnknowErrMsg'

const { Text, Paragraph } = Typography

const ChildDomainItemContainer = styled('div')`
  ${mq.small`
    padding: 30px 0;
  `}
  border-bottom: 1px dashed #d3d3d3;
  &:last-child {
    border: none;
  }
  border-radius: 6px;
`

const DomainLink = styled(Link)`
  width: 100%;
  background-color: ${props => (props.warning ? 'hsla(37,91%,55%,0.1)' : '')};
  color: #2b2b2b;
  font-size: 22px;
  font-weight: 100;

  ${p =>
    !p.showBlockies &&
    mq.small`
        grid-template-columns: 1fr minmax(150px, 450px) 35px 23px;
        grid-template-rows: 50px/3;
      `}

  span {
    align-self: center;
  }

  h5 {
    font-weight: 100;
  }

  h3 {
    display: inherit;
    align-self: center;
    margin: 0;
    font-weight: 100;
    font-size: 28px;
  }

  p {
    grid-row-start: 2;
    margin: 0;
    align-self: center;

    ${mq.small`
      grid-row-start: auto;
    `}
  }
`

const OpenseaLink = styled(DefaultOpenseaLink)`
  min-width: 165px;
  margin-left: auto;
`

const BlockMsgContainer = styled(Card)`
  width: 100%;
  height: 100%;
  min-width: 300px;
  padding: 20px 0 10px 10px;
  border-radius: 14px;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
  color: #2b2b2b;
  :hover {
    box-shadow: rgba(0, 0, 0, 0.3) 0px 5px 10px;
    transition: all 0.5s;
  }
`

const BlockTextWrapper = styled('div')`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-flow: row;
`

const ButtonWrapper = styled(Button)`
  min-width: 100px;
  height: 35px;
  font-weight: 700;
  &:hover {
    box-shadow: 0 10px 21px 0 rgb(161 175 184 / 89%);
    ${p =>
      !p.disabled &&
      `
      border-color: #2c46a6 !important;
      background: #2c46a6 !important;`}
  }
`

const ButtonAndIcon = styled('div')`
  display: flex;
  .ant-btn-round {
    top: 5px;
    height: 35px;
  }
  ${mq.small`
    .ant-btn-round {
      top:0px;
      height: 46px;
      width:130px;
    }
  `}
`

const BlockText = styled(H2)`
  font-size: 15px;
  color: #000;
  text-align: left;
`

const TextContainer = styled(Text)`
  .ant-tooltip-inner {
    background: color;
  }
`

const InfoCircleOutlinedContainer = styled(InfoCircleOutlined)`
  padding: 0 10px;
  font-size: 25px;
  line-height: 60px;
  color: #ea6060;
  &:hover {
    transform: scale(1.1);
  }
`

const DomainLinkContainer = styled(Card)`
  width: 100%;
  height: 100%;
  min-width: 300px;
  padding: 20px 0 10px 10px;
  border-radius: 14px;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
  color: #2b2b2b;
  :hover {
    box-shadow: rgba(0, 0, 0, 0.3) 0px 5px 10px;
    transition: all 0.5s;
  }
`

const WithdrawRuleModal = styled(Modal)`
  .ant-modal-title {
    font-weight: 700;
    text-align: center;
  }
`

export default function ChildDomainItem({
  name,
  owner,
  expiryDate,
  isMigrated,
  isFavourite,
  checkedBoxes,
  setCheckedBoxes,
  setSelectAll,
  showBlockies = true,
  canDeleteSubdomain,
  refetch
}) {
  const { state, actions } = useEditable()
  const { txHash, pending, confirmed } = state
  const { startPending, setConfirmed } = actions
  const [withdrawLoading, setWithdrawLoading] = useState(false)
  const [blockMsgLoading, setBlockMsgLoading] = useState(false)
  const [ruleVisible, setRuleVisible] = useState(false)
  const [blockMsg, setBlockMsg] = useState({
    address: '-',
    keyAmountRound: '-',
    availableAmountRound: '-',
    keyName: '-',
    totalSupply: '-',
    totalFrozenSupply: '-',
    curBlockNumber: '-'
  })
  const [tokenIdState, setTokenId] = useState(() => {
    const sns = getSNS()
    let tokenId = ''
    try {
      sns.getNameOfOwner(address).then(resp => {
        sns.getTokenIdOfName(resp).then(res => {
          tokenId = parseInt(res._hex, 16)
          setTokenId(tokenId)
        })
      })
    } finally {
      return tokenId
    }
  })

  let { t } = useTranslation()
  const smallBP = useMediaMin('small')
  const isDecrypted = checkIsDecrypted(name)
  let label = isDecrypted ? `${name}` : truncateUndecryptedName(name)
  if (isMigrated === false)
    label = label + ` (${t('childDomainItem.notmigrated')})`
  const [mutate] = useMutation(DELETE_SUBDOMAIN, {
    onCompleted: data => {
      if (Object.values(data)[0]) {
        startPending(Object.values(data)[0])
      }
    },
    variables: {
      name: name
    }
  })

  // get block info
  const getBlockMsgFn = () => {
    setBlockMsgLoading(true)
    console.log('blockMsg:', blockMsg)
    console.log('NODE_ENV:', process.env.NODE_ENV)
    axios
      .get(
        `/api/v1/accountService/account/queryAccount?KeyName=${label}&address=${owner}`
      )
      .then(resp => {
        if (resp && resp.data && resp.data.code === 200) {
          setBlockMsg(resp.data.data)
        } else if (resp && resp.data && resp.data.code === 500) {
          messageMention({
            type: 'error',
            content: `${t('serviceMsg.servErr')}`
          })
        } else if (resp && resp.data && resp.data.code === 10001) {
          messageMention({
            type: 'warn',
            content: `${t('serviceMsg.paramsIsNull')}`
          })
        } else {
          messageMention({
            type: 'error',
            content: `${t('serviceMsg.unkonwErr')}`
          })
        }
        setBlockMsgLoading(false)
      })
      .catch(() => {
        messageMention({
          type: 'error',
          content: `${t('serviceMsg.unkonwErr')}`
        })
      })
  }

  // Tips for success after clicking the button
  const withdrawInfoMsgModal = hash => {
    Modal.warning({
      title: (
        <span style={{ color: '#ea6060', fontWeight: '700' }}>
          {' '}
          {t('blockMsg.withdrawTitle')}
        </span>
      ),
      content: (
        <span>
          {t('blockMsg.withdrawDes1')}
          <a
            style={{ fontWeight: '700' }}
            href={`https://polygonscan.com/tx/${hash}`}
            target="_blank"
          >
            {t('c.here')}
          </a>
          {t('blockMsg.withdrawDes2')}
        </span>
      ),
      okText: <span style={{ lineHeight: '26px' }}>OK</span>,
      okButtonProps: {
        shape: 'round',
        danger: true
      },
      width: smallBP ? '500px' : '',
      className: 'NoticeModalBody',
      style: { marginTop: '20vh' }
    })
  }

  // handle call withdraw contract of funciton
  const callWithdraw = () => {
    // setWithdrawLoading(true)

    // get withdraw contract instance
    const withdrawInstance = getSNSWithdraw()

    // call withdraw function
    withdrawInstance
      .withdraw()
      .then(resp => {
        if (resp && resp.hash) {
          // call getBlockMsgFn function refresh block info
          getBlockMsgFn()

          // call success modal info tip
          withdrawInfoMsgModal(resp.hash)

          messageMention({
            type: 'success',
            content: `${t('z.transferSuccess')}`,
            style: { marginTop: '10vh' }
          })
        }

        setWithdrawLoading(false)
      })
      .catch(e => {
        let errorContent = 'error'
        // handle contract response error code
        if (e && e.data && e.data.code && e.data.message) {
          let errorMessages = e.data.message.split('---')
          if (errorMessages.length === 4) {
            // get errorCode
            let errCode = errorMessages[0].split(':')[1].trim()
            errorContent = <Trans i18nKey={`withdrawErrCode.${errCode}`} />
          }
        }
        // handle metamask wallet response error code
        console.log('e:', e.code)
        switch (e.code) {
          case 4001:
            errorContent = (
              <Trans i18nKey={`withdrawErrCode.${e.code.toString()}`} />
            )
            break
          case -32603:
            errorContent = <Trans i18nKey={`withdrawErrCode.001`} />
            break
          default:
            errorContent = <UnknowErrMsgComponent />
        }
        messageMention({
          type: 'error',
          content: errorContent,
          duration: 3,
          style: { marginTop: '10vh' }
        })
        setWithdrawLoading(false)
      })
  }

  useEffect(() => {
    getBlockMsgFn()
    const timer = setInterval(() => {
      getBlockMsgFn()
    }, 1000 * 60)
    return () => {
      clearInterval(timer)
    }
  }, [])

  return (
    <ChildDomainItemContainer>
      {pending && !confirmed ? (
        <PendingTx
          txHash={txHash}
          onConfirmed={() => {
            setConfirmed()
            refetch()
          }}
        />
      ) : (
        <Row gutter={[16, 16]} wrap={true}>
          <Col flex="1 1 400px" hidden>
            <DomainLinkContainer bordered>
              <DomainLink
                showBlockies={showBlockies}
                data-testid={`${name}`}
                warning={isMigrated === false ? true : false}
                key={name}
                to={`/name/${name}`}
              >
                {showBlockies && smallBP && (
                  <SingleNameBlockies imageSize={24} address={owner} />
                )}
                <h3>{label}</h3>
                {canDeleteSubdomain ? (
                  <Bin
                    data-testid={'delete-name'}
                    onClick={e => {
                      e.preventDefault()
                      mutate()
                    }}
                  />
                ) : (
                  <></>
                )}
                {!isDecrypted && (
                  <Tooltip
                    text="<p>This name is only partially decoded. If you know the name, you can search for it in the search bar to decrypt it and renew</p>"
                    position="top"
                    border={true}
                    offset={{ left: 0, top: 10 }}
                  >
                    {({ tooltipElement, showTooltip, hideTooltip }) => {
                      return (
                        <div style={{ position: 'relative' }}>
                          <QuestionMark
                            onMouseOver={() => {
                              showTooltip()
                            }}
                            onMouseLeave={() => {
                              hideTooltip()
                            }}
                          />
                          &nbsp;
                          {tooltipElement}
                        </div>
                      )
                    }}
                  </Tooltip>
                )}
              </DomainLink>
              {tokenIdState ? <OpenseaLink tokenId={tokenIdState} /> : ''}
            </DomainLinkContainer>
          </Col>
          <Col flex="1 1 400px">
            <Loading loading={blockMsgLoading} defaultColor="#ea6060">
              <BlockMsgContainer
                hoverable
                size="default"
                bodyStyle={{ padding: '0 10px' }}
              >
                <BlockTextWrapper>
                  <BlockText>
                    {t('blockMsg.availableAmount')}:
                    {handleEmptyValue(blockMsg.availableAmountRound)}
                  </BlockText>
                  <ButtonAndIcon>
                    <Loading loading={withdrawLoading}>
                      <ButtonWrapper
                        disabled={
                          handleEmptyValue(blockMsg.availableAmountRound) !==
                            '-' && blockMsg.availableAmountRound !== '0'
                            ? false
                            : true
                        }
                        type="primary"
                        shape="round"
                        size="middle"
                        danger
                        onClick={() => {
                          callWithdraw()
                        }}
                      >
                        {t('blockMsg.withdraw')}
                      </ButtonWrapper>
                    </Loading>
                    <TooltipAnt title={t('blockMsg.withdrawRule')}>
                      <InfoCircleOutlinedContainer
                        onClick={() => setRuleVisible(true)}
                      />
                    </TooltipAnt>
                  </ButtonAndIcon>
                </BlockTextWrapper>
                <BlockText>
                  {t('blockMsg.keyAmount')}:
                  <TextContainer
                    ellipsis={true}
                    style={{ backgroundColor: '#fff' }}
                  >
                    {handleEmptyValue(blockMsg.keyAmountRound)}
                  </TextContainer>
                </BlockText>
                <BlockText>
                  {t('blockMsg.totalSupply')}:
                  {handleEmptyValue(blockMsg.totalSupply)}
                </BlockText>
                <BlockText>
                  {t('blockMsg.blockHeight')}:
                  {handleEmptyValue(blockMsg.curBlockNumber)}
                </BlockText>
                <h4 style={{ color: '#ddd' }}>
                  * {t('blockMsg.EstimatedTimeOfAirdrop')}
                </h4>
              </BlockMsgContainer>
            </Loading>
          </Col>
        </Row>
      )}
      <WithdrawRuleModal
        title={t('blockMsg.withdrawRule')}
        visible={ruleVisible}
        onCancel={() => setRuleVisible(false)}
        style={{ top: '20vh' }}
        maskClosable={false}
        className="NoticeModalBody"
        footer={[
          <Button
            onClick={() => setRuleVisible(false)}
            type="primary"
            shape="round"
            danger
          >
            {t('c.gotIt')}
          </Button>
        ]}
      >
        <Paragraph>{t('blockMsg.withdrawRuleContent')}</Paragraph>
        <Paragraph>{t('blockMsg.withdrawRuleContent1')}</Paragraph>
        <Paragraph>{t('blockMsg.withdrawRuleContent2')}</Paragraph>
        <Paragraph>{t('blockMsg.withdrawRuleContent3')}</Paragraph>
      </WithdrawRuleModal>
    </ChildDomainItemContainer>
  )
}
