import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import styled from '@emotion/styled/macro'
import shareImg from '../assets/share/shareImg.png'
import searchImg from '../assets/share/ShareSearch.png'
import LogoJPG from '../assets/share/logo.png'
import DiscordIcon from '../assets/D.png'
import TelegramIcon from '../assets/tg.png'
import TwitterIcon from '../assets/t.png'
import Loading from 'components/Loading/Loading'
import { useTranslation } from 'react-i18next'
import html2canvas from 'html2canvas'
import QRCode from 'qrcode.react'
import { Modal } from 'antd'
import 'antd/es/modal/style/css'

const Share = styled('div')`
  position: relative;
  display: block;
  width: 350px;
  margin: 0 auto;
  background-color: #ea6060;
  border: 1px solid white;
`

const ShareImg = styled('img')`
  position: absolute;
  ${p => (p.smallBP ? `top:10px;` : `top:-45px;`)}
  right:15px;
  width: 25px;
  height: 25px;
  cursor: pointer;
  &:active {
    transform: scale(1.1);
    color: #dfdfdf;
    transition: all 1s;
  }
  z-index: 999999999;
`

const ShareTextContainer = styled('div')`
  height: 150px;
  text-align: center;
  background-color: #3d3a39;
`

const ShareTitle = styled('div')`
  font-family: Impact;
  font-weight: 800;
  font-size: 70px;
  line-height: 75px;
  letter-spacing: 5px;
  color: #fff;
  padding-top: 30px;
`

const ShareSubTitle = styled('div')`
  font-family: Impact;
  font-weight: 800;
  font-size: 30px;
  color: #fff;
`

const ShareLogoDesContainer = styled('div')`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-bottom: 30px;
`

const LogoWrapper = styled('div')`
  display: flex;
  justify-content: center;
  margin-top: 20px;
  img {
    height: 90px;
  }
`

const ShareDes = styled('div')`
  font-family: Impact;
  font-weight: 600;
  font-size: 24px;
  color: #f7f8f8;
`

const WhiteContainer = styled('div')`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  min-height: 100px;
  gap: 20px;
  background-color: white;
`

const QRCodeItem = styled(QRCode)`
  border-radius: 8px;
  margin-left: 20px;
`
const ShareKeyItem = styled('div')`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
`

const ShareKeyName = styled('div')`
  display: flex;
  align-items: center;
  div {
    font-family: sans-serif;
    font-size: 19px;
    font-weight: 700;
    border: 1px solid black;
    padding: 5px 20px;
    border-radius: 3px;
    word-break: break-all;
  }
`

const SearchIcon = styled('img')`
  width: 38px;
  height: 38px;
  margin-left: 5px;
  margin-top: -4px;
  backgroud-color: #ea6060;
`

const SharePolygonImg = styled('img')`
  height: 15px;
  margin: 0 auto;
`

const ShareFooter = styled('div')`
  display: flex;
  bottom: 0;
  height: 37px;
  background-color: #3e3a39;
  justify-content: space-around;
`

const ShareItem = styled('div')`
  color: #fff;
  text-align: center;
  font-size: 13px;
  line-height: 40px;
  font-weight: 1000;
  text-align: center;
  img {
    color: #fff;
    width: 14px;
    height: 14px;
    margin-right: 5px;
  }
`

const ModalTitle = styled('div')`
  text-align: center;
`

function SharedContainer(props) {
  const { smallBP } = props
  const domain = JSON.parse(window.localStorage.getItem('domain'))
  const [modalVisible, setModalVisible] = useState(false)
  const [modalLoading, setModalLoading] = useState(true)
  const [imageState, setImageState] = useState(
    <Loading loading={modalLoading} size="large">
      <img width="100%" height="300px" />
    </Loading>
  )
  const history = useHistory()
  const hostName = window.location.host
  const protocol = window.location.protocol
  const { t } = useTranslation()

  const sharedImg = () => {
    setModalLoading(true)
    let detailElement = document.getElementById('share')
    html2canvas(detailElement, {
      allowTaint: false,
      useCORS: true
    }).then(function(canvas) {
      // toImage
      const dataImg = new Image()
      dataImg.src = canvas.toDataURL('image/png')
      setImageState(<img width="100%" src={dataImg.src} />)
      if (!smallBP) {
        setModalVisible(true)
      } else {
        const alink = document.createElement('a')
        alink.href = dataImg.src
        alink.download = `${domain.name}.png`
        alink.click()
      }
    })
    setModalLoading(false)
  }

  useEffect(() => {
    let headerElement = document.getElementsByTagName('header')[0]
    let formElement = document.getElementsByTagName('form')[0]
    if (!smallBP) {
      headerElement.style.display = 'none'
      formElement.style.display = 'none'
    }
    if (!domain) {
      headerElement.style.display = 'flex'
      formElement.style.display = 'flex'
      history.push(`/`)
    }
  }, [])

  return (
    <Share id="share">
      <ShareImg
        src={shareImg}
        smallBP={smallBP}
        onClick={() => {
          sharedImg()
        }}
      />
      <ShareTextContainer>
        <ShareTitle>W.E.B.3</ShareTitle>
        <ShareSubTitle>DID CARD</ShareSubTitle>
      </ShareTextContainer>
      <ShareLogoDesContainer>
        <img style={{ height: '150px', paddingTop: '20px' }} src={LogoJPG} />
        <span
          style={{
            fontWeight: 600,
            fontSize: '18px',
            color: 'white',
            marginTop: '10px'
          }}
        >
          BUILD SOCIAL CIRCLE ON WEB3
        </span>
        <span
          style={{
            fontWeight: 500,
            fontSize: '13px',
            color: 'white'
            // marginTop: '10px'
          }}
        >
          www.linkkey.io
        </span>
      </ShareLogoDesContainer>
      <WhiteContainer>
        <QRCodeItem
          value={`${protocol}//${hostName}/name/${domain.name}/details`}
          size={70}
          fgColor="#ea6060"
          iconRadius={10}
        />
        <ShareKeyItem>
          <ShareKeyName>
            <div>{domain.name}</div>
            <SearchIcon src={searchImg} />
          </ShareKeyName>
          <span>www.sns.chat</span>
        </ShareKeyItem>
      </WhiteContainer>
      <ShareFooter>
        <ShareItem>
          <img src={DiscordIcon} />
          linkkey.io
        </ShareItem>
        <ShareItem>
          <img src={TelegramIcon} />
          @linkkeydao
        </ShareItem>
        <ShareItem>
          <img src={TwitterIcon} />
          @LinkkeyOfficial
        </ShareItem>
      </ShareFooter>
      <Modal
        title={<ModalTitle>{t('c.pressSaveImg')}</ModalTitle>}
        width="80%"
        visible={modalVisible}
        centered
        footer={null}
        bodyStyle={{ padding: '0px' }}
        onCancel={() => {
          setModalVisible(false)
          setModalLoading(false)
        }}
      >
        {imageState}
      </Modal>
    </Share>
  )
}

export default SharedContainer
