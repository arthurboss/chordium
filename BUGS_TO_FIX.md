# Bugs to Fix

## High Priority

### 1. CifraClub URL Validation Issue
**Status**: Not Fixed
**Date Found**: July 8, 2025

**Problem**: 
The app is attempting to fetch chord sheets from invalid CifraClub URLs with more than 2 path segments.

**Example**:
- Invalid URL: `https://www.cifraclub.com.br/da-guedes/65083/letra/` (3 segments: `/da-guedes/65083/letra/`)
- Error: `Failed to load chord sheet: Chord sheet "bem nessa" by "da guedes" not found in My Chord Sheets`
- Console: `[ERROR] ❌ Flow Step 2: No chord sheet data returned from CifraClub service for https://www.cifraclub.com.br/da-guedes/65083/letra/`

**Root Cause**: 
The URL validation logic should strictly limit CifraClub URLs to 2 path segments maximum (e.g., `/artist/song/`). URLs with `/letra/` or other additional segments should be rejected before attempting to fetch.

**Files to Investigate**:
- CifraClub service implementation
- URL validation logic
- Chord sheet fetching flow

**Fix Required**: 
Add a guard/validation to prevent fetching from CifraClub URLs with more than 2 path segments.

---

## Medium Priority

### 2. UI Title Duplication
**Status**: Not Fixed
**Date Found**: Previous session

**Problem**: 
Song titles are displayed twice in the UI - once in `ChordSheetViewer` (h1) and once in `ChordHeader` inside `ChordDisplay`.

**Files Affected**:
- `/src/components/ChordSheetViewer.tsx`
- `/src/components/ChordDisplay/ChordHeader.tsx`

**Fix Required**: 
Decide whether to keep the h1 in `ChordSheetViewer` or the header in `ChordDisplay`, and remove the duplicate.

### 3. Incorrect DataSource Labeling
**Status**: Not Fixed
**Date Found**: Previous session

**Problem**: 
Sample songs show dataSource as "scraping" instead of the correct label when loaded from local/sample data.

**Fix Required**: 
Correct the dataSource labeling logic for sample songs to show appropriate labels (e.g., "sample", "local", etc.).

---

## Investigation Notes

- The CifraClub URL issue might be related to search results returning malformed URLs
- Need to trace the flow from search → URL generation → fetch attempt
- Consider adding URL validation at multiple points in the pipeline
