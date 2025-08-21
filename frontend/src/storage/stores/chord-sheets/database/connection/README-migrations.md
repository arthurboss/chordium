# IndexedDB Migration Guide for Chordium

This guide explains how to manage and extend IndexedDB migrations for the Chordium app.

---

## Where is the migration logic?

- **Migration handler:**
  - `frontend/src/storage/stores/chord-sheets/database/connection/migration-handler.ts`
- **Initialization:**
  - `frontend/src/storage/stores/chord-sheets/database/connection/initialization.ts`

---

## How does it work?

- On database version change, the `onupgradeneeded` event triggers.
- The migration handler runs **all necessary migrations** from the user's current version up to the latest.
- Each migration step is handled in a `switch` statement by version number.

---

## How to add a new migration (e.g., v3)

1. **Increment the version** in `core/config/database.ts`:
   ```ts
   export const DB_VERSION = 3;
   ```
2. **Add a new case** in `migration-handler.ts`:
   ```ts
   case 3:
     // Migration logic for v3 (e.g., add new store or index)
     // Example:
     // const store = db.createObjectStore('newStore', { keyPath: 'id' });
     break;
   ```
3. **(Optional) Update `create-schema.ts`** if you want to reuse schema creation helpers.
4. **Test upgrades** from all previous versions to ensure smooth migration.

---

## Best Practices

- **Never require users to manually delete their database.**
- **Always handle all upgrade paths in code.**
- **Write idempotent migration steps** (safe to run even if partially applied).
- **Test migrations** from all previous versions.

---

For questions, see the code comments in `migration-handler.ts` or ask the maintainers.
