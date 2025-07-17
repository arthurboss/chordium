/**
 * Utility functions for downloadable content
 */

/**
 * Creates a text file download for the provided content
 * @param content Content to download
 * @param filename Name for the downloaded file
 * @returns Notification message about download
 */
export const downloadTextFile = (content: string, filename: string): { title: string; description: string } => {
  const element = document.createElement("a");
  const file = new Blob([content], {type: 'text/plain'});
  element.href = URL.createObjectURL(file);
  element.download = `${filename || "chord-sheet"}.txt`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
  
  return {
    title: "Download started",
    description: "Your chord sheet is being downloaded"
  };
};
