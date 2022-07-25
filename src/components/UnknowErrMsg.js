import { Trans } from 'react-i18next'
export function UnknowErrMsgComponent() {
  return (
    <>
      <Trans i18nKey={`serviceMsg.unkonwErr`} />,
      <Trans i18nKey={`serviceMsg.feedback`} />
      <a target="_blank" href="https://discord.com/invite/UMNRQryyts">
        Discord
      </a>
      <Trans i18nKey={`serviceMsg.feedback1`} />
    </>
  )
}

export function TransactionBusy() {
  return <Trans i18nKey={`z.transferBusy`} />
}
