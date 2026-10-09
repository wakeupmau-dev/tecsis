const isProduction = process.env.NODE_ENV === "production";

export const rpName = "Tecsis";

export function rpID() {
  return readEnv("WEBAUTHN_RP_ID", "localhost");
}

export function rpOrigin() {
  return readEnv("WEBAUTHN_ORIGIN", "http://localhost:5173");
}

function readEnv(name: string, devFallback: string) {
  const value = process.env[name];
  if (value) return value;
  if (isProduction) throw new Error(`${name} is not set`);
  return devFallback;
}
