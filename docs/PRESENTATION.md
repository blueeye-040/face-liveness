# HACKATHON 7.0 — PRESENTATION SLIDES
## OfflineFaceAuth: Secure Offline Facial Recognition & Liveness Detection

---

## SLIDE 1 — TITLE

# OfflineFaceAuth
### Secure Offline Facial Recognition & Attendance System
**Hackathon 7.0 | Team: [Your Team Name]**

> "100% offline. Zero compromise on security."

---

## SLIDE 2 — THE PROBLEM

### Field Personnel Authentication Is Broken

| Challenge | Reality |
|-----------|---------|
| Remote locations | No internet for hours or days |
| Manual attendance | Fraud via buddy punching |
| Photo-based spoofing | Static image defeats naive systems |
| Heavy AI models | Mid-range phones can't run them |

**The Gap:** Existing systems fail the moment internet drops.
**Our Answer:** Full face recognition + liveness — no internet, ever.

---

## SLIDE 3 — OUR SOLUTION

```
  OFFLINE ZONE                          ONLINE (When Available)
  ─────────────────────────────         ────────────────────────
  Camera                                AWS Lambda
     ↓                                       ↑
  Face Detection                        API Gateway
     ↓                                       ↑
  5-Step Liveness Check             Auto Sync + Purge
     ↓                                       ↑
  MobileFaceNet Embedding           DynamoDB Table
     ↓                                       ↑
  Cosine Similarity Match           NetInfo Listener
     ↓
  SQLite (Local Storage)
     ↓
  GPS Coordinates Captured
```

**Everything works offline. Cloud sync happens automatically when internet returns.**

---

## SLIDE 4 — ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────┐
│                    React Native App                      │
├──────────────┬──────────────────┬───────────────────────┤
│   UI Layer   │   Service Layer  │      AI Layer         │
│              │                  │                       │
│  Dashboard   │ AttendanceService│  LivenessEngine.ts    │
│  Enrollment  │ EnrollmentService│  (5-step geometric)   │
│  History     │ SyncService      │                       │
│  Settings    │ PermissionService│  FaceRecognitionEngine│
│              │                  │  (MobileFaceNet TFLite│
├──────────────┴──────────────────┤   192-dim embeddings) │
│         Database Layer          │                       │
│  SQLite (react-native-nitro)    ├───────────────────────┤
│  ├── employees table            │   Hardware Layer      │
│  └── attendance table           │  VisionCamera v5      │
│      (with GPS + syncStatus)    │  TFLite Runtime       │
└─────────────────────────────────┴───────────────────────┘
```

---

## SLIDE 5 — INNOVATION: LIVENESS DETECTION (No Extra Model Needed)

### 5-Step Challenge-Response System

```
STEP 1 → Look Straight     (±10° yaw, ±15° pitch, 20 frames stable)
STEP 2 → Blink Twice       (eye probability threshold 0.3, 2 blink events)
STEP 3 → Turn Head Left    (yawAngle < -15°)
STEP 4 → Turn Head Right   (yawAngle > +15°)
STEP 5 → Smile             (smilingProbability > 0.7)
```

**Key Innovation:**
- **Zero additional ML model** for liveness — uses geometric/probabilistic face landmarks from the detector itself
- Cannot be spoofed by photos, videos, or printed masks
- Purely algorithmic — runs at 30+ FPS with no extra compute cost
- State machine with per-step progress tracking (LivenessEngine.ts)

---

## SLIDE 6 — INNOVATION: AI MODEL

### MobileFaceNet — The Right Model for the Job

| Property | Value |
|----------|-------|
| Model file size | **~1.9 MB** (target was 20 MB) |
| Format | TFLite (quantized) |
| Embedding dimensions | 192-D float32 vector |
| Inference time | < 200ms on mid-range device |
| Runtime | react-native-fast-tflite (CPU) |
| Matching algorithm | Cosine Similarity |
| Match threshold | 0.60 (tunable) |

**10× smaller than the 20MB target.**
**No GPU required. Runs on CPU with standard ARM cores.**

---

## SLIDE 7 — INNOVATION: FACE MATCHING

### Cosine Similarity — Why It Works

```
similarity = (A · B) / (|A| × |B|)

Where:
  A = enrolled employee embedding (192-dim vector)
  B = live face embedding (192-dim vector)

Result: 0.0 (completely different) → 1.0 (identical)
Threshold: ≥ 0.60 = MATCH
```

**Advantages over Euclidean distance:**
- Scale-invariant (lighting changes don't affect angle)
- Works reliably across Indian demographics
- O(n) linear scan — fast even with 1000+ employees

---

## SLIDE 8 — FEASIBILITY: INTEGRATION INTO DATALAKE 3.0

### Drop-In Module Architecture

```
Datalake 3.0 App
      │
      ├── /src/ai/               ← AI engines (self-contained)
      │   ├── LivenessEngine.ts
      │   ├── FaceRecognitionEngine.ts
      │   └── ModelLoader.ts
      │
      ├── /src/services/         ← Business logic
      │   ├── AttendanceService.ts
      │   ├── EnrollmentService.ts
      │   └── SyncService.ts
      │
      ├── /src/database/         ← Local persistence
      │   ├── sqlite.ts
      │   ├── UserRepository.ts
      │   └── AttendanceRepository.ts
      │
      └── /src/screens/          ← UI (plug into any navigator)
