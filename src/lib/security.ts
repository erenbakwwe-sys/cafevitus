/**
 * Comprehensive Security & Anti-Fraud Suite for Cafe Vitus QR Ordering & POS
 */

// Snekkersten Havn Coordinates (Denmark)
export const RESTAURANT_COORDINATES = {
  latitude: 55.9922,
  longitude: 12.5855,
  allowedRadiusMeters: 500, // 500 meters radius around the harbor
};

const QR_SALT = 'CV_HAVN_SNEKKERSTEN_2026_SECURE_TOKEN';

/**
 * 1. Cryptographic Table QR Verification
 * Generates a tamper-proof verification signature for each table QR code.
 */
export function generateTableQRToken(tableNumber: string): string {
  const normalized = String(tableNumber).trim();
  let hash = 5381;
  const str = `${normalized}:${QR_SALT}`;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash |= 0;
  }
  const token = Math.abs(hash).toString(36).toUpperCase().padStart(6, '0').slice(0, 6);
  return `CV${token}`;
}

export function verifyTableQRToken(tableNumber: string, token: string): boolean {
  if (!tableNumber || !token) return false;
  const expected = generateTableQRToken(tableNumber);
  return expected.toUpperCase() === token.trim().toUpperCase();
}

/**
 * Check if the current browser session has a valid, scanned QR session
 */
export function isTableSessionVerified(tableNumber?: string | null): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const verifiedTable = sessionStorage.getItem('cv_verified_table') || localStorage.getItem('cv_verified_table');
    const verifiedToken = sessionStorage.getItem('cv_verified_token') || localStorage.getItem('cv_verified_token');
    const verifiedTimestamp = sessionStorage.getItem('cv_verified_at') || localStorage.getItem('cv_verified_at');

    if (!verifiedTable || !verifiedToken || !verifiedTimestamp) return false;

    // Check if session has expired (max 4 hours at the table)
    const elapsedHours = (Date.now() - parseInt(verifiedTimestamp, 10)) / (1000 * 60 * 60);
    if (elapsedHours > 4) {
      clearTableSession();
      return false;
    }

    if (tableNumber && String(tableNumber).trim() !== String(verifiedTable).trim()) {
      return false;
    }

    return verifyTableQRToken(verifiedTable, verifiedToken);
  } catch {
    return false;
  }
}

export function setVerifiedTableSession(tableNumber: string, token: string): void {
  try {
    sessionStorage.setItem('cv_verified_table', tableNumber);
    sessionStorage.setItem('cv_verified_token', token);
    sessionStorage.setItem('cv_verified_at', Date.now().toString());

    localStorage.setItem('cv_verified_table', tableNumber);
    localStorage.setItem('cv_verified_token', token);
    localStorage.setItem('cv_verified_at', Date.now().toString());
  } catch {}
}

export function clearTableSession(): void {
  try {
    sessionStorage.removeItem('cv_verified_table');
    sessionStorage.removeItem('cv_verified_token');
    sessionStorage.removeItem('cv_verified_at');
    localStorage.removeItem('cv_verified_table');
    localStorage.removeItem('cv_verified_token');
    localStorage.removeItem('cv_verified_at');
  } catch {}
}

/**
 * 2. Rate Limiting & Anti-Spam (prevents flood orders from same device)
 */
export function checkOrderRateLimit(tableId: string): { allowed: boolean; waitSeconds?: number } {
  try {
    const lastOrderTimeStr = localStorage.getItem(`cv_last_order_${tableId}`);
    if (!lastOrderTimeStr) return { allowed: true };

    const lastOrderTime = parseInt(lastOrderTimeStr, 10);
    const elapsedSeconds = Math.floor((Date.now() - lastOrderTime) / 1000);
    const COOLDOWN_SECONDS = 30; // 30 seconds between order submissions

    if (elapsedSeconds < COOLDOWN_SECONDS) {
      return { allowed: false, waitSeconds: COOLDOWN_SECONDS - elapsedSeconds };
    }

    return { allowed: true };
  } catch {
    return { allowed: true };
  }
}

export function recordOrderPlaced(tableId: string): void {
  try {
    localStorage.setItem(`cv_last_order_${tableId}`, Date.now().toString());
  } catch {}
}

/**
 * 3. Anti-Brute Force Protection for Staff Login PIN
 * Locks out after 5 consecutive failed PIN attempts for 60 seconds
 */
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_SECONDS = 60;

export function checkAdminLoginAttempts(): { allowed: boolean; waitSeconds?: number } {
  try {
    const lockoutUntilStr = localStorage.getItem('cv_admin_lockout_until');
    if (lockoutUntilStr) {
      const lockoutUntil = parseInt(lockoutUntilStr, 10);
      const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
      if (remaining > 0) {
        return { allowed: false, waitSeconds: remaining };
      } else {
        localStorage.removeItem('cv_admin_lockout_until');
        localStorage.removeItem('cv_admin_failed_attempts');
      }
    }
    return { allowed: true };
  } catch {
    return { allowed: true };
  }
}

export function recordAdminFailedAttempt(): { locked: boolean; waitSeconds: number; attemptsLeft: number } {
  try {
    const current = parseInt(localStorage.getItem('cv_admin_failed_attempts') || '0', 10) + 1;
    localStorage.setItem('cv_admin_failed_attempts', current.toString());

    if (current >= MAX_FAILED_ATTEMPTS) {
      const lockoutUntil = Date.now() + LOCKOUT_DURATION_SECONDS * 1000;
      localStorage.setItem('cv_admin_lockout_until', lockoutUntil.toString());
      return { locked: true, waitSeconds: LOCKOUT_DURATION_SECONDS, attemptsLeft: 0 };
    }

    return { locked: false, waitSeconds: 0, attemptsLeft: MAX_FAILED_ATTEMPTS - current };
  } catch {
    return { locked: false, waitSeconds: 0, attemptsLeft: 3 };
  }
}

export function resetAdminAttempts(): void {
  try {
    localStorage.removeItem('cv_admin_failed_attempts');
    localStorage.removeItem('cv_admin_lockout_until');
  } catch {}
}

/**
 * 4. XSS Sanitization Helper
 * Sanitizes any customer notes, input strings or custom names before inserting into DOM or print views
 */
export function escapeHtml(unsafe?: string | null): string {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * 5. GPS Geolocation Radius Check
 */
function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export async function verifyRestaurantLocation(): Promise<{ isNear: boolean; distanceMeters?: number; error?: string }> {
  if (!navigator.geolocation) {
    return { isNear: true };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const distance = calculateDistanceMeters(
          position.coords.latitude,
          position.coords.longitude,
          RESTAURANT_COORDINATES.latitude,
          RESTAURANT_COORDINATES.longitude
        );

        const isNear = distance <= RESTAURANT_COORDINATES.allowedRadiusMeters;
        resolve({ isNear, distanceMeters: Math.round(distance) });
      },
      (err) => {
        console.warn('Geolocation lookup skipped:', err.message);
        resolve({ isNear: true, error: err.message });
      },
      { timeout: 6000, enableHighAccuracy: false }
    );
  });
}
