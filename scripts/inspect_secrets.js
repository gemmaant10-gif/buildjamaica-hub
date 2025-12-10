// Inspect secrets in Secret Manager for diagnostic purposes.
// Prints length, trimmed length, whether surrounding quotes/newlines exist, and a masked preview.
// Usage (PowerShell):
// $env:GOOGLE_APPLICATION_CREDENTIALS = 'C:\path\to\sa.json'
// node scripts/inspect_secrets.js [projectId]

const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');

const project = process.argv[2] || 'buildjamaica-8ff3f';
const client = new SecretManagerServiceClient();

async function inspectSecret(secretId) {
  const name = `projects/${project}/secrets/${secretId}/versions/latest`;
  try {
    const [version] = await client.accessSecretVersion({ name });
    const payload = version.payload && version.payload.data ? version.payload.data.toString('utf8') : '';
    const trimmed = payload.trim();
    const leadingQuote = payload.startsWith('"') || payload.startsWith("'");
    const trailingQuote = payload.endsWith('"') || payload.endsWith("'");
    const hasNewline = payload.includes('\n') || payload.includes('\r');
    const preview = payload.length <= 12 ? payload : `${payload.slice(0,4)}...${payload.slice(-4)}`;
    console.log(`${secretId} -> len=${payload.length}; trimmedLen=${trimmed.length}; leadingQuote=${leadingQuote}; trailingQuote=${trailingQuote}; hasNewline=${hasNewline}; preview=${preview}`);
  } catch (err) {
    console.error(`Failed to access secret ${secretId}:`, err.message || err);
  }
}

async function run() {
  console.log('Project:', project);
  await inspectSecret('SENDGRID_KEY');
  await inspectSecret('ADMIN_EMAIL');
}

run().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(2);
});
