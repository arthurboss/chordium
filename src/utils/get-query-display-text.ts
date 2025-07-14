import { getSearchParamsType } from "@/utils/search-utils";

export function getQueryDisplayText(params: URLSearchParams): string {
  switch (getSearchParamsType(params)) {
    case 'artist-song':
      return `"${params.get('artist')?.replace(/-/g, ' ')}" by "${params.get('song')?.replace(/-/g, ' ')}"`;
    case 'artist':
      return `"${params.get('artist')?.replace(/-/g, ' ')}" in Artists`;
    case 'song':
      return `"${params.get('song')?.replace(/-/g, ' ')}" in Songs`;
    default:
      return "";
  }
}
