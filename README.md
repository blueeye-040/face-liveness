# FaceAuth — Offline Face Recognition Attendance System

A fully offline, AI-powered attendance system built in React Native. Face detection, 5-step liveness check, MobileFaceNet embeddings, SQLite storage, and automatic AWS sync when internet restores.

---

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd OfflineFaceAuth
npm install
```

### 2. Update Config File

Open [`src/config/AppConfig.ts`](src/config/AppConfig.ts) and replace the placeholders:

```typescript
export const AppConfig = {
    syncApiUrl: 'https://YOUR_API_ID.execute-api.YOUR_REGION.amazonaws.com/prod/attendance',
    syncApiKey: 'YOUR_API_KEY_HERE',
};
```

| Field | Where to get it |
|-------|----------------|
| `syncApiUrl` | AWS Console → API Gateway → your API → Invoke URL + `/attendance` |
| `syncApiKey` | The value you set in Lambda → Environment Variables → `APP_API_KEY` |

> If you don't have AWS set up yet, leave the values as-is. The app works fully offline without sync.

---

## Running the App

### Android

```bash
# Connect a physical device or start an emulator, then:
npx react-native run-android
```

### iOS

```bash
cd ios
bundle install          # only needed once
bundle exec pod install
cd ..
npx react-native run-ios
```

Or open `ios/OfflineFaceAuth.xcworkspace` in Xcode and press **Run**.

---

## Building Release Binaries

### Android APK

```bash
cd android
./gradlew assembleRelease
```

APK output path:
```
android/app/build/outputs/apk/release/app-release.apk
```

### Android AAB (Play Store)

```bash
cd android
./gradlew bundleRelease
```

### iOS IPA

1. Open `ios/OfflineFaceAuth.xcworkspace` in Xcode
2. Select **Any iOS Device** as the build target
3. **Product → Archive**
4. **Distribute App → Ad Hoc** (for testing) or **App Store**

---

## Download & Test

| Platform | Link |
|----------|------|
| Android APK | [Download APK](https://github.com/YOUR_USERNAME/OfflineFaceAuth/releases/latest) |
| iOS TestFlight | [Join TestFlight](https://testflight.apple.com/join/YOUR_CODE) |

> Replace these links after uploading your release build to GitHub Releases or TestFlight.

---

## AWS Setup

### DynamoDB Table

1. AWS Console → **DynamoDB → Create Table**
   - Table name: `AttendanceTable`
   - Partition key: `id` (String)
   - Capacity mode: On-demand

### Lambda Function

1. AWS Console → **Lambda → Create Function**
   - Runtime: `Node.js 22.x`
   - Name: `syncAttendance`

2. Paste the contents of [`lambda/index.js`](lambda/index.js) into the inline editor
   > If the console creates `index.mjs`, rename it to `index.js`

3. Set **Environment Variables** (Lambda → Configuration → Environment variables):

   | Key | Value |
   |-----|-------|
   | `TABLE_NAME` | `AttendanceTable` |
   | `APP_API_KEY` | your secret key (same as `syncApiKey` in AppConfig.ts) |

4. Attach **AmazonDynamoDBFullAccess** to the Lambda IAM role

### API Gateway

1. AWS Console → **API Gateway → Create API → HTTP API**
   - Integration: Lambda → `syncAttendance`
   - Route: `POST /attendance`
   - Stage: `prod`

2. Copy the **Invoke URL** → paste into `syncApiUrl` in `src/config/AppConfig.ts`

---

## Project Structure

```
src/
├── ai/
│   ├── LivenessEngine.ts          # 5-step liveness state machine
│   ├── FaceRecognitionEngine.ts   # MobileFaceNet TFLite inference
│   └── ModelLoader.ts             # TFLite model loader
├── components/
│   ├── CameraView.tsx             # Camera + face detection + capture
│   ├── FaceBoundingBox.tsx        # Animated face box overlay
│   └── LivenessProgress.tsx       # Liveness step indicator
├── config/
│   └── AppConfig.ts               # ← UPDATE THIS with your AWS details
├── database/
│   ├── sqlite.ts                  # SQLite init + schema
│   ├── UserRepository.ts          # Employee CRUD
│   └── AttendanceRepository.ts    # Attendance CRUD
├── navigation/
│   └── AppNavigator.tsx           # React Navigation stack
├── screens/
│   ├── DashboardScreen.tsx        # Home with live stats
│   ├── AttendanceScreen.tsx       # Mark attendance via face scan
│   ├── EnrollmentScreen.tsx       # Enroll new employee
│   ├── AttendanceHistoryScreen.tsx
│   └── SettingsScreen.tsx
├── services/
│   ├── AttendanceService.ts       # Face matching + record saving
│   ├── EnrollmentService.ts       # Employee enrollment
│   ├── SyncService.ts             # AWS sync with retry logic
│   └── PermissionService.ts       # Android runtime permissions
├── models/
│   └── mobilefacenet.tflite       # On-device AI model (~2MB)
└── types/

lambda/
└── index.js                       # AWS Lambda function — deploy this
```

---

## How It Works

```
Camera Feed
    ↓
Face Detection  (VisionCamera + ML Kit)
    ↓
5-Step Liveness Check
    1. Look Straight (20 frames stable)
    2. Blink Twice
    3. Turn Head Left
    4. Turn Head Right
    5. Smile
    ↓
Auto Photo Capture
    ↓
MobileFaceNet TFLite → 192-dim embedding
    ↓
Cosine Similarity vs enrolled faces (threshold 0.6)
    ↓
Result shown (3 seconds) → camera resets for next person
    ↓
Record saved to SQLite (works 100% offline)
    ↓
Auto-sync to AWS when internet available
    ↓
Local record purged after confirmed sync
```

---

## Tech Stack

| Component | Library | Version |
|-----------|---------|---------|
| Framework | React Native (New Architecture) | 0.85 |
| Camera | react-native-vision-camera | v5 |
| Face Detection | react-native-vision-camera-face-detector | v2 |
| AI Inference | react-native-fast-tflite | v3 |
| Face Model | MobileFaceNet TFLite | ~2MB |
| Local DB | react-native-nitro-sqlite | latest |
| GPS | @react-native-community/geolocation | latest |
| Connectivity | @react-native-community/netinfo | latest |
| Cloud Sync | AWS Lambda + API Gateway + DynamoDB | — |
| Navigation | @react-navigation/native-stack | latest |

---

## Permissions

| Permission | Platform | Purpose |
|-----------|----------|---------|
| Camera | Android + iOS | Face detection and capture |
| Location (When In Use) | Android + iOS | GPS with each attendance record |
| Internet | Android | AWS sync |
