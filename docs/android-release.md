# Android release readiness

Snapshot: 2026-11-22, branch `feat/android-app`, application id `app.chordium`.

This document tracks what Google Play requires today, what the Capacitor shell
already satisfies, and what still has to happen before a production upload. It
is a working checklist, not a promise to publish.

## Blocking Play requirements

| Requirement | Status | Notes |
| --- | --- | --- |
| Target Android 16 (API 36) | Done | `compileSdk` and `targetSdk` are 36. Required for new apps and updates since 2026-08-31. |
| Android App Bundle | Done | `bundleRelease` produces `app/build/outputs/bundle/release/app-release.aab`. New apps must ship an AAB, not an APK. |
| Play App Signing | Not configured | Play signs the APK with Google-held keys; the project only needs an upload key and a signed AAB. Deferred until the Play Console account exists. |
| `versionCode` / `versionName` | Done | Both come from the root `package.json` version. `0.9.0` becomes `versionCode` 9000. |
| 16 KB page size support | Done | The app contains no native libraries. `unzip -l` of both APK and AAB shows no `lib/` entries, so the February 1, 2027 requirement is already met. |
| Data safety form | Drafted | Answers drafted below. The form can only be completed in Play Console. |
| Privacy policy URL | Drafted | The `/privacy` route is linked from the header menu. Deploy it on merge and have the legal text reviewed. |
| Content rating | Not done | Questionnaire in Play Console. |
| Target audience | Not done | State that the app is not directed at children. |
| Ads declaration | Not done | No ads, no ad SDKs. |
| App access declaration | Not done | No login or restricted content. |
| Store listing assets | Not done | 512x512 icon, 1024x500 feature graphic, phone and tablet screenshots, descriptions. |
| App Links | Drafted | Song URLs are claimed with `autoVerify`. `assetlinks.json` contains the debug certificate fingerprint until the Play signing key exists. |
| Pre-launch report | Not run | Play runs it automatically on internal testing. Check crashes, ANRs, and screenshot rendering. |

## Implemented on this branch

- Version name and code are derived from the root `package.json`, so a normal
  `chore: bump to <version>` commit also bumps the Android build. Gradle rejects
  versions whose minor or patch component would overflow the code scheme.
- Release builds enable R8 (`minifyEnabled`) and resource shrinking
  (`shrinkResources`). R8 keeps `@JavascriptInterface` methods so the Capacitor
  bridge survives obfuscation, and keeps `MainActivity` because the manifest
  names it.
- Optional signing: `android/keystore.properties` supplies the upload key. When
  the file is absent, `assembleRelease` still builds an unsigned APK for local
  inspection, and `bundleRelease` builds an unsigned AAB that Play will reject.
- Auto Backup is configured for Android 11 and lower (`backup_rules.xml`) and
  Android 12+ (`data_extraction_rules.xml`). The saved library lives in WebView
  IndexedDB, so `app_webview/Default/IndexedDB`, local storage, and session
  storage are included. Caches are not included.
- Manifest hardening: `enableOnBackInvokedCallback` for predictive back,
  `appCategory="audio"`, `resizeableActivity`, and optional camera, autofocus,
  and microphone features so devices without them can still install the app.
- The native build no longer emits or copies a service worker, Workbox files,
  source-map reports (`stats.html`), or Brotli copies. This drops dead weight
  from the APK and avoids a stale cached shell inside the WebView.
- A privacy policy page is served at `/privacy` inside the normal app layout and
  linked from the header menu, so the policy is reachable inside the app.
- Android App Links claim `https://chordium.vercel.app/<artist>/<song>` with
  `autoVerify`. `frontend/public/.well-known/assetlinks.json` lists the debug
  certificate, which lets debug and locally signed builds verify. The Play app
  signing fingerprint must be added before a production release. Without a
  verified app link, Android falls back to the browser or an installed PWA.
- `npm run android:apk` builds a debug APK. `npm run android:bundle` builds the
  release AAB. Both run Gradle in an amd64 podman container because the
  Android build tools are x86_64-only.

## Local development builds

Debug builds use `applicationIdSuffix ".dev"`, so they install as
`app.chordium.dev` with the launcher name "Chordium Dev" next to the release
app `app.chordium`. Android treats them as separate apps: each has its own
WebView IndexedDB, preferences, and Auto Backup data, so testing a dev build
never touches the stable app or its saved songs.

