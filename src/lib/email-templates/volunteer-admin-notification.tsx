import React from 'react'
import { Body, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { container, eyebrow, heading, main, mutedText, paragraph } from './shared'

interface Props {
  fullName?: string
  email?: string
  phone?: string
  membershipNumber?: string
  areas?: string[]
  availability?: string
  message?: string
}

const Email = ({
  fullName,
  email,
  phone,
  membershipNumber,
  areas,
  availability,
  message,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New volunteer application to review</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={eyebrow}>CCGMs Volunteering</Text>
        <Heading style={heading}>New volunteer application</Heading>
        <Text style={paragraph}>
          <strong>{fullName || 'A community member'}</strong> has offered to volunteer. Review the
          details below and follow up when you can.
        </Text>
        {email ? (
          <Text style={paragraph}>
            Email: <strong>{email}</strong>
          </Text>
        ) : null}
        {phone ? (
          <Text style={paragraph}>
            Phone: <strong>{phone}</strong>
          </Text>
        ) : null}
        {membershipNumber ? (
          <Text style={paragraph}>
            Membership number: <strong>{membershipNumber}</strong>
          </Text>
        ) : null}
        {areas && areas.length > 0 ? (
          <Text style={paragraph}>
            Areas: <strong>{areas.join(', ')}</strong>
          </Text>
        ) : null}
        {availability ? (
          <Text style={paragraph}>
            Availability: <strong>{availability}</strong>
          </Text>
        ) : null}
        {message ? <Text style={paragraph}>Message: {message}</Text> : null}
        <Text style={mutedText}>
          You can manage volunteers from the Volunteers tab in the admin dashboard.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'New volunteer application to review',
  displayName: 'Volunteer application — admin notification',
  previewData: {
    fullName: 'Daniel Mensah',
    email: 'daniel@example.com',
    phone: '07700 900123',
    membershipNumber: 'CCGM-1042',
    areas: ['Youth mentoring', 'Catering'],
    availability: 'Sat: Morning, Afternoon',
    message: 'Happy to help with transport too.',
  },
} satisfies TemplateEntry