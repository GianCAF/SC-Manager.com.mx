export type Service = {
  number: string
  title: string
  description: string
  image: string
  bullets?: Array<{ label?: string; text: string }>
  cards?: Array<{ title: string; text: string }>
  imageRight?: boolean
}

export const services: Service[] = [
  {
    number: '01',
    title: 'Investigación de Estudios Socioeconómicos',
    description: 'Realizamos estudios socioeconómicos con el objetivo de verificar la información personal, familiar, económica y patrimonial de los candidatos o solicitantes, proporcionando información confiable para la toma de decisiones.',
    image: '/imagenes/img5.png',
    bullets: [
      { label: 'Presenciales:', text: 'Visitas domiciliarias para validar las condiciones de vivienda, entorno familiar, referencias personales y situación socioeconómica del candidato.' },
      { label: 'Virtuales:', text: 'Entrevistas realizadas mediante plataformas digitales, verificando la información proporcionada de manera remota con el mismo nivel de confiabilidad.' },
      { label: 'Crediticios:', text: 'Análisis del historial y comportamiento financiero del candidato para conocer su nivel de responsabilidad económica y capacidad de manejo financiero.' },
      { label: 'Para Becas:', text: 'Evaluación socioeconómica orientada a instituciones educativas u organizaciones que requieren verificar la situación económica de los aspirantes a programas de apoyo.' },
    ],
  },
  {
    number: '02',
    title: 'Investigación de Estudios laborales',
    description: 'Verificamos la experiencia laboral de los candidatos mediante la validación de información proporcionada en su historial profesional, ayudando a reducir riesgos en los procesos de contratación.',
    image: '/imagenes/img4.png',
    imageRight: true,
    bullets: [
      { text: 'Verificación de empresas donde laboró.' },
      { text: 'Confirmación de puestos desempeñados.' },
      { text: 'Validación de fechas de ingreso y salida.' },
      { text: 'Motivos de separación laboral.' },
      { text: 'Referencias laborales.' },
      { text: 'Confirmación de desempeño y conducta laboral.' },
    ],
  },
  {
    number: '03',
    title: 'Investigación de Incidencias Legales',
    description: 'Protegemos su patrimonio y reputación mediante la búsqueda exhaustiva de antecedentes legales. Contamos con acceso a bases de datos actualizadas y procesos legales de consulta legítima.',
    image: '/imagenes/img3.png',
    cards: [
      { title: 'Penal y Civil', text: 'Búsqueda en boletines judiciales y registros estatales.' },
      { title: 'Laboral', text: 'Identificación de demandas contra antiguos empleadores.' },
      { title: 'Administrativo', text: 'Verificación en registros de servidores públicos y sanciones.' },
      { title: 'Internacional', text: 'Listas de vigilancia y control global (OFAC, Interpol).' },
    ],
  },
  {
    number: '04',
    title: 'Investigación de Reclutamiento',
    description: 'Apoyamos a las organizaciones en la búsqueda y atracción del talento adecuado mediante procesos de reclutamiento eficientes, identificando candidatos que cumplan con el perfil requerido para cada vacante.',
    image: '/imagenes/img2.png',
    bullets: [
      { text: 'Publicación de vacantes.' },
      { text: 'Atracción de talento.' },
      { text: 'Búsqueda de candidatos.' },
      { text: 'Entrevistas iniciales.' },
      { text: 'Evaluación de perfiles.' },
      { text: 'Presentación de candidatos.' },
      { text: 'Seguimiento del proceso de reclutamiento.' },
    ],
  },
  {
    number: '05',
    title: 'Publicidad y Marketing',
    description: 'Diseñamos estrategias de publicidad y marketing para fortalecer la imagen de las empresas, incrementar su presencia en el mercado y atraer nuevos clientes mediante herramientas digitales y tradicionales.',
    image: '/imagenes/img.png',
    imageRight: true,
    bullets: [
      { text: 'Marketing digital.' },
      { text: 'Administración de redes sociales.' },
      { text: 'Diseño gráfico e identidad corporativa.' },
      { text: 'Creación de contenido publicitario.' },
      { text: 'Campañas de publicidad.' },
      { text: 'Posicionamiento de marca.' },
      { text: 'Estrategias de promoción y difusión.' },
    ],
  },
]

export const clientLogos = [
  { src: '/imagenes/consultores.jpeg', alt: 'Consultores', className: 'h-23' },
  { src: '/imagenes/frmedical.png', alt: 'FR Medical', className: 'h-20' },
  { src: '/imagenes/laboratorio.png', alt: 'Laboratorio', className: 'h-24' },
  { src: '/imagenes/lockton.png', alt: 'Lockton', className: 'h-24' },
  { src: '/imagenes/amarox.jpeg', alt: 'Amarox', className: 'h-25' },
]
