import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { unsubscribeByToken } from '@/lib/news.functions'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/news/unsubscribe')({
  validateSearch: z.object({ token: z.string().optional() }),
  head: () => ({
    meta: [
      { title: 'Unsubscribe from CCGMs news updates' },
      {
        name: 'description',
        content: 'Stop receiving CCGMs community news and announcement emails in one click.',
      },
      { property: 'og:title', content: 'Unsubscribe from CCGMs news updates' },
      {
        property: 'og:description',
        content: 'Stop receiving CCGMs community news and announcement emails in one click.',
      },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
      { name: 'robots', content: 'noindex' },
    ],
  }),
  component: UnsubscribePage,
})

function UnsubscribePage() {
  const { token } = Route.useSearch()
  const [state, setState] = useState<'working' | 'done' | 'invalid'>('working')
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    if (!token) {
      setState('invalid')
      return
    }
    unsubscribeByToken({ data: { token } })
      .then((res) => {
        if (cancelled) return
        if (res.ok) {
          setEmail(res.email)
          setState('done')
        } else {
          setState('invalid')
        }
      })
      .catch(() => !cancelled && setState('invalid'))
    return () => {
      cancelled = true
    }
  }, [token])

  return (
    <section className="container-page py-20">
      <div className="mx-auto max-w-xl rounded-3xl border border-border/70 bg-card p-8 text-center">
        <p className="eyebrow text-terracotta">CCGMs news</p>
        {state === 'working' && <h1 className="mt-3 text-3xl">Updating your preferences…</h1>}
        {state === 'done' && (
          <>
            <h1 className="mt-3 text-3xl">You have been unsubscribed</h1>
            <p className="mt-4 text-muted-foreground">
              {email ? `${email} will ` : 'You will '}no longer receive CCGMs news and announcement
              emails. You can re-subscribe any time from the news page.
            </p>
          </>
        )}
        {state === 'invalid' && (
          <>
            <h1 className="mt-3 text-3xl">This link is not valid</h1>
            <p className="mt-4 text-muted-foreground">
              The unsubscribe link is missing or has already been used. If you still receive
              emails, please contact us and we will remove you.
            </p>
          </>
        )}
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild variant="soft">
            <Link to="/news">Back to news</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/contact">Contact us</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}