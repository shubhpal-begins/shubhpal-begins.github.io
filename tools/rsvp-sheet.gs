/**
 * RSVP receiver — appends each RSVP from the website as a row in this Google Sheet.
 *
 * Setup (one time):
 *  1. Create a Google Sheet, then Extensions → Apps Script. Paste this file in.
 *  2. Deploy → New deployment → type "Web app"; Execute as: Me; Who has access: Anyone.
 *  3. Copy the /exec URL into index.html → wedding-config → "rsvp":{"endpoint":"<url>"}.
 * Re-deploy (Manage deployments → edit → new version) after changing this script.
 */
var HEADERS = ['Submitted at', 'Name', 'Phone', 'Attending', 'Guests'];
// Apps Script can't read the real Origin header, so the page sends location.origin as a field.
// This blocks other copies of the site; a hand-crafted request can still fake it.
var ALLOWED_ORIGIN = 'https://shubhpal-begins.github.io';

function doPost(e) {
  var p = (e && e.parameter) || {};
  if (p.website) return json_({ ok: true }); // honeypot filled → bot; pretend success
  if (p.origin !== ALLOWED_ORIGIN) return json_({ ok: false, error: 'origin_not_allowed' });

  var name = clean_(p.name, 80);
  if (!name) return json_({ ok: false, error: 'name_required' });
  var attending = p.attending === 'No' ? 'No' : 'Yes';
  var guests = attending === 'Yes' ? Math.min(Math.max(parseInt(p.guests, 10) || 1, 1), 10) : 0;

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
    sheet.appendRow([new Date(), name, clean_(p.phone, 20), attending, guests]);
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true });
}

// Trim, cap length, and neutralise spreadsheet formula injection (=, +, -, @).
function clean_(v, max) {
  var s = String(v || '').trim().slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
