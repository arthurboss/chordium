# Plan: Jam Session Feature Rethink (Chordium)

## Context

Issues #157–#166 defined a 10-issue plan for a "jam session" feature using WebRTC with QR-code-encoded SDP signaling. That plan was abandoned/forgotten. This document redefines the requirements from scratch as of May 2026, with a cleaner incremental delivery strategy and a better-fit technology stack.

**User priorities confirmed:**
- QR code is always the join mechanism (non-negotiable)
- Fully offline target (at least on LAN / same Wi-Fi)
- Host-only controls for MVP (scroll, transpose, capo — peers follow)
- Incremental releases: share sheet first, then live sync, then optional peer control later

---

## Recommended Architecture

### Technology Stack

- **Trystero** (npm: `trystero`) — WebRTC abstraction with pluggable signaling backends
- **Nostr backend** (built into Trystero) — free, decentralized relay network used for the 2-second WebRTC handshake only; no server to maintain
- **WebRTC DataChannels** — all actual session data (scroll, transpose, capo) flows P2P between devices after handshake
- **QR code** — always the join mechanism; in Phase 1 it encodes chord sheet data, in Phase 2 it encodes a room ID

### How Nostr fits (it never replaces the QR):
- Phase 1: QR encodes compressed chord sheet JSON → no networking at all
- Phase 2: QR encodes a short room ID → app uses Nostr for ~2s to exchange WebRTC offer/answer → P2P connection opens → Nostr is no longer involved

### Message Protocol (Phase 2+)
```json
{ "type": "chordium-sync",    "scroll": 0.42, "capo": 2, "transpose": 0 }
{ "type": "chordium-sheet",   "data": "<compressed chord sheet JSON>" }
{ "type": "chordium-control", "from": "peer-42", "action": "transpose", "value": 2 }
```

---

## Incremental Delivery Plan

### Phase 1 — Share Chord Sheet via QR (no networking)

**What it is:** The chord sheet is compressed (gzip + base64) and embedded directly in a QR code. Peer scans it → chord sheet loads on their device. No internet, no WebRTC, no servers. Like AirDrop for chord sheets.

**What ships:**
- Host opens a chord sheet → "Start Jam" button → QR modal appears
- QR encodes the full chord sheet as compressed JSON
- Peer scans QR → same chord sheet loads automatically in their app
- Works 100% offline, everywhere, always

**New files:**
- `frontend/src/components/JamQRModal.tsx` — displays the QR code for the host
- `frontend/src/utils/chordSheetQR.ts` — encode/decode chord sheet to/from QR payload

**Dependencies to add:**
- `qrcode` (QR generation) — already a common dependency, check if present first
- `pako` or `fflate` (compression) — check if already used in the project

**Issues to create:** "Phase 1: Share chord sheet via QR (static, no sync)"

---

### Phase 2 — Host Broadcast Sync (live scroll/transpose/capo)

**What it is:** After the Phase 1 QR scan loads the chord sheet, a WebRTC P2P connection is established via Trystero + Nostr signaling. The host broadcasts state changes; peers apply them in real time.

**What ships:**
- Phase 2 QR encodes both chord sheet data AND a room ID (one scan gets both)
- After scanning, app performs Nostr-based signaling (~2s, requires brief internet) and opens a WebRTC DataChannel
- Host broadcasts `chordium-sync` messages on scroll/transpose/capo changes (debounced ~100ms)
- Peers receive and apply updates; UI shows "Synced with Host" badge
- Fallback: if WebRTC fails, peer stays on the static chord sheet from the QR scan (Phase 1 behavior)

**New files:**
- `frontend/src/hooks/useJamSession.ts` — Trystero session lifecycle (shared)
- `frontend/src/hooks/useJamHost.ts` — host: broadcasts state on change
- `frontend/src/hooks/useJamPeer.ts` — peer: receives and applies state
- `frontend/src/components/JamSessionBadge.tsx` — "Synced with Host" / "Reconnecting" status

**Dependencies to add:**
- `trystero` — WebRTC + Nostr signaling abstraction

**Issues to create:** "Phase 2: Live sync via WebRTC (host broadcasts scroll/transpose/capo)"

---

### Phase 3 — Peer Control (bidirectional, optional)

**What it is:** Any peer can suggest state changes; host validates and rebroadcasts.

**What ships:**
- "Allow peer control" toggle on the host's session view
- Peers send `chordium-control` messages (action + value)
- Host validates, applies, and rebroadcasts to all peers
- Attribution shown: "Scroll updated by Peer-42"