```bash
npm run android:apk
adb -s <serial> install -r android/app/build/outputs/apk/debug/app-debug.apk
```

Debug builds use the app's primary purple as the launcher icon background and
show a thin dev banner above the header. They also claim
`chordium-dev.vercel.app` for App Links instead of the production host, so they
never compete with the release app for real song links. The dev build carries a `-dev` version name;
its `versionCode` can stay identical because the packages are versioned
independently.

Release builds keep `app.chordium`. Only `npm run android:bundle` or an
`assembleRelease` APK produces the stable package.

## Versioning

The root `package.json` version is the single source of truth. The Android
version code is:

```
versionCode = major * 1000000 + minor * 1000 + patch
```

Examples: `0.9.0` becomes `9000`, `0.9.1` becomes `9001`, `1.0.0` becomes
`1000000`. Minor and patch must stay below 1000; Gradle fails the build if they
do not. Keep the root, frontend, and backend package versions aligned as the
existing release process already requires.

`versionCode` must never decrease or be reused for a different build. If a
release is uploaded, fix the problem in a new version instead of reusing the
number.

## Signing setup

Create an upload key once and keep it outside the repository:

```bash
keytool -genkeypair \
  -keystore ~/keys/chordium-upload.jks \
  -alias chordium-upload \
  -keyalg RSA -keysize 2048 -validity 10000
```

Add `android/keystore.properties` (ignored by git). `storeFile` is resolved
from the `android/` directory, so point it at the key outside the repository:

```properties
storeFile=/home/you/keys/chordium-upload.jks
storePassword=...
keyAlias=chordium-upload
keyPassword=...
```

Enroll in Play App Signing on the first upload. Google then holds the app
signing key and this keystore is only the upload key. If the upload key is lost,
request a reset in Play Console; losing the app signing key is not recoverable
outside Google's process.

Build and verify before uploading:

```bash
npm run android:bundle
jarsigner -verify android/app/build/outputs/bundle/release/app-release.aab
```

Upload the AAB and the R8 mapping file
`android/app/build/outputs/mapping/release/mapping.txt` so crashes are
deobfuscated. The mapping is also embedded in the bundle metadata, but Play asks
for it separately.

## Tablet deployment in DeX

The SM-X916B test tablet runs DeX on an external display. Deploy there, not to
the internal screen, and keep the app in the right half of the split screen:

```bash
adb -s <serial> install -r android/app/build/outputs/apk/release/app-release-tablet.apk
adb -s <serial> shell am start -n app.chordium/.MainActivity --display 6 --windowingMode 5
adb -s <serial> shell cmd activity task resize <taskId> 1726 0 3440 1440
```

The window manager usually restores the previous bounds. If it does not, resize
the task to the right half after launch.

## Data safety draft

The app has no account and no analytics SDK. Current behaviour:

- Camera frames and microphone audio are processed on the device for QR scan,
  tuning, and voice search. They are not uploaded by Chordium.
- Search terms go to the Chordium API. The API handler does not log the query,
  and the search index stores only public artist and song metadata, not a user
  history. Vercel may keep technical request logs according to the plan:
  Hobby 1 hour, Pro 1 day, Pro with Observability Plus 30 days.
- Saved songs stay in IndexedDB on the device; Auto Backup may copy them to the
  user's Google Drive.
- No location, contacts, calendar, health, SMS, or advertising identifiers.

If the native Web Speech API is used in the app, Android may send audio to a
Google speech service. That is an OS component rather than a bundled SDK, but
the privacy policy should still describe voice search accurately.

## Privacy policy

Play requires the policy to be public, non-editable, non-geofenced, and linked
both from the listing and from inside the app. The `/privacy` route ships with the web build, is reachable at
`https://chordium.vercel.app/privacy`, and is linked from the header menu.
It names the developer, gives a contact, and covers camera, microphone, search,
local storage, backup, sharing, providers, retention, and children. Review the
legal text before uploading to Play.

## Android 16 behaviour to verify

- Edge-to-edge is enforced for apps targeting API 35+. Capacitor 8 installs a
  window-insets listener and either pads the decor view or injects
  `--safe-area-inset-*`. Verify status and navigation bars in light and dark
  mode, and with the keyboard open.
