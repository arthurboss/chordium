#!/usr/bin/env bash
set -euo pipefail

# Android's aapt2 and d8 are x86_64-only, so the Gradle build runs inside an
# amd64 container on arm64 hosts. The SDK, Gradle cache and debug keystore are
# mounted so rebuilds keep the same signature and do not re-download.
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TASK="${1:-assembleDebug}"
SDK_DIR="${ANDROID_HOME:-$HOME/android-sdk}"

podman run --rm --platform linux/amd64 \
  -v "$ROOT_DIR:/workspace:Z" \
  -v "$SDK_DIR:/opt/android-sdk:Z" \
  -v "$HOME/.gradle:/root/.gradle:Z" \
  -v "$HOME/.android:/root/.android:Z" \
  -w /workspace/android \
  -e ANDROID_HOME=/opt/android-sdk \
  -e ANDROID_SDK_ROOT=/opt/android-sdk \
  eclipse-temurin:21-jdk ./gradlew --no-daemon "$TASK"
