import React from 'react'
import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { brand, container, eyebrow, heading, main, mutedText, paragraph } from './shared'

interface Props {
  recipientName?: string
  resubscribeUrl?: string
}

const button = {
  backgroundColor: brand.green,
  color: '#ffffff',
  borderRadius: '10px',
  padding: '12px 22px',
  fontSize: '14px',
  fontWeight: 600,
  textDecoration: 'none',
  display: 'inline-block',
}

const Email = ({ recipientName, resubscribeUrl }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You have been unsubscribed from CCGMs news updates</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={eyebrow}>CCGMs News</Text>
        <Heading style={heading}>You&apos;ve been unsubscribed</Heading>
        <Text style={paragraph}>Hello {recipientName || 'friend'},</Text>
        <Text style={paragraph}>
          You will no longer receive CCGMs news and announcement emails. We&apos;re sorry to see you
          go — you are always welcome back.
        </Text>
        {resubscribeUrl ? (
          <Text style={{ margin: '20px 0' }}>
            <Button href={resubscribeUrl} style={button}>
              Re-enable news emails
            </Button>
          </Text>
        ) : null}
        <Hr style={{ borderColor: brand.border, margin: '24px 0 16px' }} />
        <Text style={mutedText}>
          If you didn&apos;t request this change, use the button above to turn notifications back on.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'You have unsubscribed from CCGMs news',
  displayName: 'News unsubscribe confirmed',
  previewData: {
    recipientName: 'Jane Doe',
    resubscribeUrl: 'https://cause-compass-portal.lovable.app/news/unsubscribe?token=demo&action=resubscribe',
  },
} satisfies TemplateEntry