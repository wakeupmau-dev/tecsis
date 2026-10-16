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
  },
  about: {
    title: "About",
    paragraphs: [
      "Tecsis is a strategic partner in quality and process control, asset protection, and material analysis.",
      "For the past 35 years, we have been providing state-of-the-art solutions to the mining, energy, chemical, metallurgical, oil & gas, university, circular economy, pharmaceutical, and environmental sectors.",
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
  helpForm: {
    title: "Let's get in touch",
    nameLabel: "name",
    companyLabel: "company",
    roleLabel: "position",
    emailLabel: "email",
    submit: "Submit",
    open: "Contact us",
    messages: {
      saved: "Thanks! We'll be in touch soon.",
      invalid: "That email doesn't look right.",
      limited: "Too many attempts. Try again later.",
      failed: "Something went wrong. Try again.",
    },
  },
  notFound: {
    message: "Page not found",
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
  },
  about: {
    title: "Nosotros",
    paragraphs: [
      "Tecsis es un aliado estratégico en el control de calidad y procesos, protección de activos y análisis de materiales.",
      "Desde hace 35 años, damos soluciones de última generación a la industria minera, energética, química, metalúrgica, oil & gas, universidades, economía circular, farmacéuticas, medioambiental.",
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
  helpForm: {
    title: "Pongámonos en contacto",
    nameLabel: "nombre",
    companyLabel: "empresa",
    roleLabel: "cargo",
    emailLabel: "correo",
    submit: "Enviar",
    open: "Contáctenos",
    messages: {
      saved: "¡Gracias! Nos pondremos en contacto pronto.",
      invalid: "Ese correo no parece válido.",
      limited: "Demasiados intentos. Inténtelo más tarde.",
      failed: "Algo salió mal. Inténtelo de nuevo.",
    },
  },
  notFound: {
    message: "Página no encontrada",
  },
};

export const content: Record<Locale, Content> = { en, es };