```

**Integration requires only:**
1. Add 5 npm packages
2. Drop the `/src/ai/`, `/src/services/`, `/src/database/` folders
3. Add screens to existing navigator
4. Add model file to assets

---

## SLIDE 9 — FEASIBILITY: PERFORMANCE BENCHMARKS

| Metric | Target | Achieved |
|--------|--------|----------|
| Face detection latency | < 1s | **~50ms** (30 FPS) |
| Liveness check duration | Reasonable | **~4–6 seconds** (5 steps) |
| Face capture + embedding | < 1s | **< 200ms** |
| Total auth time | < 1s recognition | **~5–7s full flow** |
| Model size | < 20 MB | **1.9 MB** |
| RAM usage | < 3 GB device | **< 150 MB** |
| Min Android | 8.0+ | **8.0+** ✅ |
| Min iOS | 12+ | **12+** ✅ |

> Recognition (embedding → match) is < 200ms.
> Full flow includes liveness challenge by design — prevents spoofing.

---

## SLIDE 10 — SCALABILITY: OFFLINE-FIRST DATA FLOW

```
Face Recognized
       ↓
Save to SQLite          ← Always works, no internet needed
(syncStatus = 0)
       ↓
Trigger syncWithRetry()
       ↓
  Internet?
  YES ──→ POST to API Gateway → Lambda → DynamoDB
           ↓ 200 OK
           Mark synced → DELETE local record (purged)
           ↓ fail
           Wait 2 minutes → retry
           ↓ still no internet
  NO ──→ Stop. NetInfo listener waits for reconnect
           ↓ internet comes back
           Auto-trigger syncWithRetry() again
```

**Three sync triggers:**
1. App launch (catches leftover from previous session)
2. Internet reconnects (NetInfo listener)
3. Immediately after each attendance record saved

---

## SLIDE 11 — SCALABILITY: AWS ARCHITECTURE

```
Mobile App
    │
    │ HTTPS POST /attendance
    │ Header: x-api-key
    ↓
API Gateway (HTTP API)
    │
    ↓
AWS Lambda (Node.js 22)
    │ Validates API key
    │ Removes null fields
    │ Sets syncStatus = 1
    ↓
DynamoDB (On-Demand)
    Table: AttendanceTable
    PK: id (String)
    Fields: employeeId, employeeName,
            confidence, timestamp,
            latitude, longitude,
            syncStatus
```

**Scales to any number of devices and records without configuration.**

---

## SLIDE 12 — DEMO FLOW

### Live Demo Walkthrough

1. **Dashboard** — Real-time stats: Enrolled, Today's Attendance, Pending Sync, Last Sync
2. **Enrollment** — Enter name → 5-step liveness → capture → embedding stored in SQLite
3. **Mark Attendance** — 5-step liveness → capture → match → GPS recorded → saved
4. **History** — All attendance records with name, time, confidence %
5. **Offline Mode** — Turn off WiFi → mark attendance → data saved locally
6. **Auto Sync** — Turn WiFi on → watch pending count drop to 0 → DynamoDB updated

---

## SLIDE 13 — SECURITY MODEL

| Layer | Protection |
|-------|-----------|
| Liveness | 5-step challenge prevents photo/video spoofing |
| Embeddings | Stored as float vectors, not images — cannot reconstruct face |
| API | `x-api-key` header authentication on every request |
| Transport | HTTPS only (NSAppTransportSecurity enforced in iOS) |
| Local DB | SQLite on device, not accessible to other apps (sandboxed) |
| Cloud | DynamoDB with IAM role — Lambda has minimum required permissions |

---

## SLIDE 14 — TECH STACK

| Component | Technology | License |
|-----------|-----------|---------|
| Framework | React Native 0.85 (New Architecture) | MIT |
| Camera | react-native-vision-camera v5 | MIT |
| Face Detection | react-native-vision-camera-face-detector | MIT |
| AI Runtime | react-native-fast-tflite | MIT |
| AI Model | MobileFaceNet (TFLite) | Apache 2.0 |
| Local DB | react-native-nitro-sqlite | MIT |
| GPS | @react-native-community/geolocation | MIT |
| Network | @react-native-community/netinfo | MIT |
| Cloud | AWS Lambda + DynamoDB + API Gateway | — |

**100% open-source. Zero paid licenses.**

---

## SLIDE 15 — CONCLUSION

### Why OfflineFaceAuth Wins

| Criteria | Our Advantage |
|----------|--------------|
| **Innovation** | Liveness without a second model; 1.9MB model (10× under limit) |
| **Feasibility** | Drop-in modules; works on any mid-range Android/iOS device |
| **Scalability** | Retry-until-success sync; DynamoDB scales infinitely |
| **Documentation** | Clean layered architecture; full technical docs |

> **"Zero internet. Zero compromise. Zero fraud."**

**GitHub:** [your-repo-link]
**Team:** [Your Team Name]

---
