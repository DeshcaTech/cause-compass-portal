import React from 'react'
import { Body, Button, Container, Head, Heading, Hr, Html, Img, Link, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { brand, container, eyebrow, heading, main, mutedText, paragraph } from './shared'

interface Props {
  recipientName?: string
  title?: string
  summary?: string
  body?: string
  imageUrl?: string
  url?: string
  publishedAt?: string
  unsubscribeUrl?: string
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

const Email = ({ recipientName, title, summary, body, imageUrl, url, publishedAt, unsubscribeUrl }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{summary || title || 'New from the CCGMs noticeboard'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={eyebrow}>CCGMs News{publishedAt ? ` · ${publishedAt}` : ''}</Text>
        <Text style={paragraph}>Hello {recipientName || 'friend'},</Text>
        <Heading style={heading}>{title || 'A new community announcement'}</Heading>
        {imageUrl ? (
          <Img
            src={imageUrl}
            alt={title || 'News image'}
            width="504"
            style={{ borderRadius: '12px', margin: '0 0 16px', width: '100%' }}
          />
        ) : null}
        {summary ? <Text style={paragraph}>{summary}</Text> : null}
        {body ? <Text style={paragraph}>{body.slice(0, 600)}{body.length > 600 ? '…' : ''}</Text> : null}
        {url ? (
          <Text style={{ margin: '20px 0' }}>
            <Button href={url} style={button}>Read the full story</Button>
          </Text>
        ) : null}
        <Hr style={{ borderColor: brand.border, margin: '24px 0 16px' }} />
        <Text style={mutedText}>
          {recipientName ? `${recipientName}, you` : 'You'} are receiving this because you subscribed
          to CCGMs news updates.
          {unsubscribeUrl ? (
            <>
              {' '}
              <Link href={unsubscribeUrl} style={{ color: brand.green, textDecoration: 'underline' }}>
                Unsubscribe
              </Link>{' '}
              at any time.
            </>
          ) : null}
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) => `CCGMs news: ${data['title'] ?? 'New announcement'}`,
  displayName: 'News announcement',
  previewData: {
    recipientName: 'Jane Doe',
    title: 'CCGMs Annual General Meeting 2026',
    summary: 'Join us as we review the year and elect the new board team.',
    body: 'All members are warmly invited to the Annual General Meeting.',
    url: 'https://cause-compass-portal.lovable.app/news',
    publishedAt: '2 August 2026',
    unsubscribeUrl: 'https://cause-compass-portal.lovable.app/news/unsubscribe?token=demo',
  },
} satisfies TemplateEntry