- Predictive back is on by default. `MainActivity` registers an
  `OnBackPressedCallback`, which is the supported path; `onBackPressed` is no
  longer called. Verify back from every route, including a jam session and the
  tuner sheet.
- On displays with smallest width 600dp and above, orientation and aspect-ratio
  restrictions are ignored. The web UI is responsive, but the tablet and
  foldable layouts still need a manual pass.
- Test the 16 KB page-size emulator image even though there are no native
  libraries, to catch WebView regressions.

## Quality work Google recommends

- Baseline profiles. AGP already packages the library-provided baseline
  profile. An app-specific profile generated with Macrobenchmark would improve
  first-launch code layout further; add it only if startup measurements show a
  problem.
- Startup time. Android vitals flags cold starts over 5 s, warm starts over 2 s,
  and hot starts over 1.5 s. The Capacitor splash screen and bundled assets
  should keep the first frame well below that, but measure on a cold install.
- Android vitals. Watch crash and ANR rates in Play Console after internal
  testing. The app has no crash-reporting SDK, so Play Console and the
  pre-launch report are the only signals.
- R8 and resource shrinking are already on for release.
- Keep `minSdkVersion` 24. WebView updates through Play, so old devices still
  get a current engine, but test API 24 and 26 at least once.
- App size. The current AAB is about 8.5 MB and the uncompressed web assets are
  about 24 MB, mostly the 21.6 MB ONNX WASM file. This is far below the 200 MB
  base-module limit, so Play Asset Delivery is unnecessary today.
- Android App Links are declared for shared song URLs. Verification against the
  live domain needs the production `assetlinks.json` deployed and the Play
  app-signing certificate fingerprint added. Debug builds can verify now with
  the debug fingerprint already in the file.

## Minimum functionality and webview policy

Play rejects apps whose only purpose is to display a website, and apps that
display a site without the owner's permission. This project owns the site and
does more than display it: the assets are bundled in the APK, saved songs work
offline, and camera, microphone, tuner, QR scanning, and native sharing are used.
Keep it that way. Do not change `server.url` to point at the live site; that
would turn the app back into a webview wrapper and also break offline use.

## Release checklist

1. Bump the root `package.json` (and the aligned workspace packages) in a
   dedicated `chore: bump to <version>` commit, then tag `v<version>`.
2. Create `android/keystore.properties` and confirm `npm run android:bundle`
   signs the AAB.
3. Run `npm run android:e2e` on an emulator.
4. Test on API 24, 31, 35, and 36 images; phone and tablet; light and dark;
   gesture and three-button navigation; keyboard open; airplane mode.
5. Fill Data safety, content rating, target audience, ads, and app access.
6. Publish the privacy policy and link it in the app.
7. Upload the AAB to internal testing, read the pre-launch report, and fix
   crashes and ANRs before promoting.
8. Upload `mapping.txt` with the release.

## Open decisions

- `app.chordium` is confirmed. It is fixed once the first AAB is uploaded.
- Privacy policy legal review; the page and in-app link are implemented.
- Data safety answer for voice search, which may use a Google speech service.
- Whether restoring WebView IndexedDB through Auto Backup is acceptable across
  app versions, or whether users should rely on the in-app export instead.
- Play signing fingerprint must be added to `assetlinks.json`; the debug
  fingerprint is a placeholder for local testing only.
- Play Console developer account, package-name reservation, and key custody.
  Deferred; no feature here depends on it.

## Official references

- Target API levels: https://developer.android.com/google/play/requirements/target-sdk
- 16 KB page sizes: https://developer.android.com/guide/practices/page-sizes
- App bundle and Play App Signing: https://support.google.com/googleplay/android-developer/answer/9859348
- Data safety: https://support.google.com/googleplay/android-developer/answer/10787469
- User data policy: https://support.google.com/googleplay/android-developer/answer/10144311
- Spam and minimum functionality: https://support.google.com/googleplay/android-developer/answer/9898842
- Core app quality: https://developer.android.com/docs/quality-guidelines/core
- Baseline profiles: https://developer.android.com/topic/performance/baselineprofiles/overview
- Android 16 behaviour changes: https://developer.android.com/about/versions/16/behavior-changes-16
