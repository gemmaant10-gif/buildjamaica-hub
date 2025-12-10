/**
 * Firebase Cloud Functions for sending email alerts on new maintenance
 * and contact requests.
 * Uses SendGrid for email delivery.
 */
const functions = require(
    "firebase-functions",
);
const admin = require(
    "firebase-admin",
);
const sgMail = require(
    "@sendgrid/mail",
);
require("dotenv").config();

admin.initializeApp();

// Migration: prefer Firebase Secrets (injected into process.env) and
// fall back to legacy env names for local dev.
// We'll bind secrets using runWith so that process.env values are available.

/**
 * Ensure the SendGrid API key is loaded into sgMail at runtime.
 * @return {string|null} the SendGrid key or null when not available
 */
function ensureSendGridKey() {
  const raw = process.env.SENDGRID_KEY || process.env.SENDGRID_API_KEY || "";
  // Strip surrounding quotes/newlines and trim whitespace.
  // This helps avoid invalid characters in HTTP headers.
  const key = raw
      .replace(/^\s+|\s+$/g, "")
      .replace(/^"|"$/g, "")
      .replace(/^'|'$/g, "");
  if (!key) {
    console.warn("SendGrid API key not available in environment");
    return null;
  }
  // Optionally log key length for debugging (does not reveal the key)
  console.log("SendGrid key length:", key.length);
  sgMail.setApiKey(key);
  return key;
}

/**
 * Send an email alert using SendGrid.
 * @param {string} subject - Email subject
 * @param {string} html - Email HTML content
 * @return {Promise} SendGrid response promise
 */
async function sendAlertEmail(subject, html) {
  // ensure we have the SendGrid key set in sgMail
  const key = ensureSendGridKey();
  if (!key) {
    throw new Error("SendGrid API key not configured");
  }
  // Trim secrets to avoid accidental newlines/spaces which can break headers
  const adminEmail = (process.env.ADMIN_EMAIL || "").trim();
  const msg = {
    to: adminEmail,
    from: adminEmail, // or a verified sender
    subject,
    html,
  };
  try {
    const res = await sgMail.send(msg);
    // Log concise result for observability (statusCode if available)
    try {
      const info = Array.isArray(res) ? res[0] : res;
      console.log("SendGrid send success", {
        subject,
        to: adminEmail,
        statusCode: info && info.statusCode,
      });
    } catch (e) {
      console.log("SendGrid send success (no structured response)");
    }
    return res;
  } catch (err) {
    console.error(
        "SendGrid send error",
        err && err.message ? err.message : err,
    );
    throw err;
  }
}

// Maintenance request alert
const runtimeOpts = {"secrets": ["SENDGRID_KEY", "ADMIN_EMAIL"]};
// Set the runtime options globally so the secrets are injected into process.env
// for the functions below. This uses the newer setGlobalOptions API available
// in newer firebase-functions releases.
functions.setGlobalOptions(runtimeOpts);

// New function names to avoid any historical name collisions with
// previously-deployed HTTPS functions. These names are unique and
// clearly indicate their purpose (sending email alerts).
exports.onMaintenanceRequestAlert = functions
    .firestore
    .onDocumentCreated("maintenanceRequests/{requestId}", async (snap, context) => { // eslint-disable-line max-len
      // Use the Admin SDK to read the created document.
      // This approach is robust across v1 and v2 runtimes.
      const id = context?.params?.requestId;
      const docRef = admin.firestore().doc(`maintenanceRequests/${id}`);
      const doc = await docRef.get();
      let data;
      if (doc && doc.exists) {
        data = doc.data();
      } else if (snap && typeof snap.data === "function") {
        // v1-style DocumentSnapshot provides data() method
        data = snap.data();
      } else if (snap && snap.data) {
        // v2 event payloads or other shapes may expose a data property
        data = snap.data;
      } else {
        data = {};
      }

      const subject = "New Maintenance Request Submitted";
      const parts = [
        "<h3>New Maintenance Request</h3>\n",
        "<p><strong>Name:</strong> " + (data.firstName || "") + " " + (data.lastName || "") + "</p>\n", // eslint-disable-line max-len
        "<p><strong>Trade:</strong> " + (data.trade || "") + "</p>\n",
        "<p><strong>Parish:</strong> " + (data.parish || "") + "</p>\n",
        "<p><strong>Phone:</strong> " + (data.phone || "") + "</p>\n",
        "<p><strong>Address:</strong> " + (data.address || "") + ", " + (data.town || "") + "</p>\n", // eslint-disable-line max-len
        "<p><strong>Other Info:</strong> " + (data.otherInfo || "") + "</p>",
      ];
      const html = parts.join("");
      return sendAlertEmail(subject, html);
    });

// Contact request alert
exports.onContactRequestAlert = functions
    .firestore
    .onDocumentCreated("contactRequests/{contactId}", async (snap, context) => {
      const id = context?.params?.contactId;
      const docRef = admin.firestore().doc(`contactRequests/${id}`);
      const doc = await docRef.get();
      let data;
      if (doc && doc.exists) {
        data = doc.data();
      } else if (snap && typeof snap.data === "function") {
        data = snap.data();
      } else if (snap && snap.data) {
        data = snap.data;
      } else {
        data = {};
      }

      const subject = "New Contact Request Submitted";
      const parts = [
        "<h3>New Contact Request</h3>\n",
        "<p><strong>Name:</strong> " + (data.name || "") + "</p>\n",
        "<p><strong>Email:</strong> " + (data.email || "") + "</p>\n",
        "<p><strong>Subject:</strong> " + (data.subject || "") + "</p>\n",
        "<p><strong>Message:</strong> " + (data.message || "") + "</p>",
      ];
      const html = parts.join("");
      return sendAlertEmail(subject, html);
    });
