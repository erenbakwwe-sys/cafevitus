/**
 * Security & Anti-Fraud Suite for Cafe Vitus QR Ordering
 */

// Snekkersten Havn Coordinates (Denmark)
export const RESTAURANT_COORDINATES = {
  latitude: 55.9922,
  longitude: 12.5855,
  allowedRadiusMeters: 500, // 500 meters radius around the harbor
};

/**
 * 1. Rate Limiting & Anti-Spam (prevents flood orders from same device)
 */
export function checkOrderRateLimit(tableId: string): { allowed: boolean; waitSeconds?: number } {
  try {
    const lastOrderTimeStr = localStorage.getItem(`cv_last_order_${tableId}`);
    if (!lastOrderTimeStr) return { allowed: true };

    const lastOrderTime = parseInt(lastOrderTimeStr, 10);
    const elapsedSeconds = Math.floor((Date.now() - lastOrderTime) / 1000);
    const COOLDOWN_SECONDS = 45; // 45 seconds between order submissions

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
 * 2. GPS Geolocation Radius Check
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
    // If browser doesn't support geolocation, allow with waiter POS approval
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
        // If user denied permission or on desktop, don't break the customer flow; waiter POS approval will handle it
        resolve({ isNear: true, error: err.message });
      },
      { timeout: 6000, enableHighAccuracy: false }
    );
  });
}
