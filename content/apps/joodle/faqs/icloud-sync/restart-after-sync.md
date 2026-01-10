---
id: restart-after-sync
title: Why do I need to restart the app after enabling sync?
order: 3
---

Joodle uses Apple's SwiftData with CloudKit for syncing your data securely. Due to how Apple's sync technology works, the sync configuration is set when the app launches.

**When you change sync settings**, the app needs to restart to apply the new configuration properly. This ensures:

- Your data syncs reliably.
- No conflicts occur between local and cloud data.
- The sync connection is established correctly.

This is a one-time restart whenever you toggle sync on or off. After that, syncing happens automatically in the background.
