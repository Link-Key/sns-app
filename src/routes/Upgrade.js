import styled from '@emotion/styled'
import { Button, Card, Space, Typography } from 'antd'
import MetaTime from 'components/HomePage/MetaTime'
import OuterLink from 'components/OuterLink'
import { memo } from 'react'

const { Title } = Typography

const CardWrapper = styled(Card)`
  width: 100%;
  border-radius: 14px;
  background-color: #ea6060;
  border: 1px solid #ddd;
`

const Upgrade = () => {
  return (
    <div style={{ textAlign: 'center', width: '100%' }}>
      <CardWrapper>
        <Title>Upgrade Announcement</Title>
        <Typography>
          The program is being upgraded, and the upgrade is expected to be
          completed at [<MetaTime style={{ display: 'inline-block' }} />
          ], please be patient.
        </Typography>

        <Space align="center">
          <OuterLink />
        </Space>
      </CardWrapper>
    </div>
  )
}

export default memo(Upgrade)
