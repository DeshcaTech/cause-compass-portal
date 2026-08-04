import React from 'react'
import { Body, Container, Head, Heading, Html, Preview, Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { brand, container, eyebrow, heading, main, mutedText, paragraph } from './shared'

interface Props {
  eventTitle?: string
  eventDate?: string
  eventLocation?: string
  reportDate?: string
  totalResponses?: number
  going?: number
  interested?: number
  expectedAttendees?: number
  newToday?: number
  csv?: string
}

const stat = {
  border: `1px solid ${brand.border}`,
  borderRadius: '12px',
  padding: '12px 14px',
  margin: '0 0 8px',
}

const csvBlock = {
  fontFamily: 'Menlo, Consolas, monospace',
  fontSize: '11px',
  lineHeight: '1.5',
  whiteSpace: 'pre-wrap' as const,
  wordBreak: 'break-all' as const,
  backgroundColor: '#f6f8f6',
  border: `1px solid ${brand.border}`,
  borderRadius: '12px',
  padding: '14px',
  margin: '16px 0 0',
}

const Email = ({
  eventTitle,
  eventDate,
  eventLocation,
  reportDate,
  totalResponses = 0,
  going = 0,
  interested = 0,
  expectedAttendees = 0,
  newToday = 0,
  csv,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`Daily RSVP report — ${eventTitle ?? 'CCGMs event'}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={eyebrow}>CCGMs Events</Text>
        <Heading style={heading}>Daily RSVP report</Heading>
        <Text style={paragraph}>
          <strong>{eventTitle}</strong>
          {eventDate ? ` — ${eventDate}` : ''}
          {eventLocation ? ` — ${eventLocation}` : ''}
        </Text>
        {reportDate ? <Text style={mutedText}>Status as of {reportDate}</Text> : null}

        <Section>
          <Text style={stat}>Total responses: <strong>{totalResponses}</strong></Text>
          <Text style={stat}>Going: <strong>{going}</strong></Text>
          <Text style={stat}>Interested: <strong>{interested}</strong></Text>
          <Text style={stat}>Expected attendees (incl. guests): <strong>{expectedAttendees}</strong></Text>
          <Text style={stat}>New in the last 24 hours: <strong>{newToday}</strong></Text>
        </Section>

        <Text style={{ ...paragraph, marginTop: '18px' }}>
          Full CSV export below — copy it into a file named report.csv to open it in Excel or Google
          Sheets.
        </Text>
        <Text style={csvBlock}>{csv}</Text>

        <Text style={mutedText}>
          This report is sent once a day while the event is still upcoming.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `Daily RSVP report — ${data['eventTitle'] ?? 'CCGMs event'}`,
  displayName: 'Daily RSVP report (event contact)',
  previewData: {
    eventTitle: 'Community Summer Picnic',
    eventDate: 'Saturday 12 July 2026, 13:00',
    eventLocation: 'Platt Fields Park, Manchester',
    reportDate: '4 August 2026',
    totalResponses: 24,
    going: 18,
    interested: 6,
    expectedAttendees: 31,
    newToday: 3,
    csv: 'Name,Email,Phone,Membership,Response,Extra guests,Submitted\n"Ama Boateng","ama@example.com","07123456789","CCGM-001","going","2","03/08/2026, 19:12"',
  },
} satisfies TemplateEntry
