/*
Emulator-only smoke test using Firebase Admin SDK.
This script performs Firestore-only operations (no Auth) so it can run safely against the Firestore emulator.

It expects the Firestore emulator to be running and reachable via FIRESTORE_EMULATOR_HOST env var.

Usage:
  # ensure emulator is running
  FIRESTORE_EMULATOR_HOST=127.0.0.1:8081 FIREBASE_PROJECT_ID=buildjamaica-8ff3f node scripts/emulator_smoke_test.js

This script will create timestamped documents in `maintenanceRequests` and `users` and then clean them up.
*/

const admin = require('firebase-admin');

async function run() {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID || 'buildjamaica-8ff3f';
    console.log('Initializing admin for project:', projectId);

    admin.initializeApp({ projectId });
    const db = admin.firestore();

    const ts = Date.now();
    const clientEmail = `emulator-test-client+${ts}@example.com`;
    const inviteEmail = `emulator-test-invite+${ts}@example.com`;

    console.log('Creating maintenance request document...');
    const reqRef = await db.collection('maintenanceRequests').add({
      clientEmail,
      title: 'Mx',
      firstName: 'Emu',
      lastName: 'Tester',
      trade: 'Plumbing',
      parish: 'Kingston',
      address: '1 Emulator Ln',
      town: 'EmuTown',
      phone: '000-0000',
      details: 'Emulator smoke test',
      submittedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'open'
    });
    console.log('Request created id=', reqRef.id);

    const snap = await reqRef.get();
    console.log('Read request status:', snap.data().status);

    const statuses = ['in progress', 'completed', 'cancelled'];
    for (const s of statuses) {
      console.log('Updating status ->', s);
      await reqRef.update({ status: s });
      const after = await reqRef.get();
      console.log('Status now:', after.data().status);
    }

    console.log('Creating users invite doc for', inviteEmail);
    await db.collection('users').doc(inviteEmail).set({
      email: inviteEmail,
      role: 'contractor',
      invitedAt: new Date().toISOString()
    });
    console.log('Invite doc created.');

    console.log('Cleaning up: deleting request and invite doc...');
    await reqRef.delete();
    await db.collection('users').doc(inviteEmail).delete();

    console.log('Emulator smoke test completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Emulator smoke test failed:', err);
    process.exit(2);
  }
}

run();
