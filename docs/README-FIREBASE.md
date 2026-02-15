# PandaPal Firebase Backend

This document describes the Firebase (Auth, Firestore, Storage) setup and rules. **Rules are not deployed from code**; configure them in the Firebase Console.

## How to get your Firebase config (new project)

1. Go to [Firebase Console](https://console.firebase.google.com/) and sign in with Google.
2. **Create a project** (or select an existing one): Click “Add project” → choose a name (e.g. `pandapal`) → follow the steps (Analytics optional).
3. **Register a web app**: In the project overview, click the **</>** (Web) icon to add a web app → give it a nickname → don’t enable Firebase Hosting if you don’t need it → “Register app”.
4. **Copy the config**: You’ll see a `firebaseConfig` object with `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`. Copy each value into your `.env` (see below).
5. **Enable Auth**: In the left sidebar go to **Build → Authentication** → “Get started” → enable **Email/Password** (and any other sign-in methods you need).
6. **Create Firestore**: **Build → Firestore Database** → “Create database” → start in **test mode** for dev (lock it down later with the rules in this doc).
7. **Create Storage**: **Build → Storage** → “Get started” → use default rules for dev (then replace with the storage rules in this doc).

## Environment variables

Copy `.env.example` to `.env` in the **project root** (not in `server/`) and set:

- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`
- `EXPO_PUBLIC_PIN_SALT` (optional; app has a default)

Restart the Expo dev server after changing `.env` so the new values are picked up.

## Data model (Firestore)

- **parents** (collection)
  - **{uid}** (document)
    - `email`: string
    - `createdAt`: serverTimestamp
    - `hasCompletedOnboarding`: boolean
  - **caregiverPin** (subcollection)
    - **data** (document): `pinHash`, `createdAt`
  - **children** (subcollection)
    - **{childId}** (document): `name`, `pandaName`, `pandaType`, `favoritePastime`, `pandaSuperpower`, `createdAt`
    - **documents** (subcollection): `type`, `filePath`, `downloadURL`, `createdAt`
    - **careInstructions** (subcollection): `content`, `createdAt`

## Storage paths

- `care-docs/{uid}/{childId}/{docId}.pdf` — uploaded PDFs

## Firestore rules (document only — set in Firebase Console)

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /parents/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
      match /{subcollection=**}/{docId} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
    }
  }
}
```

## Storage rules (document only — set in Firebase Console)

```firestore
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /care-docs/{uid}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

## Flow summary

1. **Parent signup** → Firebase Auth `createUserWithEmailAndPassword` → `ensureParentDoc(uid, email)` → navigate to Create PIN.
2. **Create PIN** → `hashPin(pin)` → `setCaregiverPinHash(uid, pinHash)` (plus existing local PIN flow) → navigate to child step.
3. **Child profile (Create Panda)** → `createChild(uid, {...})` → if pending care plan exists, `uploadCareDoc` per file and `addClinicalInstructions` for text → clear pending → navigate to role-select.
4. **Care plan upload (Upload Care Plan Details)** → PDFs and clinical text are stored in memory as “pending”; when the user completes child profile (create-panda), pending files and text are uploaded to Storage/Firestore keyed by `uid` and the new `childId`.

---

## Touched files and how to test

**New files:** `lib/firebase.ts`, `features/backend/hashPin.ts`, `features/backend/parents.ts`, `features/backend/children.ts`, `features/backend/carePlan.ts`, `features/backend/pendingCarePlan.ts`, `.env.example`, `docs/README-FIREBASE.md`.

**Minimal changes:** `contexts/AuthContext.tsx` (Firebase onAuthStateChanged, uid/email); `app/parent-signup.tsx` (createUserWithEmailAndPassword + ensureParentDoc); `app/login.tsx` (signInWithEmailAndPassword); `app/create-pin.tsx` (hashPin + setCaregiverPinHash when uid); `app/create-panda.tsx` (createChild + flush pending care plan); `app/caregiver-upload.tsx` (setPendingCarePlan before ai-parsing).

**Test E2E:** Set env vars, deploy rules in Console. Flow: Create New Panda → Caregiver Step → upload PDF and/or clinical text → Continue → complete review → Confirm → Create Parent Account → Create PIN → child step → Meet My Panda. Check Firestore `parents/{uid}`, `caregiverPin/data`, `children/{childId}`, Storage `care-docs/`, and `documents`/`careInstructions`. Login with same email/password should sign in and reach role-select.
