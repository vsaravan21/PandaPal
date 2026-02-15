/**
 * Firestore parent doc and caregiver PIN (hashed).
 */

import {
  doc,
  setDoc,
  getDoc,
  getFirestore,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { hashPin } from './hashPin';

const PARENTS = 'parents';
const CAREGIVER_PIN = 'caregiverPin';

export async function ensureParentDoc(
  uid: string,
  email?: string
): Promise<void> {
  const firestore: Firestore = db;
  const ref = doc(firestore, PARENTS, uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return;
  }
  await setDoc(ref, {
    email: email ?? '',
    createdAt: serverTimestamp(),
    hasCompletedOnboarding: false,
  });
}

export async function setCaregiverPinHash(uid: string, pinHash: string): Promise<void> {
  const firestore: Firestore = db;
  const ref = doc(firestore, PARENTS, uid, CAREGIVER_PIN, 'data');
  await setDoc(ref, {
    pinHash,
    createdAt: serverTimestamp(),
  });
}

export async function verifyCaregiverPin(uid: string, inputPin: string): Promise<boolean> {
  const firestore: Firestore = db;
  const ref = doc(firestore, PARENTS, uid, CAREGIVER_PIN, 'data');
  const snap = await getDoc(ref);
  if (!snap.exists()) return false;
  const stored = snap.data()?.pinHash as string | undefined;
  if (!stored) return false;
  const inputHash = await hashPin(inputPin);
  return inputHash === stored;
}
