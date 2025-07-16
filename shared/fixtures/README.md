# Shared Chord Sheet Fixtures

This directory contains the canonical chord sheet JSON fixtures used for testing in both the frontend and backend.

- **Source of Truth:** Only files in this directory should be used for chord sheet test data.
- **Usage:** Import these files directly in your tests. Do not copy or duplicate them elsewhere.
- **Updating:**
  - To add a new test chord sheet, add a new JSON file here.
  - To update, edit the relevant file and ensure all dependent tests still pass.
- **No Duplicates:** If you find chord sheet fixtures in other locations, delete them and use these instead. 