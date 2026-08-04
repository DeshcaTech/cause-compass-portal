import React from 'react'
import { Body, Container, Head, Heading, Hr, Html, Link, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { brand, container, eyebrow, heading, main, mutedText, paragraph } from './shared'

interface Props {
  recipientName?: string
  unsubscribeUrl?: string
  newsUrl?: string
}

const Email = ({ recipientName, unsubscribeUrl, newsUrl }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You are subscribed to CCGMs news updates</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={eyebrow}>CCGMs News</Text>
        <Heading style={heading}>You&apos;re subscribed</Heading>
        <Text style={paragraph}>Hello {recipientName || 'friend'},</Text>
        <Text style={paragraph}>
          Thank you for subscribing to CCGMs news. We&apos;ll email you whenever a new community
          announcement is published — events, membership updates and fundraising news.
        </Text>
        {newsUrl ? (
          <Text style={paragraph}>
            Browse the latest stories any time at{' '}
            <Link href={newsUrl} style={{ color: brand.green }}>
              our news page
            </Link>
            .
          </Text>
        ) : null}
        <Hr style={{ borderColor: brand.border, margin: '24px 0 16px' }} />
        <Text style={mutedText}>
          Changed your mind?
          {unsubscribeUrl ? (
            <>
              {' '}
              <Link href={unsubscribeUrl} style={{ color: brand.green, textDecoration: 'underline' }}>
                Unsubscribe here
              </Link>
              .
            </>
          ) : null}
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'You are subscribed to CCGMs news',
  displayName: 'News subscription confirmed',
  previewData: {
    recipientName: 'Jane Doe',
    newsUrl: 'https://cause-compass-portal.lovable.app/news',
    unsubscribeUrl: 'https://cause-compass-portal.lovable.app/news/unsubscribe?token=demo',
  },
} satisfies TemplateEntry