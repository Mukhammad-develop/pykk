// The static shell served at {slug}.pykk.uk/admin — a login card and a mount
// point. The real panel app (client-panel.js) is served from the app host, so
// panel updates deploy once for every client.
export function renderAdminShell(opts: { slug: string; publicAppHost: string }): string {
  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Client area</title>
<link rel="stylesheet" href="https://${opts.publicAppHost}/client-panel.css">
<script>window.PYKK_PANEL = { slug: ${JSON.stringify(opts.slug)}, api: ${JSON.stringify(`https://${opts.publicAppHost}`)} };</script>
</head>
<body>
<div id="app">
  <main class="login-wrap">
    <form id="login-form" class="card">
      <p class="brand">PYKK client area</p>
      <h1>Log in</h1>
      <p class="error" id="login-error" hidden></p>
      <label>Email <input id="login-email" type="email" autocomplete="email" required></label>
      <label>Password <input id="login-password" type="password" autocomplete="current-password" required></label>
      <button type="submit" id="login-button">Log in</button>
    </form>
  </main>
</div>
<script src="https://${opts.publicAppHost}/client-panel.js" defer></script>
</body>
</html>
`
}