**Issues to create:** Revise existing #166 with updated message format and Trystero implementation notes

---

### Phase 4 — UX Polish

**What ships:**
- Host: peer count indicator, broadcast pulse animation, "End Session" button
- Peer: connection status indicator, "Reconnecting..." state on backgrounding
- Shared: toast notifications for peer join/leave, smooth reconnect on iOS backgrounding

**Issues to create:** Revise existing #165 with updated scope

---

## Immediate First Steps (before coding)

### 0. Save this plan to the VM
Copy this plan file to `~/projects/chordium/docs/jam-session-plan.md` on the VM via SCP:
```bash
scp -i ~/.ssh/id_fedora_vm /Users/arthur.boss/.claude/plans/declarative-greeting-knuth.md \
  testuser@172.16.25.131:~/projects/chordium/docs/jam-session-plan.md
```

### 1. Create feature branch on GitHub
- Branch name: `feat/jam-session`
- Base: `main`
- Create via GitHub API (no SSH needed)

### 2. Close old issues with a comment
Close issues #159, #160, #161 with a comment explaining they are superseded by the new plan.

Closing comment template:
> Closing as superseded by the rethought jam session architecture (see #157 for updated overview).
> This approach (encoding raw WebRTC SDP/ICE in the QR / establishing WebRTC from raw SDP / transferring files via data channel) is replaced by:
> - Phase 1: chord sheet encoded directly in QR payload (no networking)
> - Phase 2: Trystero + Nostr for signaling (QR encodes a room ID, not SDP)

### 3. Update/re-open old issues
- Re-open #158 and revise as Phase 1 scope
- Update #157 (parent) with new architecture summary and links to Phase 1–4 issues
- Create new issues for Phase 1 and Phase 2 if not covered by existing ones

---

## What to Do With Old Issues (#157–#166)

| Issue | Action |
|-------|--------|
| #157 (parent overview) | Update with new architecture description; link to Phase 1–4 issues |
| #158 (share chord sheet, closed) | Re-open and revise as Phase 1 |
| #159 (encode signaling in QR) | Close — QR now encodes chord sheet + room ID, not raw SDP |
| #160 (establish WebRTC from QR) | Close — replaced by Trystero abstraction |
| #161 (transfer file via data channel) | Close — chord sheet transferred via QR payload, not data channel |
| #162 (broadcast scroll/capo/transpose) | Keep/revise — core of Phase 2 |
| #163 (receive and apply sync on peer) | Keep/revise — core of Phase 2 |
| #164 (fallback for failed connection) | Keep/revise — Phase 2 fallback to static QR view |
| #165 (UX affordances) | Keep/revise — becomes Phase 4 |
| #166 (peer control) | Keep/revise — becomes Phase 3 |

---

## iOS Safari Notes

- WebRTC DataChannels supported since iOS 11 — no blocker
- PWA backgrounding can suspend connections — implement reconnect-on-resume
- HTTPS required for WebRTC and camera (QR scan) — already enforced by Vercel deployment
- Local network permission prompt fires on iOS 14+ when accessing LAN IPs — use domain names in payloads, not raw IPs

---

## Critical Files

| File | Change |
|------|--------|
| `frontend/src/components/JamQRModal.tsx` | New (Phase 1) |
| `frontend/src/utils/chordSheetQR.ts` | New (Phase 1) |
| `frontend/src/hooks/useJamSession.ts` | New (Phase 2) |
| `frontend/src/hooks/useJamHost.ts` | New (Phase 2) |
| `frontend/src/hooks/useJamPeer.ts` | New (Phase 2) |
| `frontend/src/components/JamSessionBadge.tsx` | New (Phase 2) |
| `frontend/package.json` | Add `trystero` (Phase 2), check for `qrcode`/`pako` (Phase 1) |

---

## Verification

**Phase 1:**
- [ ] Host opens chord sheet on Device A → taps "Start Jam" → QR code appears
- [ ] Device B scans QR → same chord sheet loads immediately
- [ ] Both devices in airplane mode (same WiFi only) — still works

**Phase 2:**
- [ ] Host scrolls → Device B scrolls in sync (<200ms lag on LAN)
- [ ] Host changes transpose → Device B's transpose updates live
- [ ] Device B backgrounds and returns → connection restores automatically
- [ ] Test on iOS Safari PWA (installed from home screen)
- [ ] If Nostr signaling fails → Device B still has the chord sheet from Phase 1 QR
