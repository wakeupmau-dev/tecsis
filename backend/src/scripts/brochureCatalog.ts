// Brand, description and logo for each top-level folder in "Landing page
// FOREDE", keyed by the folder's exact name. The upload script merges these
// into the manifest entry of every PDF found under that folder. `logo` is the
// Cloudinary public id from frontend/src/data/logos.json.
export const brochureCatalog: Record<
  string,
  { brand: string; description: string; logo: string }
> = {
  "Equipamiento para pruebas en transformadores HIGHTEST": {
    brand: "HIGHTEST",
    description: "Equipamiento para pruebas en transformadores",
    logo: "logos/hightest",
  },
  "Equipos Laser para analisis de Mecanica de Fluidos DANTEC DYNAMICS": {
    brand: "DANTEC DYNAMICS",
    description: "Equipos láser para análisis de mecánica de fluidos",
    logo: "logos/dantec-dynamics",
  },
  "Equipos de ensayos y preparacion de muestras PRIDE": {
    brand: "PRIDE",
    description: "Equipos de ensayos y preparación de muestras",
    logo: "logos/pride",
  },
  "Equipos de monitoreo de condicion de Transformadores ELECTRON": {
    brand: "ELECTRON",
    description: "Equipos de monitoreo de condición de transformadores",
    logo: "logos/electron",
  },
  "Equipos de pruebas en cables y equipos de alta tension HIPOTRONICS": {
    brand: "HIPOTRONICS",
    description: "Equipos de pruebas en cables y equipos de alta tensión",
    logo: "logos/hipotronics",
  },
  "Equipos para mediciones acusticas BRUEL&KJAER": {
    brand: "BRUEL&KJAER",
    description: "Equipos para mediciones acústicas",
    logo: "logos/bruel-kjaer",
  },
  "Equipos para pruebas de calidad de energia POWERSIDE": {
    brand: "POWERSIDE",
    description: "Equipos para pruebas de calidad de energía",
    logo: "logos/powerside",
  },
  "Equipos para pruebas en Transformadores HAEFELY": {
    brand: "HAEFELY",
    description: "Equipos para pruebas en transformadores",
    logo: "logos/haefely",
  },
  "Espectrometros LIBS LIGHTIGO": {
    brand: "LIGHTIGO",
    description: "Espectrómetros LIBS",
    logo: "logos/lightigo",
  },
  "Espectrometros portables de XRF THERMO NITON": {
    brand: "THERMO NITON",
    description: "Espectrómetros portátiles de XRF",
    // Niton is Thermo Scientific's XRF line (confirmed by Tecsis).
    logo: "logos/thermo-scientific",
  },
  "Instrumentos de Laboratorio de alta gama XRF SCIENTIFIC": {
    brand: "XRF SCIENTIFIC",
    description: "Instrumentos de laboratorio de alta gama",
    // Same company as the "xrf technology" logo (confirmed by Tecsis).
    logo: "logos/xrf-technology",
  },
  "Sonometros CRYSOUND": {
    brand: "CRYSOUND",
    description: "Sonómetros",
    logo: "logos/crysound",
  },
  "Ups REROS": {
    brand: "REROS",
    description: "UPS",
    logo: "logos/reros",
  },
};
