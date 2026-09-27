import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'
import { sitesDir } from '@/lib/site-control'

const execFileAsync = promisify(execFile)

function repoDir(): string {
  return path.dirname(sitesDir()) // ~/pykk is the parent of ~/pykk/sites
}

async function git(args: string[], token?: string): Promise<string> {
  const fullArgs = [...args]
  const { stdout } = await execFileAsync('git', fullArgs, {
    cwd: repoDir(),
    timeout: 60_000,
    env: token
      ? { ...process.env, GIT_TERMINAL_PROMPT: '0' }
      : process.env,
  })
  return stdout.trim()
}

function authedUrl(token: string): string {
  return `https://x-access-token:${token}@github.com/Mukhammad-develop/pykk.git`
}

export interface CommitResult {
  committed: boolean
  pushed: boolean
  message: string
}

// Commits sites/{slug} from the server and pushes to main, using the
// fine-grained PAT. Without a token it reports back instead of failing.
export async function commitAndPushSite(slug: string, commitMessage: string): Promise<CommitResult> {
  const token = process.env.SITE_BUILD_GITHUB_TOKEN
  if (!token) {
    return { committed: false, pushed: false, message: 'SITE_BUILD_GITHUB_TOKEN is not set — files are on the server only (not in git)' }
  }

  const url = authedUrl(token)
  // Get the latest first so our commit lands on top (ff-only).
  await git(['-c', `http.extraHeader=Authorization: Basic ${Buffer.from(`x-access-token:${token}`).toString('base64')}`, 'pull', '--ff-only', url, 'main'])

  await git(['add', `sites/${slug}`])
  // Nothing to commit? (rebuild with identical output)
  const status = await git(['status', '--porcelain', `sites/${slug}`])
  if (!status) {
    return { committed: false, pushed: true, message: 'Site unchanged — already in git' }
  }
  await git(['-c', 'user.name=pykk-site-factory', '-c', 'user.email=site-factory@pykk.uk', 'commit', '-m', commitMessage])
  await git(['push', url, 'main'])

  return { committed: true, pushed: true, message: 'Committed and pushed to git' }
}
