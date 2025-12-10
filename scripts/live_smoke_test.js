/*
Live smoke test using Firebase Admin SDK.
Creates a test client user, a maintenance request, updates status values,
creates and deletes a users doc (invite simulation), then cleans up.

Usage (PowerShell):
$env:GOOGLE_APPLICATION_CREDENTIALS = 'C:\path\to\sa.json'
node scripts\live_smoke_test.js

Be careful: this operates on the live Firebase project provided by the service account.
*/

const admin = require('firebase-admin');

async function run() {
  try {
    console.log('Initializing admin...');
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
    const auth = admin.auth();
    const db = admin.firestore();

    const ts = Date.now();
    const testClientEmail = `test-client+${ts}@example.com`;
    const testClientPassword = `P@ssword${ts}`;
    const testInviteEmail = `test-invite+${ts}@example.com`;

    console.log('Creating test client auth user:', testClientEmail);
    const userRecord = await auth.createUser({
      email: testClientEmail,
      emailVerified: false,
      password: testClientPassword,
      displayName: 'Smoke Test Client',
    });
    console.log('Created user uid=', userRecord.uid);

    // Create a maintenance request as test client (server-side write)
    console.log('Creating maintenance request document...');
    const reqDoc = await db.collection('maintenanceRequests').add({
      clientEmail: testClientEmail,
      title: 'Mr.',
      firstName: 'Smoke',
      lastName: 'Tester',
      trade: 'Plumbing',
      parish: 'Kingston',
      address: '123 Test St',
      town: 'Kingston',
      phone: '555-0000',
      details: 'Please fix the leak',
      submittedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'open'
    });
    console.log('Maintenance request created with id=', reqDoc.id);

    // Read back
    let snap = await reqDoc.get();
    console.log('Read back request:', snap.exists ? snap.data() : 'MISSING');

    // Update status sequence
    const statuses = ['in progress', 'completed', 'cancelled'];
    for (const s of statuses) {
      console.log('Setting status ->', s);
      await reqDoc.update({ status: s });
      const after = await reqDoc.get();
      console.log('Status now:', after.data().status || null);
    }

    // Simulate invite: create users/{email} doc
    console.log('Creating invite users doc for', testInviteEmail);
    await db.collection('users').doc(testInviteEmail).set({
      email: testInviteEmail,
      role: 'contractor',
      invitedAt: new Date().toISOString()
    });
    const inviteSnap = await db.collection('users').doc(testInviteEmail).get();
    console.log('Invite doc exists:', inviteSnap.exists, inviteSnap.data());

    // Remove invite
    console.log('Removing invite doc...');
    await db.collection('users').doc(testInviteEmail).delete();
    console.log('Invite doc removed.');

    // Cleanup: delete created maintenance request
    console.log('Cleaning up: deleting maintenance request...');
    await reqDoc.delete();
    console.log('Maintenance request deleted.');

    // Delete test auth user
    console.log('Deleting test auth user uid=', userRecord.uid);
    await auth.deleteUser(userRecord.uid);
    console.log('Test auth user deleted.');

    console.log('Smoke test completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Smoke test failed:', err);
    process.exit(2);
  }
}

run();
