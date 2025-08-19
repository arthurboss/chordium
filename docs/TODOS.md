# TODOs

- add a "refresh results" button if results were gotten from cache, in order to avoid stale data in case previous searches had db unavailable or other cases
- artist search input not filtering when on "song" searchType
- keep scroll position when navigating away (stashed. requires cleanup)
- persist search when going to saved chord sheet and back to search
- add link to saved chord sheet to notification (showSaveSuccessNotification)

- Migrate SearchStateContext from localstorage to indexedDB, and check if it is even necessary

- fix going to song results back to artist list pre-filtering results from session storage (or url):

issue description:

- i perform a search for an artist ( path: "search",) (e.g: http://localhost:8080/search?artist=hillsong). The query is reflected on the input fields in @SearchBar with "Hillsong"
- i select one artist clicking on @ResultCard.tsx , it leads me to the artist songs results page (path: ":artist",) (e.g: http://localhost:8080/hillsong-united). Input field state persists.
- then I select a song, which is also a ResultCard, it leads me to the chord sheet page (path: ":artist/:song",) (e.g:http://localhost:8080/hillsong-united/oceans-where-feet-may-fail)
- then I click on the back button, it leads me back to the chord sheet page (path: ":artist/:song",), which is correct, BUT, the search state changes to whats in the url instead of my original query, hence the input fields in @SearchBar show now "Hillsong United", which was indeed what I selected but NOT what I searched for

this implies on having the results lost if I click once again on the back button, which goes to the search page ( path: "search",), because instead of the original http://localhost:8080/search?artist=hillsong it changes it to http://localhost:8080/search?artist=hillsong-united

Help me check where this is state is being overwritten by the url path. The app has a search context, and maybe that is a starting point
