#!/bin/bash
# Fails if any chord sheet fixture JSON files are found outside shared/fixtures/chord-sheet/

set -e

duplicates=$(find . -type f \( -name 'eagles-hotel_california.json' -o -name 'oasis-wonderwall.json' -o -name 'radiohead-creep.json' \) | grep -v '^./shared/fixtures/chord-sheet/')

if [ -n "$duplicates" ]; then
  echo "Error: Duplicate chord sheet fixture files found outside shared/fixtures/chord-sheet/:"
  echo "$duplicates"
  exit 1
fi

exit 0 