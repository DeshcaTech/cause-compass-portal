import React from 'react'
import { Body, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { container, eyebrow, heading, main, mutedText, paragraph } from './shared'

interface Props {
  donorName?: string
  campaignTitle?: string
  raised?: string
  goal?: string
  note?: string
}

const Email = ({ donorName, campaignTitle, raised, goal, note }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`Final update on ${campaignTitle ?? 'our campaign'}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={eyebrow}>CCGMs Fundraising</Text>
        <Heading style={heading}>{campaignTitle ?? 'Campaign update'}</Heading>
        <Text style={paragraph}>Dear {donorName || 'friend'},</Text>
        <Text style={paragraph}>
          This campaign has now closed. Thanks to supporters like you we raised{' '}
          <strong>{raised}</strong>
          {goal ? <> of a {goal} goal</> : null}.
        </Text>
        {note ? <Text style={paragraph}>{note}</Text> : null}
        <Text style={mutedText}>Thank you for standing with the community.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `Final update — ${data['campaignTitle'] ?? 'CCGMs campaign'}`,
  displayName: 'Campaign final status',
  previewData: {
    donorName: 'Ada Nkeng',
    campaignTitle: 'Community Hall Fund',
    raised: '£12,400',
    goal: '£15,000',
    note: 'Works begin next month.',
  },
} satisfies TemplateEntry