import React from 'react'
import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { brand, container, eyebrow, heading, main, mutedText, panel, paragraph } from './shared'

interface Props {
  eventTitle?: string
  eventDate?: string
  eventLocation?: string
  reportUrl?: string
  going?: number
  interested?: number
  attendees?: number
  newToday?: number
  reportDate?: string
  whatsappUrl?: string
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
  eventTitle,
  eventDate,
  eventLocation,
  reportUrl,
  going = 0,
  interested = 0,
  attendees = 0,
  newToday = 0,
  reportDate,
  whatsappUrl,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`Daily RSVP status for ${eventTitle ?? 'your event'}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={eyebrow}>CCGMs Events</Text>
        <Heading style={heading}>Daily RSVP status</Heading>
        <Text style={paragraph}>
          Here is the RSVP status for <strong>{eventTitle}</strong>
          {reportDate ? ` as of ${reportDate}` : ''}.
        </Text>

        <Container style={panel}>
          {eventDate ? <Text style={{ ...mutedText, margin: '0 0 4px' }}>{eventDate}</Text> : null}
          {eventLocation ? (
            <Text style={{ ...mutedText, margin: '0 0 10px' }}>{eventLocation}</Text>
          ) : null}
          <Text style={{ ...paragraph, margin: '0 0 4px' }}>Going: <strong>{going}</strong></Text>
          <Text style={{ ...paragraph, margin: '0 0 4px' }}>Interested: <strong>{interested}</strong></Text>
          <Text style={{ ...paragraph, margin: '0 0 4px' }}>Expected attendees: <strong>{attendees}</strong></Text>
          <Text style={{ ...paragraph, margin: 0 }}>New in the last 24 hours: <strong>{newToday}</strong></Text>
        </Container>

        {reportUrl ? (
          <>
            <Text style={paragraph}>
              Open the full list and download the PDF export (with an optional cover sheet):
            </Text>
            <Button href={reportUrl} style={button}>
              Open RSVP report &amp; PDF
            </Button>
          </>
        ) : null}

        {whatsappUrl ? (
          <Text style={paragraph}>
            <Link href={whatsappUrl}>Send this summary on WhatsApp</Link> to the event contact
            number.
          </Text>
        ) : null}

        <Text style={mutedText}>You receive this because you are the contact for this event.</Text>
      </Container>
    </Body>
  </Html>
)

export const template: TemplateEntry = {
  component: Email,
  displayName: 'Daily RSVP status',
  subject: (data) => `Daily RSVP status — ${data['eventTitle'] ?? 'CCGMs event'}`,
  previewData: {
    eventTitle: 'Community Gala',
    eventDate: 'Saturday, 12 September 2026, 18:00',
    eventLocation: 'Manchester Town Hall',
    reportUrl: 'https://example.com/rsvp-report/1?k=abc',
    going: 42,
    interested: 11,
    attendees: 67,
    newToday: 5,
    reportDate: '4 August 2026',
  },
}