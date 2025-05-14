/**
 * Extracts a title from the file name by removing the extension
 */
export const extractTitleFromFileName = (fileName: string): string => {
  return fileName.replace(/\.(txt|text|chord)$/i, '');
};

/**
 * Formats the filename using title and artist
 */
export const formatFileName = (title: string, artist: string): string => {
  return `${title}${artist ? ' - ' + artist : ''}`;
};
