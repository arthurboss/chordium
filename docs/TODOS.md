- remove leftover localstorage code:

1. chordium-search-cache
2. lastSearchQuery

- migrate SearchStateContext from localstorage to indexedDB, and check if it is even necessary

- check how to unify searches when results are most likely the same, such as:

"leonardo goncalves"
"leonardo gonçalves"

"oficina g3"
"oficina-g3"

- handle refresh on save chord sheets to avoid refreshing ui. should be handled only by NavigationButtons
- handle going back from chord sheet to search results
