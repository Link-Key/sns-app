import styled from '@emotion/styled/macro'
import { memo } from 'react'
import DiscordIcon from '../../assets/D.png'
import TelegramIcon from '../../assets/tg.png'
import TwitterIcon from '../../assets/t.png'
import GithubIcon from '../../assets/github.png'
import raribleIcon from '../../assets/raribleIcon.png'
import openseIcon from '../../assets/opensea-white.svg'
import mq from 'mediaQuery'

const SocialIconLarge = styled('div')`
  bottom: 50px;
  display: flow;
  margin: 50px auto 20px;
  text-align: center;
  > a {
    img {
      width: 25px;
      margin: 0 15px;
      &:hover {
        transform: scale(1.2);
        transition: 0.2s;
      }
    }
  }
  ${mq.small`
    > a{img{
      width: 30px;
      margin: 0 20px;
    }}
  `}
`

const TwitterUrl = 'https://twitter.com/LinkkeyOfficial'
const TelegramUrl = 'https://t.me/linkkeydao'
const DiscordUrl = 'https://discord.com/invite/UMNRQryyts'
const GithubUrl = 'https://github.com/Link-Key'
const LinkkeyUrl = 'https://linkkey.io'
const OpenseaUrl = 'https://opensea.io/collection/snskey'
const RaribleUrl = 'https://rarible.com/sns2021/items'

const OuterLink = () => {
  return (
    <SocialIconLarge>
      <a href={TwitterUrl} target="_blank">
        <img src={TwitterIcon} alt="twitter" />
      </a>
      <a href={TelegramUrl} target="_blank">
        <img src={TelegramIcon} alt="telegram" />
      </a>
      <a href={DiscordUrl} target="_blank">
        <img src={DiscordIcon} alt="discord" />
      </a>
      <a href={RaribleUrl} target="_blank">
        <img src={raribleIcon} alt="rarible" />
      </a>
      <a href={OpenseaUrl} target="_blank">
        <img src={openseIcon} alt="rarible" />
      </a>
    </SocialIconLarge>
  )
}

export default memo(OuterLink)
