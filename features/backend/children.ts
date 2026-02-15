/**
 * Firestore children subcollection under parents/{uid}/children.
 */

import {
  collection,
  doc,
  addDoc,
  setDoc,
  getFirestore,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const PARENTS = 'parents';
const CHILDREN = 'children';

export type ChildInput = {
  name: string;
  pandaName: string;
  pandaType: string;
  pandaAvatarId?: string;
  favoritePastime?: string;
  pandaSuperpower?: string;
};

export async function createChild(
  uid: string,
  child: ChildInput
): Promise<string> {
  const firestore: Firestore = db;
  const col = collection(firestore, PARENTS, uid, CHILDREN);
  const pandaAvatarId = child.pandaAvatarId ?? child.pandaType ?? 'panda_default';
  const ref = await addDoc(col, {
    name: child.name.trim(),
    pandaName: child.pandaName.trim(),
    pandaType: child.pandaType,
    pandaAvatarId,
    favoritePastime: (child.favoritePastime ?? '').trim(),
    pandaSuperpower: (child.pandaSuperpower ?? '').trim(),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateChild(
  uid: string,
  childId: string,
  updates: Partial<ChildInput>
): Promise<void> {
  const firestore: Firestore = db;
  const ref = doc(firestore, PARENTS, uid, CHILDREN, childId);
  await setDoc(ref, updates, { merge: true });
}
