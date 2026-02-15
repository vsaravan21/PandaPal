/**
 * Pending care plan uploads (files + text) to be persisted after we have uid + childId.
 * Set when leaving caregiver-upload; consumed after create-panda (createChild).
 */

export type PendingFile = {
  uri: string;
  name: string;
  categoryId: string;
};

let pending: { files: PendingFile[]; clinicalText: string } | null = null;

export function setPendingCarePlan(files: PendingFile[], clinicalText: string): void {
  pending = { files, clinicalText };
}

export function getPendingCarePlan(): { files: PendingFile[]; clinicalText: string } | null {
  return pending;
}

export function clearPendingCarePlan(): void {
  pending = null;
}
