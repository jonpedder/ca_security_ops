# Automated live help screenshots

The `Refresh help screenshots` GitHub Actions workflow runs when the Operations Map, Incident Approval page, shared settings, workflow code, or capture script changes. It waits until GitHub Pages matches the triggering commit, captures both live pages at 1424 × 945, and commits changed PNG files.

## One-time credential setup

The pages require ArcGIS authentication. Store an authorized Playwright browser state as the repository Actions secret `SCREENSHOT_STORAGE_STATE_B64`.

1. Sign in to the deployed app with a dedicated, least-privilege screenshot account.
2. Export a Playwright `storageState` JSON file from that authenticated browser context.
3. Base64-encode the JSON as a single line.
4. In GitHub, open **Settings → Secrets and variables → Actions → New repository secret**.
5. Name it `SCREENSHOT_STORAGE_STATE_B64` and paste the encoded value.
6. Run **Actions → Refresh help screenshots → Run workflow**.

The workflow never prints the secret. If the ArcGIS session expires, capture fails before replacing images; refresh the secret and rerun the workflow. Do not use a personal administrator account.

## Local refresh

```bash
npm ci
npx playwright install chromium
SCREENSHOT_STORAGE_STATE=/absolute/path/to/storage-state.json npm run screenshots
```

Set `SCREENSHOT_BASE_URL` to use another deployed environment. The script intentionally captures a deployment rather than a local mock so the guide reflects the live application.
