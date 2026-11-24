const SITE_NAME = "Chordium";
const DEFAULT_DESCRIPTION =
  "A minimalist guitar chord sheet viewer with offline saved songs, search, tuner, and jam links.";
const ALLOW_INDEXING = import.meta.env.VITE_ALLOW_INDEXING === "true";
const SITE_URL = import.meta.env.VITE_APP_URL || "https://chordium.vercel.app";

interface PageMetadata {
  title: string;
  description: string;
  noindex: boolean;
}

function readableSegment(segment: string): string {
  try {
    return decodeURIComponent(segment).replace(/-/g, " ");
  } catch {
    return segment;
  }
}

export function metadataForPath(pathname: string): PageMetadata {
  const segments = pathname.split("/").filter(Boolean);
  const noindex = !ALLOW_INDEXING;

  if (segments[0] === "privacy") {
    return {
      title: `Privacy Policy | ${SITE_NAME}`,
      description: "How Chordium handles local data, camera and microphone access, search, and backups.",
      noindex,
    };
  }

  if (segments[0] === "search") {
    return {
      title: `Search guitar chords | ${SITE_NAME}`,
      description: "Find artists and chord sheets, then save them for offline use.",
      noindex,
    };
  }

  if (segments[0] === "upload") {
    return {
      title: `Import chord sheets | ${SITE_NAME}`,
      description: "Import a chord sheet or a Chordium backup into the app.",
      noindex,
    };
  }

  if (segments[0] === "my-chord-sheets") {
    return {
      title: `My chord sheets | ${SITE_NAME}`,
      description: "Your saved chord sheets, available offline.",
      noindex,
    };
  }

  if (segments.length >= 2) {
    const artist = readableSegment(segments[0]);
    const song = readableSegment(segments[1]);
    return {
      title: `${song} by ${artist} | ${SITE_NAME}`,
      description: `Guitar chords for ${song} by ${artist}, with transpose, capo, and offline save.`,
      noindex,
    };
  }

  if (segments.length === 1) {
    const artist = readableSegment(segments[0]);
    return {
      title: `${artist} chord sheets | ${SITE_NAME}`,
      description: `Browse guitar chord sheets by ${artist}.`,
      noindex,
    };
  }

  return {
    title: `${SITE_NAME} | Guitar chord sheets`,
    description: DEFAULT_DESCRIPTION,
    noindex,
  };
}

function upsertMeta(attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

export function applyPageMetadata(pathname: string) {
  const metadata = metadataForPath(pathname);
  const canonicalUrl = `${SITE_URL}${pathname}`;

  document.title = metadata.title;
  upsertMeta("name", "description", metadata.description);
  upsertMeta(
    "name",
    "robots",
    metadata.noindex ? "noindex, nofollow, noarchive" : "index, follow",
  );
  upsertMeta("property", "og:title", metadata.title);
  upsertMeta("property", "og:description", metadata.description);
  upsertMeta("property", "og:type", "website");
  upsertMeta("property", "og:url", canonicalUrl);
  upsertMeta("property", "og:site_name", SITE_NAME);
  upsertMeta("property", "og:image", `${SITE_URL}/web-app-manifest-512x512.png`);
  upsertMeta("name", "twitter:card", "summary");

  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = canonicalUrl;
}
