export type Coords = { latitude: number; longitude: number; accuracyM?: number };

export function getCurrentPosition(timeoutMs = 10_000): Promise<Coords> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Geolocation không khả dụng'));
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracyM: pos.coords.accuracy ? Math.round(pos.coords.accuracy) : undefined,
      }),
      (err) => reject(new Error(err.message)),
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 60_000 },
    );
  });
}

export function isInVietnam(c: Coords): boolean {
  return c.latitude >= 8 && c.latitude <= 24 && c.longitude >= 102 && c.longitude <= 110;
}
