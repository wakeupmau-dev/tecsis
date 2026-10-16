export type Locale = "en" | "es";

const en = {
  nav: {
    home: "home",
    about: "about",
    contact: "contact",
  },
  hero: {
    title: "We stand behind the technology the industry measures with.",
    categories: ["Process control", "Quality control", "Materials research"],
    primaryCta: "Learn more",
    secondaryCta: "Learn more",
  },
  about: {
    title: "About",
    paragraphs: [
      "TECSIS IS A STRATEGIC PARTNER IN QUALITY AND PROCESS CONTROL, ASSET PROTECTION, AND MATERIAL ANALYSIS.",
      "FOR THE PAST 35 YEARS, WE HAVE BEEN PROVIDING STATE-OF-THE-ART SOLUTIONS TO THE MINING, ENERGY, CHEMICAL, METALLURGICAL, OIL & GAS, UNIVERSITY, CIRCULAR ECONOMY, PHARMACEUTICAL, AND ENVIRONMENTAL SECTORS.",
    ],
  },
  services: [
    {
      id: 1,
      section: "Sales",
      description:
        "Analytical and measurement instruments from the brands we represent.",
    },
    {
      id: 3,
      section: "Technical support",
      description:
        "Installation, commissioning, and preventive and corrective maintenance, with maintenance contracts available.",
    },
    {
      id: 4,
      section: "Consulting",
      description:
        "Expert guidance before and after your purchase, from choosing the right instrument to getting the most out of it.",
    },
    {
      id: 5,
      section: "Training",
      description:
        "Hands-on instruction so your team can operate every instrument with confidence.",
    },
    {
      id: 6,
      section: "Analysis and testing",
      description:
        "Sample analysis in our lab or on-site with portable equipment, plus mechanical testing in our lab.",
    },
  ],
  contact: {
    title: "Ready to discuss your challenge?",
    emailLabel: "email",
    submit: "Submit",
    submitted: "Sent",
    messages: {
      sent: "Thanks! Check your inbox for our products.",
      notSent:
        "We saved your email, but couldn't send the link. Try again in a moment.",
      invalid: "That email doesn't look right.",
      exists: "That email is already registered.",
      limited: "Too many attempts. Try again later.",
      failed: "Something went wrong. Try again.",
    },
  },
};

export type Content = typeof en;

const es: Content = {
  nav: {
    home: "inicio",
    about: "nosotros",
    contact: "contacto",
  },
  hero: {
    title: "Respaldamos la tecnología que la industria usa para decidir.",
    categories: [
      "Control de procesos",
      "Control de calidad",
      "Investigación de materiales",
    ],
    primaryCta: "Saber más",
    secondaryCta: "Saber más",
  },
  about: {
    title: "Nosotros",
    paragraphs: [
      "TECSIS ES UN ALIADO ESTRATEGICO EN EL CONTROL DE CALIDAD Y PROCESOS, PROTECCION DE ACTIVOS Y ANALISIS DE MATERIALES.",
      "DESDE HACE 35 AÑOS, DAMOS SOLUCIONES DE ULTIMA GENERACION A LA INDUSTRIA MINERA, ENERGETICA, QUIMICA, METALURGICA, OIL&GAS, UNIVERSIDADES, ECONOMIA CIRCULAR, FARMACEUTICAS, MEDIOAMBIENTAL.",
    ],
  },
  services: [
    {
      id: 1,
      section: "Venta",
      description:
        "Instrumentos de análisis y medición de las marcas que representamos.",
    },
    {
      id: 3,
      section: "Servicio técnico",
      description:
        "Instalación, puesta en marcha y mantenimiento preventivo y correctivo, con contratos de mantenimiento disponibles.",
    },
    {
      id: 4,
      section: "Asesoría",
      description:
        "Orientación experta antes y después de su compra, desde elegir el instrumento adecuado hasta sacarle el máximo provecho.",
    },
    {
      id: 5,
      section: "Capacitación",
      description:
        "Formación práctica para que su equipo opere cada instrumento con total confianza.",
    },
    {
      id: 6,
      section: "Análisis y ensayos",
      description:
        "Análisis de muestras en nuestro laboratorio o en terreno con equipos portátiles, además de ensayos mecánicos en laboratorio.",
    },
  ],
  contact: {
    title: "¿Listo para conversar sobre su desafío?",
    emailLabel: "correo electrónico",
    submit: "Enviar",
    submitted: "Enviado",
    messages: {
      sent: "¡Gracias! Revise su correo para ver nuestros productos.",
      notSent:
        "Guardamos su correo, pero no pudimos enviar el enlace. Inténtelo de nuevo en un momento.",
      invalid: "Ese correo no parece válido.",
      exists: "Ese correo ya está registrado.",
      limited: "Demasiados intentos. Inténtelo más tarde.",
      failed: "Algo salió mal. Inténtelo de nuevo.",
    },
  },
};

export const content: Record<Locale, Content> = { en, es };
