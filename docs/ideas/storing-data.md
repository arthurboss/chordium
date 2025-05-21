# Storing Data

## Artists

Use tables in Supabase, since it allows for SQL querying:

| Display Name     | Path             | Song Count |
|------------------|------------------|------------|
| AC/DC            | ac-dc            | 95         |
| Guns N' Roses    | guns-n-roses     | 150        |
| Hillsong United  | hillsong-united  | 127        |
| Rosa de Saron    | rosa-de-saron    | 93         |

On SQL then it will allow searches like:

```sql
SELECT * FROM artists WHERE display_name LIKE 'A%';
```
which fetches all artists whose names start with "A", without needing separate files.

### Path

All URLs start with the same domain, so we can only store the path for the artist.

Backend will have the `BASE_URL = "https://www.cifraclub.com.br/" as a constant, and it will construct the URL to scrape data.

### Display Name

Due to edge cases, like AC/DC or names with different characters, it's best to scrape the displayName and store it as well, instead of extracting it from the URL path.

### Song Count

The song count will be useful for when running the cronjob that will check for new songs on CifraClub, also to know beforehand how many songs will be fetched when searching for their songs, allowing for pre-optimization of the rendering in the frontend.

### API response

```json
{
  "url": "https://www.cifraclub.com.br/hillsong-united/",
  "displayName": "Hillsong United",
  "songCount": 127
}
```
---
## Songs

Store them as json files in S3, to avoid using up the free-tier of supabase (500mb). Backend fetches songs dynamically when needed and caches frequently searched artists for performance optimization.


## The Final Storage Approach
1️⃣ Scrape song lists only when searched – Store results only when requested to reduce space usage.

2️⃣ Cache popular songs – Keep frequently searched song lists temporarily in memory or a lightweight DB.

3️⃣ Store full song data externally (S3, JSON-based storage, etc.) – Avoid bloating Supabase with complete song details.

4️⃣ API dynamically fetches song lists – Instead of storing every song upfront, the backend queries CifraClub when needed.

### 🔥 Why This Works Best?

✅ Avoids storing unnecessary songs for every artist upfront.

✅ Keeps Supabase lightweight, avoiding free-tier storage limits.

✅ Ensures performance stays fast, fetching only relevant data. 

✅ Flexible scaling if the project grows in the future.