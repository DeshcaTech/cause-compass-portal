import React from 'react'
import { Body, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { container, eyebrow, heading, main, mutedText, panel, paragraph } from './shared'

interface Props {
  jobTitle?: string
  company?: string
  applicantName?: string
  applicantEmail?: string
  applicantPhone?: string
  membershipNumber?: string
  message?: string
}

const Email = ({
  jobTitle,
  company,
  applicantName,
  applicantEmail,
  applicantPhone,
  membershipNumber,
  message,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`New applicant for ${jobTitle ?? 'your job advert'}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={eyebrow}>CCGMs Jobs</Text>
        <Heading style={heading}>New applicant enquiry</Heading>
        <Text style={paragraph}>
          Someone has just used the apply link for <strong>{jobTitle}</strong>
          {company ? ` at ${company}` : ''} on the CCGMs Jobs board.
        </Text>

        <Container style={panel}>
          <Text style={{ ...paragraph, margin: '0 0 6px', fontWeight: 'bold' }}>
            {applicantName}
          </Text>
          {applicantEmail ? (
            <Text style={{ ...mutedText, margin: '0 0 4px' }}>{applicantEmail}</Text>
          ) : null}
          {applicantPhone ? (
            <Text style={{ ...mutedText, margin: '0 0 4px' }}>{applicantPhone}</Text>
          ) : null}
          {membershipNumber ? (
            <Text style={{ ...mutedText, margin: 0 }}>
              Membership number: {membershipNumber}
            </Text>
          ) : null}
        </Container>

        {message ? (
          <>
            <Text style={{ ...paragraph, fontWeight: 'bold', marginBottom: '4px' }}>
              Their message
            </Text>
            <Text style={paragraph}>{message}</Text>
          </>
        ) : null}

        <Text style={mutedText}>
          You can reply directly to this applicant using the email address above.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'New applicant from the CCGMs Jobs board',
  displayName: 'Job application notification',
  previewData: {
    jobTitle: 'Support Worker',
    company: 'Bright Care Ltd',
    applicantName: 'Jane Doe',
    applicantEmail: 'jane@example.com',
    applicantPhone: '07123 456789',
    membershipNumber: 'CCGMS-0042',
    message: 'I have three years of experience and would love to hear more.',
  },
} satisfies TemplateEntry
