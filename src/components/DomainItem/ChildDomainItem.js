import React, { useEffect, useState } from 'react'
import styled from '@emotion/styled/macro'
import { useTranslation } from 'react-i18next'
import { DELETE_SUBDOMAIN } from 'graphql/mutations'
import mq, { useMediaMin } from 'mediaQuery'
import { checkIsDecrypted, truncateUndecryptedName } from '../../api/labels'
import { useMutation, useQuery } from '@apollo/client'
import { useEditable } from '../hooks'
import PendingTx from '../PendingTx'
import axios from 'axios'
import messageMention from 'utils/messageMention'
import { Card, Row, Col, Typography, Button, Modal, List } from 'antd'
import getSNS, {
  getSNSAddress,
  getSNSInvite,
  getSNSWithdraw,
  getSNSIERC20
} from 'apollo/mutations/sns'
import { H2 } from 'components/Typography/Basic'
import { InfoCircleOutlined } from '@ant-design/icons'
import TooltipAnt from 'utils/tooltipAnt'
import Loading from 'components/Loading/Loading'
import { Trans } from 'react-i18next'
import { handleEmptyValue } from 'utils/utils'
import './ChildDomainItem.css'
import { UnknowErrMsgComponent } from 'components/UnknowErrMsg'
import { useCallback } from 'react'
import { gql } from '@apollo/client'

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
  max-width: 100px !important;
  height: 35px !important;
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
  align-items: center;
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
  color: #ea6060;
  &:hover {
    transform: scale(1.1);
  }
`

const InviteContainer = styled(Card)`
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

  .ant-card-body {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .title {
    margin: 0 auto;
    font-size: 20px;
    font-weight: 400;
    color: #000;
    margin-bottom: 15px;
  }

  button {
    margin: 0 auto;
  }
`

const ModalWrapper = styled(Modal)`
  .ant-modal-title {
    font-weight: 700;
    text-align: center;
  }
`

const SEARCH_QUERY = gql`
  query searchQuery {
    isENSReady @client
  }
`

export default function ChildDomainItem({ name, owner, isMigrated, refetch }) {
  const { state, actions } = useEditable()
  const { txHash, pending, confirmed } = state
  const { startPending, setConfirmed } = actions
  const [withdrawLoading, setWithdrawLoading] = useState(false)
  const [blockMsgLoading, setBlockMsgLoading] = useState(false)
  const [ruleVisible, setRuleVisible] = useState(false)
  const [inviteVisible, setInviteVisible] = useState(false)
  const [blockMsg, setBlockMsg] = useState({
    address: '-',
    keyAmountRound: '-',
    availableAmountRound: '-',
    keyName: '-',
    totalSupply: '-',
    totalFrozenSupply: '-',
    curBlockNumber: '-'
  })

  const {
    data: { isENSReady }
  } = useQuery(SEARCH_QUERY)

  const [isInvite, setInvite] = useState(false)

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

  const handleInvite = async () => {
    if (isInvite) {
      setInviteVisible(true)
    }
    // get inviter instance obj
    const inviterInstance = await getSNSInvite()

    // get become inviter price
    const inviterPrice = await inviterInstance.getApplyInviterPrice()
    console.log('inviterPrice:', inviterPrice)

    //get inviter contract address
    const inviterAdd = '0xC4FD81B29BD4EE39E232622867D4864ad503aC4a'
    const IERC20 = await getSNSIERC20(inviterAdd)
    console.log('IERC20:', IERC20)

    // get sns address
    const snsAddress = await getSNSAddress()
    console.log('snsAddress:', snsAddress)

    // Authorization to SNS
    await IERC20.approve(inviterAdd, inviterPrice)

    // setInvite(!isInvite)
  }

  const handleIsInviter = useCallback(async () => {
    const inviteInstance = await getSNSInvite()
    let inviter = false
    if (inviteInstance) {
      inviter = await inviteInstance.isInviter()
    }
    setInvite(inviter)
  }, [])

  useEffect(() => {
    getBlockMsgFn()
    const timer = setInterval(() => {
      getBlockMsgFn()
    }, 1000 * 60)
    return () => {
      clearInterval(timer)
    }
  }, [])

  useEffect(() => {
    if (isENSReady) {
      handleIsInviter()
    }
  }, [isENSReady])
  console.log('isInvite:', isInvite)

  const data = [
    {
      title: 'Title 1'
    },
    {
      title: 'Title 2'
    },
    {
      title: 'Title 3'
    },
    {
      title: 'Title 4'
    },
    {
      title: 'Title 4'
    },
    {
      title: 'Title 4'
    },
    {
      title: 'Title 4'
    },
    {
      title: 'Title 4'
    }
  ]

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
                        size="small"
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

          <Col flex="1 1 400px">
            <InviteContainer bodyStyle={{ padding: '0 10px' }}>
              <BlockText>邀请人总收益(KEY):</BlockText>
              <BlockText>邀请次数:</BlockText>
              <ButtonWrapper
                danger
                shape="round"
                type="primary"
                onClick={handleInvite}
              >
                {isInvite ? '邀请列表' : '成为邀请人'}
              </ButtonWrapper>
            </InviteContainer>
          </Col>
        </Row>
      )}
      <ModalWrapper
        title={t('blockMsg.withdrawRule')}
        visible={ruleVisible}
        onCancel={() => setRuleVisible(false)}
        style={{ top: '20vh' }}
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
      </ModalWrapper>
      <ModalWrapper
        title="邀请人列表"
        visible={inviteVisible}
        onCancel={() => setInviteVisible(false)}
        style={{ top: '20vh' }}
        bodyStyle={{
          height: '400px',
          overflow: 'auto'
        }}
        className="NoticeModalBody"
        footer={null}
      >
        <List
          grid={{ gutter: 16, column: 1 }}
          dataSource={data}
          renderItem={item => (
            <List.Item>
              <Card style={{ borderRadius: '16px' }}>
                <div>交易哈希</div>
                <div>交易时间</div>
                <div>返佣金额</div>
                <Button danger shape="round" block>
                  交易详情
                </Button>
              </Card>
            </List.Item>
          )}
        />
      </ModalWrapper>
    </ChildDomainItemContainer>
  )
}
