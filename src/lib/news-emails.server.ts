const SITE_URL = 'https://cause-compass-portal.lovable.app'

export function baseUrl() {
  return process.env['PUBLIC_SITE_URL'] || SITE_URL
}

export async function sendUnsubscribeConfirmation(row: {
  email: string
  full_name: string | null
  unsubscribe_token: string
}) {
  try {
    const { sendTemplateEmail } = await import('./email-templates/send-email')
    await sendTemplateEmail('news-unsubscribed', row.email, {
      templateData: {
        recipientName: row.full_name ?? undefined,
        resubscribeUrl: `${baseUrl()}/news/unsubscribe?token=${row.unsubscribe_token}&action=resubscribe`,
      },
      idempotencyKey: `news-unsub-${row.unsubscribe_token}-${Date.now()}`,
    })
  } catch (err) {
    console.error('Unsubscribe confirmation email failed', err)
  }
}

