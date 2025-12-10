# Build AAB via GitHub Actions (Bubblewrap)

This repository includes a GitHub Actions workflow that can build and sign an Android App Bundle (AAB) for a Trusted Web Activity (TWA) using Bubblewrap.

Where the workflow is: `.github/workflows/build-aab.yml`

Required repository secrets (add these in GitHub > Settings > Secrets > Actions):

- `MANIFEST_URL` - The full URL to your hosted `manifest.json` (e.g. `https://www.build-jamaica.com/manifest.json`).
- `PACKAGE_NAME` - Your Android package name (example: `com.buildjamaica.app`).
- `KEYSTORE_BASE64` - Base64-encoded contents of your JKS keystore file. Create this locally with:

  ```powershell
  # PowerShell: base64-encode the keystore
  [Convert]::ToBase64String([IO.File]::ReadAllBytes('C:\path\to\your\keystore.jks')) > keystore.base64.txt
  # Copy the file contents into the GitHub secret value
  Get-Content keystore.base64.txt -Raw
  ```

- `KEYSTORE_PASSWORD` - Password for the keystore.
- `KEY_ALIAS` - The key alias inside the keystore.
- `KEY_PASSWORD` - Password for the key (may be same as `KEYSTORE_PASSWORD`).

Notes, caveats and troubleshooting:

- The workflow installs the Android SDK and Bubblewrap on ubuntu-latest. It then runs `npm ci` and `npm run build` to produce the static site and runs `npx @bubblewrap/cli` to initialize and build the TWA. Adjust the `MANIFEST_URL` and `PACKAGE_NAME` secrets to match your app.
- Bubblewrap CLI options and flags may change between versions. If the workflow fails on the `init` or `build` steps, run the same commands locally first to discover the right flags and then update the workflow accordingly.
- If you prefer not to store the keystore in GitHub, you can omit `KEYSTORE_BASE64` and instead use Play App Signing (upload unsigned AAB and let Play sign it). The workflow will still produce an unsigned AAB in that case.
- The workflow uploads any `.aab` found as an artifact called `app-aab` — download it from the workflow run summary.

How to run:

1. Add the secrets listed above to your repo's GitHub secrets.
2. Push to `main` or open the repository Actions page and run the `Build & Sign AAB (Bubblewrap)` workflow manually (workflow_dispatch).
3. After the run completes, download the `app-aab` artifact and upload it to Google Play Console.

If you'd like, I can:

- Tweak the workflow to sign with different flags if a local run shows different Bubblewrap options.
- Add a separate workflow that also deploys the `assetlinks.json` to Firebase Hosting (requires a `FIREBASE_TOKEN` secret produced by `firebase login:ci`).
