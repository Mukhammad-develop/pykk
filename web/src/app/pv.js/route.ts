// Placeholder for the page-view beacon so the <script src="/pv.js"> tag on
// client sites never hits a 404. The real beacon (collecting page views into
// the database) arrives with the statistics phase of the admin panel.
export const dynamic = 'force-dynamic'

export function GET() {
  return new Response('/* PYKK beacon placeholder — statistics arrive in a later phase. */\n', {
    headers: {
      'content-type': 'text/javascript; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}
