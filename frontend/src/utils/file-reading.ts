/**
 * Reads a file and returns its content as text
 */
export const readFileAsText = (
  file: File, 
  onSuccess: (content: string) => void,
  onError: () => void
): void => {
  const reader = new FileReader();
  
  reader.onload = (event) => {
    if (event.target?.result) {
      onSuccess(event.target.result as string);
    }
  };
  
  reader.onerror = onError;
  
  reader.readAsText(file);
};
