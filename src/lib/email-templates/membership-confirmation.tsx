import React from 'react'
import { Body, Container, Head, Heading, Html, Preview, Section, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { brand, container, eyebrow, heading, main, mutedText, panel, paragraph } from './shared'

interface Props {
  fullName?: string
  membershipNumber?: string
  membershipType?: string
  amount?: string
}

const Email = ({ fullName, membershipNumber, membershipType, amount }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>
      {membershipNumber
        ? `Your CCGMs membership number is ${membershipNumber}`
        : 'Your CCGMs membership is confirmed'}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={eyebrow}>CCGMs Membership</Text>
        <Heading style={heading}>Welcome{fullName ? `, ${fullName}` : ''}!</Heading>
        <Text style={paragraph}>
          Your registration has been received and your membership is now on record with the
          community.
        </Text>

        <Section style={panel}>
          <Text style={{ ...mutedText, margin: '0 0 6px' }}>Your registration number</Text>
          <Text
            style={{
              fontSize: '28px',
              letterSpacing: '4px',
              fontWeight: 700,
              color: brand.green,
              margin: 0,
            }}
          >
            {membershipNumber ?? '—'}
          </Text>
        </Section>

        <Text style={paragraph}>
          Membership type: <strong>{membershipType ?? 'Member'}</strong>
          {amount ? ` · ${amount} per year` : ''}
        </Text>
        <Text style={paragraph}>
          Keep this number safe — you'll be asked for it when donating, volunteering, renting
          community assets or referring someone for support.
        </Text>
        <Text style={mutedText}>Thank you for standing with CCGMs.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    data['membershipNumber']
      ? `Welcome to CCGMs — your number is ${data['membershipNumber']}`
      : 'Welcome to CCGMs',
  displayName: 'Membership confirmation',
  previewData: {
    fullName: 'Amara Okafor',
    membershipNumber: 'CCGM-1042',
    membershipType: 'Family',
    amount: '£60',
  },
} satisfies TemplateEntry