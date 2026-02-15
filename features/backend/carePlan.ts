/**
 * Care plan: clinical instructions (Firestore) and PDF uploads (Storage + metadata).
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
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import * as FileSystem from 'expo-file-system';

const PARENTS = 'parents';
const CHILDREN = 'children';
const DOCUMENTS = 'documents';
const CARE_INSTRUCTIONS = 'careInstructions';
const STORAGE_PREFIX = 'care-docs';

export async function addClinicalInstructions(
  uid: string,
  childId: string,
  content: string
): Promise<string> {
  const trimmed = content.trim();
  if (!trimmed) throw new Error('Content is empty');
  const firestore: Firestore = db;
  const col = collection(firestore, PARENTS, uid, CHILDREN, childId, CARE_INSTRUCTIONS);
  const ref = await addDoc(col, {
    content: trimmed,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export type UploadCareDocResult = {
  docId: string;
  downloadURL: string;
  filePath: string;
};

export async function uploadCareDoc(
  uid: string,
  childId: string,
  type: string,
  localFileUri: string
): Promise<UploadCareDocResult> {
  const firestore: Firestore = db;
  const docId = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const filePath = `${STORAGE_PREFIX}/${uid}/${childId}/${docId}.pdf`;

  const fileContent = await FileSystem.readAsStringAsync(localFileUri, {
    encoding: 'base64',
  });
  const blob = await base64ToBlob(fileContent);
  const storageRef = ref(storage, filePath);

  const uploadTask = uploadBytesResumable(storageRef, blob);
  await new Promise<void>((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      () => {},
      reject,
      () => resolve()
    );
  });

  const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

  const metaRef = doc(firestore, PARENTS, uid, CHILDREN, childId, DOCUMENTS, docId);
  await setDoc(metaRef, {
    type,
    filePath,
    downloadURL,
    createdAt: serverTimestamp(),
  });

  return { docId, downloadURL, filePath };
}

function base64ToBlob(base64: string): Promise<Blob> {
  return fetch(`data:application/pdf;base64,${base64}`).then((r) => r.blob());
}
