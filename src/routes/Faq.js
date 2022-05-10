import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styled from '@emotion/styled/macro'
import mq from 'mediaQuery'

import { H2 as DefaultH2, Title } from '../components/Typography/Basic'
import Anchor from '../components/Icons/Anchor'
import slugify from 'slugify'
const H2 = styled(DefaultH2)`
  margin-top: 50px;
  margin-left: 20px;
  color: black;
  ${mq.medium`
    margin-left: 0;
  `}
`

const Question = styled('h3')`
  font-size: 15px;
  margin-right: 0.5em;
  display: inline;
`

const Answer = styled('p')``

const AnchorContainer = styled('a')``

const ImageContainer = styled('div')`
  margin: 2em;
`

const ReverseRecordImage = styled('img')`
  width: 100%;
  ${mq.medium`
    width: 600px;
  `}
`

const Section = ({ question, children }) => {
  let slug
  if (question) {
    slug = slugify(question, {
      lower: true
    })
  }
  return (
    <>
      <Question id={slug}>{question}</Question>
      <AnchorContainer href={`#${slug}`}>
        <Anchor />
      </AnchorContainer>

      <Answer>{children}</Answer>
    </>
  )
}

function Faq() {
  const { t } = useTranslation()
  useEffect(() => {
    document.title = 'SNS Faq'
  }, [])

  return (
    <>
      {/*<NonMainPageBannerContainer>*/}
      {/*  <DAOBannerContent />*/}
      {/*</NonMainPageBannerContainer>*/}
      <FaqContainer>
        <Title>FAQ</Title>
        <H2>Before You register</H2>
        <Section question="Is SNS only for storing an Polygon address?">
          No, you can store the addresses of other blockchains, a content hash
          of a decentralized website, profile information such as an avatar and
          Twitter handle, and more.
        </Section>

        <Section question="Can I use an SNS name to point to my website?">
          Though SNS can technically store anything, there aren't many third
          party tools and applications which resolve IP addresses attached to
          SNS.
          <br />
          Instead, we suggest hosting your static html/css/images on IPFS and
          put the hash in your SNS name's Content record. Then it can be
          resolved by SNS-aware browsers (e.g. Opera), browser extSNSions
          (Metamask), or any browser with ".link" or ".limo" appended to the end
          (e.g. matoken.eth.link or matoken.eth.limo).
          <br />
        </Section>

        <Section question="What is the maximum length of a name I can register?">
          You can only register the name length greater than or equal to 4.
        </Section>

        <Section question="Can you have names with emojis?">Yes.</Section>

        <Section question="How much does it cost to register a .sns name?">
          Currently, registration costs are set at the following prices: We are
          open for free registration for 3 days, as long as you fill in the
          whitelisted address in advance, you can register for free. If you do
          not fill in the whitelist, you need to charge 1matic/SNS, if you
          exceed 10,000, you need 10matic/SNS
        </Section>

        <Section question="How does SNS issue key tokens when registering a name??">
          Let’s start with a common example-transfer, transfer a sum of money
          from one account to another. This simple business actually has two
          steps in the procedure. Assuming that from A to B, then in the
          procedure It is necessary to subtract the transfer amount from A's
          account, and add the transfer amount to B's account. To ensure that
          the amount of the account is not wrong, it is necessary to ensure that
          these two steps happen together. As long as there is a problem in one
          step, the other step will fail. One cannot fail and succeed. This will
          lead to account errors. . So there is the concept of transaction in
          the program, that is, the program in a transaction either succeeds at
          the same time or fails at the same time. In SNS, we just take
          advantage of the characteristics of smart contracts in execution-the
          contract execution succeeds in modifying the state, and the contract
          execution failed state remains unchanged. The two steps of registering
          name and issuing key tokens are executed in one method of the smart
          contract, which guarantees that the registered name will be issued
          successfully and the key token will be issued. If the key token
          issuance fails, then the registered name will not succeed. . This
          ensures that the successful SNS registration name will issue key
          tokens.
        </Section>

        <H2>When you register</H2>

        <Section question="At step 1, the transaction was slow so I speeded up">
          Our app cannot currently detect that you sped up the transaction.
          Please refresh the page and start from step 1 again.
        </Section>

        <Section question="What exactly did I do when I registered the name? Can the generated NFT be displayed directly in opensea?">
          When a user registers an SNS name, the system first checks whether the
          SNS name is registered, and whether the user address is currently
          bound to an SNS name, because the SNS system restricts an address to
          only one SNS name, and an SNS name can only be registered Once; after
          that, the system will call the free registration expiration time in
          the SNS contract and the total number of registrations, and determine
          the price required to register the address at this time according to
          the SNS rules. The wallet will initiate a contract transaction with
          value as the price, and the user balance needs to be greater than
          Equal to value + gas price. The contract internally binds the SNS name
          with the user address, and sets the default resolver for the SNS name.
          At the same time, an SNS NFT is generated. The owner address of the
          NFT is the address of the user who initiated the transaction. The
          generated NFT cannot be displayed immediately on opensea. The SNS
          system needs a period of time to generate a corresponding NFT image
          for each SNS name and upload it to IPFS. The whole process is done
          automatically by the system, users only need to wait for a while, and
          it will be automatically displayed on the corresponding NFT collection
          of opensea
        </Section>

        <Section question="I cannot see the names I registered on Raible nor on my wallet">
          This occasionally happens when Raible is under a heavy load. You may
          also not find your name under the NFT section of your wallet, as many
          wallets fetch metadata from Raible.
          <br />
          As long as you can see your registered name under "My Account" on our
          site or your ETH address under the name section, your name is
          registered successfully.
        </Section>

        <H2>After you register</H2>

        <Section question="What is a Resolver?">
          A Resolver is a smart contract that holds records. Names are set by
          default to the Public Resolver managed by the SNS team and has all the
          standard SNS record types. You can set your Resolver to a custom
          resolver contract if you,d like.
        </Section>

        <Section question="How does SNS realize the binding of name and address? What other attributes can be added besides the binding address? Can it be modified?">
          In smart contracts, there is a data structure called struct, which is
          a bit similar to the concept of class in java language. We design a
          struct called Record in the contract. Record has two attributes of
          address data type, one is to record the user The resolver that binds
          the data, one is the owner of the recorded data. At the same time, we
          use mapping to maintain a set of key-value relationships, and bind
          name to Record one-to-one. Therefore, the binding between name and
          owner is the only record corresponding to name, and there is only
          owner in the only record. We also performed reverse binding, using
          mapping, address as Key, and name as Value. These two sets of
          relationships will be generated at the same time when users register
          for SNS. We record all the attributes that users can currently bind in
          Resolver.sol. The currently supported attributes include ETH, BTC,
          LTC, DOGE address, IPFS link, Email, avatar, url external link,
          description introduction, notice announcement , Keywords tags,
          personal account information comGithub, comReddit, comTwitter
          orgTelegram. These records can be arbitrarily modified by the owner.
          Of course, if you are a developer and you want to implement some
          custom content, you can deploy a contract that implements the Resolver
          interface as your own private data parser.
        </Section>

        <Section question="How do I transfer my name?">
          For a ".key" name, transfer both the Registrant and the Controller to
          the new Ethereum account. Since ".key" names are ERC721 compliant
          NFTs, you can change the Registrant by simply transferring the NFT
          from any NFT compliant wallet/marketplace as well.
          <br />
          Note that transferring the ownership (aka the Registrant) of the name
          does not change the controller nor records, so the recipient may need
          to update them once received. If the recipient is not experienced or
          you prefer your address not to be associated to the transferring
          names, it may be a good idea for you to set the ETH Address record to
          their Ethereum address, set the controller, then transfer the name.
          <br />
        </Section>
      </FaqContainer>
    </>
  )
}

const FaqContainer = styled('div')`
  margin: 1em;
  padding: 20px 40px;
  background-color: white;
  border-radius: 6px;
`

export default Faq
