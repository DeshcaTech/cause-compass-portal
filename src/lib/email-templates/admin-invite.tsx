import React from 'react'
import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { brand, container, eyebrow, heading, main, mutedText, paragraph } from './shared'

interface Props {
  inviteUrl?: string
  roleLabel?: string
  invitedByEmail?: string | null
  expiresAt?: string
}

const buttonStyle = {
  backgroundColor: brand.green,
  color: '#ffffff',
  borderRadius: '8px',
  padding: '12px 20px',
  fontSize: '15px',
  display: 'inline-block',
  margin: '8px 0 18px',
}

const Email = ({ inviteUrl, roleLabel, invitedByEmail, expiresAt }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You have been invited to administer the CCGMs website</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={eyebrow}>CCGMs Administration</Text>
        <Heading style={heading}>You've been invited as an administrator</Heading>
        <Text style={paragraph}>
          {invitedByEmail ? `${invitedByEmail} has` : 'A level 1 administrator has'} invited you to
          help manage the CCGMs website.
        </Text>
        {roleLabel ? (
          <Text style={paragraph}>
            Access granted: <strong>{roleLabel}</strong>
          </Text>
        ) : null}
        <Text style={paragraph}>
          Use the button below to set your name and password. The link works once.
        </Text>
        {inviteUrl ? (
          <Button href={inviteUrl} style={buttonStyle}>
            Set up my admin account
          </Button>
        ) : null}
        {expiresAt ? (
          <Text style={mutedText}>
            This invitation expires on {new Date(expiresAt).toLocaleDateString('en-GB')}.
          </Text>
        ) : null}
        <Text style={mutedText}>
          If you were not expecting this email you can safely ignore it — nothing changes until the
          link is used.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Your CCGMs administrator invitation',
  displayName: 'Admin invitation',
  previewData: {
    inviteUrl: 'https://example.org/admin-invite?token=demo',
    roleLabel: 'Level 3 — site content only',
    invitedByEmail: 'president@ccgme.org.uk',
    expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
  },
} satisfies TemplateEntry
