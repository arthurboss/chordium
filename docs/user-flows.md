# Chordium User Flows

This document describes the main user flows in the Chordium application to help with documenting the application and improving end-to-end tests.

## Core User Flows

### 1. File Upload and Chord Sheet Editing

#### Steps:
1. User lands on the home page
2. User uploads a file using the drag-and-drop area or file input
3. System parses the file and extracts metadata if available
4. System displays the metadata form with fields pre-populated when possible
5. User reviews/edits metadata and clicks "Edit Chord Sheet"
6. System enters edit mode showing the chord sheet content in a text editor
7. User makes changes to the chord sheet content
8. User clicks "Save" to save changes
9. System processes and displays the chord sheet with the saved content

#### Notes:
- The chord sheet controls are hidden during the edit mode
- The file upload flow now consistently supports metadata review, then editing before final display
- This flow ensures users can properly format their chord sheets before viewing

### 2. Viewing and Interacting with Chord Sheet

#### Steps:
1. User lands on a chord sheet view (either after upload or by selecting a saved song)
2. System displays the chord sheet with title, artist information, and formatted content
3. User can:
   - Toggle between normal, chords-only, and lyrics-only views
   - Adjust font size and spacing
   - Toggle guitar tabs display
   - Use auto-scroll feature with speed control
   - View chord diagrams by clicking on chord names
   - Transpose the song to different keys
4. User can enter edit mode by clicking the edit button

#### Notes:
- Desktop and mobile views have slightly different control layouts
- Auto-scroll controls appear differently when active vs. inactive

### 3. Saving and Managing Songs

#### Steps:
1. User views a chord sheet
2. System automatically saves the song to local storage
3. User can return to the song list view
4. User can see all saved songs with their metadata
5. User can select a song to view its chord sheet
6. User can delete songs they no longer need

## Testing Considerations

End-to-end tests should verify:

1. **File upload process**:
   - File validation
   - Metadata extraction and form display
   - Edit mode functionality
   - Final display of processed content

2. **Chord sheet functionality**:
   - All view modes render correctly
   - Chord diagrams display on interaction
   - Transposition works correctly
   - Auto-scroll starts and stops as expected

3. **Persistence**:
   - Songs are properly saved to local storage
   - Song list displays all saved songs
   - Deletion functionality works

## Future User Flows

1. **User Account Integration**:
   - User registration/login
   - Cloud sync of saved songs
   - Sharing songs with other users

2. **Advanced Chord Sheet Features**:
   - Adding capo position
   - Multiple instrument support
   - Custom chord diagrams
   - Performance mode with auto-page turning
