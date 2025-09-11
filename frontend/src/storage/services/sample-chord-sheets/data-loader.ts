/**
 * Sample data loader using progressive loading
 * 
 * Loads sample chord sheet metadata first (fast), then content on demand (heavy).
 * Follows the same progressive loading pattern used throughout the app.
 * Uses dynamic imports to prevent bundling the sample data in production builds.
 */

import type { ChordSheet, SongMetadata } from '@chordium/types';
import type { SampleChordSheetRecord } from './data-loader.types';

/**
 * Load sample chord sheet metadata only (fast, non-blocking)
 * 
 * Dynamically imports sample chord sheet metadata and creates records with
 * the correct path format for IndexedDB storage.
 * 
 * @returns Promise resolving to array of SampleChordSheetRecord objects with metadata only
 * @throws {Error} When sample metadata cannot be loaded
 */
export const loadSampleMetadata = async (): Promise<SampleChordSheetRecord[]> => {
  try {
    const [wonderwallMetadata, hotelCaliforniaMetadata] = await Promise.all([
      import('../../data/samples/chord-sheets/metadata/oasis-wonderwall.json'),
      import('../../data/samples/chord-sheets/metadata/eagles-hotel_california.json')
    ]);

    return [
      {
        path: 'oasis/wonderwall',
        chordSheet: wonderwallMetadata.default as SongMetadata & ChordSheet
      },
      {
        path: 'eagles/hotel-california',
        chordSheet: hotelCaliforniaMetadata.default as SongMetadata & ChordSheet
      }
    ];
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Failed to load sample chord sheet metadata:', error);
    }
    throw new Error('Unable to load sample chord sheet metadata');
  }
};

/**
 * Load sample chord sheet content for a specific path (heavy, on-demand)
 * 
 * Dynamically imports sample chord sheet content and combines it with metadata.
 * 
 * @param path - The chord sheet path to load content for
 * @returns Promise resolving to complete ChordSheet object
 * @throws {Error} When sample content cannot be loaded
 */
export const loadSampleContent = async (path: string): Promise<ChordSheet> => {
  try {
    let contentModule;
    
    switch (path) {
      case 'oasis/wonderwall':
        contentModule = await import('../../data/samples/chord-sheets/content/oasis-wonderwall.json');
        break;
      case 'eagles/hotel-california':
        contentModule = await import('../../data/samples/chord-sheets/content/eagles-hotel_california.json');
        break;
      default:
        throw new Error(`No sample content found for path: ${path}`);
    }

    return contentModule.default as ChordSheet;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(`Failed to load sample chord sheet content for ${path}:`, error);
    }
    throw new Error(`Unable to load sample chord sheet content for ${path}`);
  }
};

/**
 * Load complete sample chord sheet data (metadata + content)
 * 
 * This is a convenience function that loads both metadata and content.
 * For progressive loading, use loadSampleMetadata() first, then loadSampleContent() on demand.
 * 
 * @returns Promise resolving to array of complete SampleChordSheetRecord objects
 * @throws {Error} When sample data cannot be loaded
 */
export const loadSampleData = async (): Promise<SampleChordSheetRecord[]> => {
  try {
    const metadataRecords = await loadSampleMetadata();
    
    const completeRecords = await Promise.all(
      metadataRecords.map(async (record) => {
        const content = await loadSampleContent(record.path);
        return {
          ...record,
          chordSheet: {
            ...record.chordSheet,
            ...content
          } as ChordSheet
        };
      })
    );

    return completeRecords;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Failed to load complete sample chord sheet data:', error);
    }
    throw new Error('Unable to load complete sample chord sheet data');
  }
};
