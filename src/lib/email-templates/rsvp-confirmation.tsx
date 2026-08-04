import React from 'react'
import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { brand, container, eyebrow, heading, main, mutedText, panel, paragraph } from './shared'

interface Props {
  fullName?: string
  eventTitle?: string
  eventDate?: string
  eventLocation?: string
  eventType?: string
  status?: string
  guests?: number
  editUrl?: string
}

const button = {
  backgroundColor: brand.green,
  color: '#ffffff',
  borderRadius: '999px',
  padding: '12px 22px',
  fontSize: '14px',
  textDecoration: 'none',
  display: 'inline-block',
}

const Email = ({
  fullName,
  eventTitle,
  eventDate,
  eventLocation,
  eventType,
  status,
  guests,
  editUrl,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`Your response for ${eventTitle ?? 'a CCGMs event'} is confirmed`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={eyebrow}>CCGMs Events</Text>
        <Heading style={heading}>Thank you{fullName ? `, ${fullName}` : ''}</Heading>
        <Text style={paragraph}>
          We have recorded your response as{' '}
          <strong>{status === 'interested' ? 'Interested' : 'Going'}</strong>
          {guests ? ` with ${guests} extra guest${guests === 1 ? '' : 's'}` : ''}.
        </Text>

        <Container style={panel}>
          <Text style={{ ...paragraph, margin: '0 0 6px', fontWeight: 'bold' }}>{eventTitle}</Text>
          {eventDate ? <Text style={{ ...mutedText, margin: '0 0 4px' }}>{eventDate}</Text> : null}
          {eventLocation ? (
            <Text style={{ ...mutedText, margin: '0 0 4px' }}>{eventLocation}</Text>
          ) : null}
          {eventType ? <Text style={{ ...mutedText, margin: 0 }}>{eventType}</Text> : null}
        </Container>

        {editUrl ? (
          <>
            <Button href={editUrl} style={button}>
              Edit my response
            </Button>
            <Text style={mutedText}>
              Plans changed? Use the link above to update your response or cancel it.
            </Text>
          </>
        ) : null}

        <Text style={mutedText}>We look forward to seeing you there.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `Your RSVP for ${data['eventTitle'] ?? 'a CCGMs event'}`,
  displayName: 'Event RSVP confirmation',
  previewData: {
    fullName: 'Ama Boateng',
    eventTitle: 'Community Summer Picnic',
    eventDate: 'Saturday 12 July 2026, 13:00',
    eventLocation: 'Platt Fields Park, Manchester',
    eventType: 'CCGMs event',
    status: 'going',
    guests: 2,
    editUrl: 'https://cause-compass-portal.lovable.app/rsvp/demo-token',
  },
} satisfies TemplateEntry
