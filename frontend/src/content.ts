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
      "Tecsis is a partner in process control, quality control, and materials research. For 35 years, we’ve brought state-of-the-art analytical instruments to research and academia, mining and materials, energy, chemicals, and environmental monitoring.",
      "Our technical team is trained directly by the manufacturers we represent, so when your equipment needs installation, maintenance, or expert guidance, you get support straight from the source.",
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
      id: 2,
      section: "Rental",
      description:
        "Access the equipment you need, for as long as you need it, without buying it.",
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
    messages: {
      sent: "Thanks! Check your inbox for our products.",
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
      "Tecsis es un aliado en control de procesos, control de calidad e investigación de materiales. Desde hace 35 años, llevamos instrumentación analítica de última generación a la academia y la investigación, la minería y los materiales, la energía, la química y el monitoreo ambiental.",
      "Nuestro equipo técnico se capacita directamente con los fabricantes que representamos, para que la instalación, el mantenimiento y la asesoría de sus equipos cuenten con respaldo de primera mano.",
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
      id: 2,
      section: "Arriendo",
      description:
        "Acceda al equipo que necesita, por el tiempo que lo necesite, sin tener que comprarlo.",
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
    messages: {
      sent: "¡Gracias! Revise su correo para ver nuestros productos.",
      invalid: "Ese correo no parece válido.",
      exists: "Ese correo ya está registrado.",
      limited: "Demasiados intentos. Inténtelo más tarde.",
      failed: "Algo salió mal. Inténtelo de nuevo.",
    },
  },
};

export const content: Record<Locale, Content> = { en, es };
