/**
 * Sample data loader using progressive loading
 *
 * Loads sample chord sheet metadata first (fast), then content on demand (heavy).
 * Follows the same progressive loading pattern used throughout the app.
 * Uses dynamic imports to prevent bundling the sample data in production builds.
 */

import type { ChordSheet, SongMetadata } from '@chordium/types';
import type { SampleChordSheetRecord } from './data-loader.types';
import type { LyricsTranslations } from '@/storage/services/lyrics-storage';

/**
 * Load sample chord sheet metadata only (fast, non-blocking)
 */
export const loadSampleMetadata = async (): Promise<Array<{ path: string; metadata: SongMetadata }>> => {
  try {
    const [wonderwallMetadata, hotelCaliforniaMetadata, moreThanWordsMetadata] = await Promise.all([
      import('../../data/samples/chord-sheets/metadata/oasis-wonderwall.json'),
      import('../../data/samples/chord-sheets/metadata/eagles-hotel_california.json'),
      import('../../data/samples/chord-sheets/metadata/extreme-more_than_words.json')
    ]);

    return [
      {
        path: 'oasis/wonderwall',
        metadata: wonderwallMetadata.default as SongMetadata
      },
      {
        path: 'the-eagles/hotel-california',
        metadata: hotelCaliforniaMetadata.default as SongMetadata
      },
      {
        path: 'extreme/more-than-words',
        metadata: moreThanWordsMetadata.default as SongMetadata
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
 */
export const loadSampleContent = async (path: string): Promise<ChordSheet> => {
  try {
    let contentModule;

    switch (path) {
      case 'oasis/wonderwall':
        contentModule = await import('../../data/samples/chord-sheets/content/oasis-wonderwall.json');
        break;
      case 'the-eagles/hotel-california':
        contentModule = await import('../../data/samples/chord-sheets/content/eagles-hotel_california.json');
        break;
      case 'extreme/more-than-words':
        contentModule = await import('../../data/samples/chord-sheets/content/extreme-more_than_words.json');
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
 * Load the full arrangement (with tabs) for a sample path, if one exists.
 * Returns undefined for samples that have no distinct full arrangement.
 */
export const loadSampleFullContent = async (path: string): Promise<ChordSheet | undefined> => {
  try {
    let fullContentModule;

    switch (path) {
      case 'oasis/wonderwall':
        fullContentModule = await import('../../data/samples/chord-sheets/full-content/oasis-wonderwall.json');
        return fullContentModule.default as ChordSheet;
      case 'the-eagles/hotel-california':
        fullContentModule = await import('../../data/samples/chord-sheets/full-content/eagles-hotel_california.json');
        return fullContentModule.default as ChordSheet;
      default:
        return undefined;
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.debug(`No full content found for sample path ${path} (this is OK)`);
    }
    return undefined;
  }
};

/**
 * Load the lyric translations shipped with a sample, so the samples read in the
 * app's language without waiting on a download or a translator.
 */
export const loadSampleTranslations = async (
  path: string
): Promise<LyricsTranslations | undefined> => {
  try {
    switch (path) {
      case 'oasis/wonderwall':
        return (await import('../../data/samples/chord-sheets/translations/oasis-wonderwall.json'))
          .default;
      case 'the-eagles/hotel-california':
        return (
          await import('../../data/samples/chord-sheets/translations/eagles-hotel_california.json')
        ).default;
      case 'extreme/more-than-words':
        return (
          await import('../../data/samples/chord-sheets/translations/extreme-more_than_words.json')
        ).default;
      default:
        return undefined;
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.debug(`No sample translations found for ${path} (this is OK)`);
    }
    return undefined;
  }
};

/**
 * Load complete sample chord sheet data (metadata, content, full arrangements and
 * the translations shipped with each sample)
 */
export const loadSampleData = async (): Promise<SampleChordSheetRecord[]> => {
  try {
    const metadataRecords = await loadSampleMetadata();

    const completeRecords = await Promise.all(
      metadataRecords.map(async (record) => {
        const [content, fullContent, translations] = await Promise.all([
          loadSampleContent(record.path),
          loadSampleFullContent(record.path),
          loadSampleTranslations(record.path),
        ]);
        return {
          path: record.path,
          metadata: record.metadata,
          content,
          ...(fullContent ? { fullContent } : {}),
          ...(translations ? { translations } : {}),
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
