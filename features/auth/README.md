# Auth & Role Select Gate

## Overview

- **One account**: Login creates a session. Role (Kid vs Caregiver) is a gate, not a separate account.
- **Kid path**: Frictionless. "I'm a Kid" → child home (tabs). No PIN.
- **Caregiver path**: "I'm an Adult" → PIN gate. If no PIN set, user sets one. PIN is hashed (SHA-256), never stored plaintext.

## Flow

1. **App launch**: If `hasPanda` (logged in) → Role Select. Else → Welcome.
2. **Login success**: → Role Select (not directly to tabs).
3. **Role Select**:
   - "I'm a Kid" → `setRole('kid')` → `(tabs)` (child home)
   - "I'm an Adult" → `caregiver-pin-gate`
4. **Caregiver PIN Gate**: If no PIN → Set PIN screen. Else → verify PIN → `setRole('caregiver')` → `(caregiver)` stack.
5. **Switch Role**: Clears role, returns to Role Select.

## Storage

- **Auth**: `@pandapal/auth` (AsyncStorage) – `{ hasPanda: boolean }`
- **Role**: `@pandapal/role` (AsyncStorage) – `"kid"` | `"caregiver"`
- **Caregiver PIN**: `@pandapal/caregiver_pin_hash` (SHA-256 hash only), `@pandapal/caregiver_pin_salt`

## Dev: Reset Caregiver PIN

- **In app**: Caregiver → Settings → "Reset Caregiver PIN" (dev only).
- **Code**: Call `clearCaregiverPin()` from `features/auth/storage/caregiverPinStorage.ts`.

## Testing

- **Kid flow**: Login → Role Select → "I'm a Kid" → see tabs (no Caregiver tab).
- **Caregiver flow**: Login → Role Select → "I'm an Adult" → Set PIN (first time) or enter PIN → Dashboard.
- **Switch Role**: Caregiver Dashboard → header "Switch Role" → Role Select.
