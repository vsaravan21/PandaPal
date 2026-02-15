/**
 * In-memory store for parent auth during setup flow.
 * Token is set after signup; pendingPin is set in CreatePin and cleared after ConfirmPin.
 * Do not log or persist PIN. Clear pendingPin after use.
 */

let parentToken: string | null = null;
let pendingPin: string | null = null;

export function setParentToken(token: string) {
  parentToken = token;
}

export function getParentToken(): string | null {
  return parentToken;
}

export function setPendingPin(pin: string) {
  pendingPin = pin;
}

export function getPendingPin(): string | null {
  return pendingPin;
}

export function clearPendingPin() {
  pendingPin = null;
}

export function clearParentAuth() {
  parentToken = null;
  pendingPin = null;
}
