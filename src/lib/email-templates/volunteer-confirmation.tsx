import React from 'react'
import { Body, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { container, eyebrow, heading, main, mutedText, paragraph } from './shared'

interface Props {
  fullName?: string
  areas?: string[]
  availability?: string
}

const Email = ({ fullName, areas, availability }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>We received your CCGMs volunteer application</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={eyebrow}>CCGMs Volunteering</Text>
        <Heading style={heading}>Thank you{fullName ? `, ${fullName}` : ''}</Heading>
        <Text style={paragraph}>
          Your volunteer application has been received. Our volunteer coordinator will be in touch
          shortly to match you with a team.
        </Text>
        {areas && areas.length > 0 ? (
          <Text style={paragraph}>
            Areas you chose: <strong>{areas.join(', ')}</strong>
          </Text>
        ) : null}
        {availability ? (
          <Text style={paragraph}>
            Availability: <strong>{availability}</strong>
          </Text>
        ) : null}
        <Text style={mutedText}>A few hours from many hands keeps this community moving.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'We received your CCGMs volunteer application',
  displayName: 'Volunteer application received',
  previewData: {
    fullName: 'Daniel Mensah',
    areas: ['Youth mentoring', 'Catering'],
    availability: 'Weekends',
  },
} satisfies TemplateEntry