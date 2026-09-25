// Rendered per request so the version line always shows the running release.
export const dynamic = 'force-dynamic'

export default function Home() {
  const version = process.env.APP_VERSION ?? 'dev'

  return (
    <main className="wrap">
      <p className="badge">● Online</p>
      <h1>PYKK is running</h1>
      <p className="slogan">Tech for every business</p>
      <p className="meta">
        Version {version} · <a href="/healthz">/healthz</a>
      </p>
    </main>
  )
}
