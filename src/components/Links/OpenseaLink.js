import React from 'react'
import styled from '@emotion/styled/macro'
import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client'

const OpenseaLinkContainer = styled('a')`
  display: inline-block;
  align-items: center;
  text-overflow: ellipsis;

  svg {
    margin-left: 10px;
    transition: 0.1s;
    opacity: 0;
    flex-shrink: 0;
  }

  &:hover {
    svg {
      opacity: 1;
    }
  }
`

export const GET_OPENSEA_LINK = gql`
  query getOpenseaLink @client {
    network
  }
`

const OpenseaLink = ({ children, className, tokenId }) => {
  const {
    data: { network }
  } = useQuery(GET_OPENSEA_LINK)
  const subdomain = network?.toLowerCase() === 'main' ? '' : `${network}.`

  return (
    <OpenseaLinkContainer
      data-testid="ether-scan-link-container"
      target="_blank"
      rel="noopener"
      href={`https://rarible.com/token/polygon/0x19ad2b1f012349645c3173ea63f98948a2b43d27:${tokenId}?tab=details`}
      className={className}
    >
      {children}
      {/*<ExternalLinkIcon />*/}
    </OpenseaLinkContainer>
  )
}

export default OpenseaLink
