export type FieldType = 'text' | 'email' | 'tel' | 'date' | 'number' | 'select' | 'textarea' | 'checkbox' | 'url' | 'stringList'

export type FieldDefinition = {
  name: string
  label: string
  type?: FieldType
  placeholder?: string
  options?: string[]
  span?: 1 | 2 | 3
  min?: number
  max?: number
  step?: number
  readOnly?: boolean
  required?: boolean
  help?: string
}

export type FormGroup = {
  title?: string
  description?: string
  fields: FieldDefinition[]
}

export type RepeaterDefinition = {
  name: string
  title: string
  itemLabel: string
  addLabel: string
  description?: string
  fields: FieldDefinition[]
}

export type ConsultantSection = {
  id: string
  title: string
  shortTitle: string
  description: string
  groups?: FormGroup[]
  repeaters?: RepeaterDefinition[]
  special?: 'documents' | 'expenses' | 'income' | 'postalAddress'
}

const yesNo = ['Sí', 'No']
const civilStatus = ['Soltero(a)', 'Casado(a)', 'Unión libre', 'Divorciado(a)', 'Viudo(a)', 'Otro']
const performanceOptions = ['Excelente', 'Muy bueno', 'Bueno', 'Regular', 'Malo', 'No aplica', 'No proporcionado']

export const officialDocuments = [
  'Acta de nacimiento',
  'Acta de matrimonio',
  'Acta de nacimiento de concubino(a) o cónyuge',
  'Actas de nacimiento de hijos',
  'INE o pasaporte',
  'Constancia de Situación Fiscal',
  'Número de seguridad social',
  'Comprobante de domicilio',
  'Hoja de retención de Infonavit',
  'Hoja de retención de Fonacot',
  'Constancias laborales',
  'Carta de recomendación personal',
  'Estado de cuenta BBVA',
]

export const expenseFields: FieldDefinition[] = [
  { name: 'rent', label: 'Renta mensual', type: 'number', min: 0 },
  { name: 'food', label: 'Alimentos', type: 'number', min: 0 },
  { name: 'clothing', label: 'Vestido y calzado', type: 'number', min: 0 },
  { name: 'tuition', label: 'Colegiaturas', type: 'number', min: 0 },
  { name: 'transport', label: 'Transporte', type: 'number', min: 0 },
  { name: 'alimony', label: 'Pensión', type: 'number', min: 0 },
  { name: 'vehicle', label: 'Gasolina / automóvil y servicios', type: 'number', min: 0 },
  { name: 'utilities', label: 'Servicios: agua, luz, teléfono y gas', type: 'number', min: 0 },
  { name: 'leisure', label: 'Diversión y esparcimiento', type: 'number', min: 0 },
  { name: 'infonavit', label: 'Infonavit', type: 'number', min: 0 },
]

export const incomeFields: FieldDefinition[] = [
  { name: 'gross_salary', label: 'Ingreso bruto mensual', type: 'number', min: 0, required: true },
  { name: 'commissions_vouchers', label: 'Comisiones y vales de despensa', type: 'number', min: 0 },
  { name: 'retirement_pension', label: 'Pensión por jubilación', type: 'number', min: 0 },
  { name: 'other_income', label: 'Otros ingresos', type: 'number', min: 0 },
]

const academicFields = (prefix: string): FieldDefinition[] => [
  { name: `${prefix}_start`, label: 'Inicio', type: 'date' },
  { name: `${prefix}_end`, label: 'Término', type: 'date' },
  { name: `${prefix}_institution`, label: 'Institución' },
  { name: `${prefix}_document`, label: 'Documento recibido' },
  { name: `${prefix}_location`, label: 'Localidad', span: 2 },
]

const performanceFields: FieldDefinition[] = [
  'Puntualidad y asistencia',
  'Actitud hacia el trabajo',
  'Actitud hacia sus compañeros',
  'Actitud hacia sus jefes',
  'Actitud hacia sus subordinados',
  'Cooperación',
  'Cumplimiento de objetivos',
  'Disciplina en el trabajo',
  'Iniciativa',
  'Responsabilidad',
  'Honradez',
  'Capacidad de mando',
  'Calidad en su trabajo',
].map((label, index) => ({ name: `performance_${index + 1}`, label, type: 'select' as const, options: performanceOptions }))

export const consultantSections: ConsultantSection[] = [
  {
    id: 'study',
    title: 'Apertura del expediente',
    shortTitle: 'Apertura del expediente',
    description: 'Abre el expediente y define el puesto para el que se realizará la investigación.',
    groups: [{ fields: [
      { name: 'position', label: 'Puesto al que aplica', placeholder: 'Ej. Ejecutivo de cuenta', span: 2 },
      { name: 'client_company', label: 'Empresa solicitante', placeholder: 'Ej. Lockton' },
      { name: 'study_folio', label: 'Folio interno', placeholder: 'Se generará en Supabase' },
    ] }],
  },
  {
    id: 'personal',
    title: 'Datos personales',
    shortTitle: 'Datos personales',
    description: 'Identificación general del candidato. La edad se calcula automáticamente.',
    groups: [{ fields: [
      { name: 'candidate_name', label: 'Nombre del candidato', span: 2, required: true },
      { name: 'rfc', label: 'RFC y homoclave' },
      { name: 'birth_date', label: 'Fecha de nacimiento', type: 'date', required: true },
      { name: 'birth_place', label: 'Lugar de nacimiento', required: true },
      { name: 'marital_regime', label: 'Régimen conyugal', type: 'select', options: ['No aplica', 'Sociedad conyugal', 'Separación de bienes', 'Otro'] },
      { name: 'imss_number', label: 'Número de afiliación al IMSS' },
      { name: 'email', label: 'Correo electrónico', type: 'email', required: true },
      { name: 'age', label: 'Edad', type: 'number', readOnly: true, help: 'Se completa desde la fecha de nacimiento.' },
      { name: 'nationality', label: 'Nacionalidad', required: true },
      { name: 'civil_status', label: 'Estado civil', type: 'select', options: civilStatus, required: true },
      { name: 'education_level', label: 'Grado de estudios' },
      { name: 'curp', label: 'CURP', span: 2, required: true },
    ] }],
  },
  {
    id: 'address',
    title: 'Domicilio',
    shortTitle: 'Domicilio',
    description: 'El código postal busca colonia, municipio y estado; todos los campos permanecen editables.',
    special: 'postalAddress',
    groups: [{ fields: [
      { name: 'street_number', label: 'Calle y número', span: 2, required: true },
      { name: 'neighborhood', label: 'Colonia', required: true },
      { name: 'cross_streets', label: 'Entre calles' },
      { name: 'postal_code', label: 'Código postal', placeholder: '5 dígitos', required: true },
      { name: 'municipality', label: 'Delegación o municipio', required: true },
      { name: 'state', label: 'Estado', required: true },
      { name: 'time_at_address', label: 'Tiempo de radicar en el domicilio' },
      { name: 'time_in_city', label: 'Tiempo de radicar en la ciudad' },
      { name: 'home_phone', label: 'Teléfono particular', type: 'tel' },
      { name: 'mobile_phone', label: 'Teléfono móvil', type: 'tel', required: true },
      { name: 'emergency_phone', label: 'Teléfono de emergencia', type: 'tel' },
    ] }],
  },
  {
    id: 'documents',
    title: 'Documentación oficial presentada',
    shortTitle: 'Documentación',
    description: 'Marca lo recibido y registra la URL del archivo que posteriormente se almacenará en Cloudflare.',
    special: 'documents',
  },
  {
    id: 'external-family',
    title: 'Información extra familiar',
    shortTitle: 'Extra familiar',
    description: 'Posibles relaciones familiares con seguros, gobierno o partidos políticos.',
    groups: [
      { title: 'Sector seguros', fields: [
        { name: 'insurance_relative', label: '¿Tiene familiares que trabajen en seguros?', type: 'select', options: yesNo },
        { name: 'insurance_name', label: 'Nombre' },
        { name: 'insurance_company', label: 'Empresa o bróker' },
        { name: 'insurance_role', label: 'Cargo' },
      ] },
      { title: 'Gobierno', fields: [
        { name: 'government_relative', label: '¿Tiene familiares que trabajen en el gobierno?', type: 'select', options: yesNo },
        { name: 'government_name', label: 'Nombre' },
        { name: 'government_institution', label: 'Institución' },
        { name: 'government_role', label: 'Cargo' },
      ] },
      { title: 'Partidos políticos', fields: [
        { name: 'political_relative', label: '¿Tiene familiares que militen en algún partido?', type: 'select', options: yesNo },
        { name: 'political_party', label: '¿Cuál partido?', span: 2 },
      ] },
    ],
  },
  {
    id: 'general-result',
    title: 'Resultado general',
    shortTitle: 'Resultado general',
    description: 'Conclusión integral del estudio y clasificación operativa.',
    groups: [{ fields: [
      { name: 'result_status', label: 'Resultado', type: 'select', options: ['Pendiente', 'Recomendable', 'Recomendable con reservas', 'No recomendable', 'Requiere validación'], required: true },
      { name: 'risk_level', label: 'Nivel de riesgo', type: 'select', options: ['Sin evaluar', 'Bajo', 'Medio', 'Alto'] },
      { name: 'summary', label: 'Conclusión y observaciones generales', type: 'textarea', span: 2 },
    ] }],
  },
  {
    id: 'academic',
    title: 'Trayectoria académica',
    shortTitle: 'Trayectoria académica',
    description: 'Historial escolar y acreditaciones profesionales.',
    groups: [
      { title: 'Primaria', fields: academicFields('primary') },
      { title: 'Secundaria', fields: academicFields('secondary') },
      { title: 'Bachillerato', fields: academicFields('high_school') },
      { title: 'Licenciatura', fields: academicFields('degree') },
      { title: 'Acreditaciones', fields: [
        { name: 'title', label: 'Título' },
        { name: 'professional_license', label: 'Cédula profesional' },
      ] },
    ],
  },
  {
    id: 'languages',
    title: 'Idiomas',
    shortTitle: 'Idiomas',
    description: 'Idiomas, nivel declarado y documentos que lo avalan.',
    repeaters: [{
      name: 'items', title: 'Idioma', itemLabel: 'Idioma', addLabel: 'Agregar otro idioma',
      fields: [
        { name: 'language', label: 'Idioma' },
        { name: 'institution', label: 'Institución formadora' },
        { name: 'reading', label: '% lectura', type: 'number', min: 0, max: 100 },
        { name: 'conversation', label: '% conversación', type: 'number', min: 0, max: 100 },
        { name: 'comprehension', label: '% comprensión', type: 'number', min: 0, max: 100 },
        { name: 'supporting_document', label: 'Documento que avala' },
      ],
    }],
  },
  {
    id: 'dependents',
    title: 'Dependientes económicos',
    shortTitle: 'Dependientes',
    description: 'Personas que dependen económicamente del candidato.',
    repeaters: [{ name: 'items', title: 'Dependiente', itemLabel: 'Dependiente', addLabel: 'Agregar dependiente', fields: [
      { name: 'name', label: 'Nombre', span: 2 },
      { name: 'age', label: 'Edad', type: 'number', min: 0 },
      { name: 'relationship', label: 'Parentesco' },
      { name: 'lives_with_candidate', label: '¿Vive con el candidato?', type: 'select', options: yesNo },
    ] }],
  },
  {
    id: 'family-structure',
    title: 'Estructura familiar',
    shortTitle: 'Estructura familiar',
    description: 'Composición familiar, ocupación e información de contacto.',
    repeaters: [{ name: 'items', title: 'Familiar', itemLabel: 'Familiar', addLabel: 'Registrar otro familiar', fields: [
      { name: 'relationship', label: 'Familiar / parentesco', type: 'select', options: ['Padre', 'Madre', 'Cónyuge', 'Concubino(a)', 'Hijo(a)', 'Hermano(a)', 'Otro'] },
      { name: 'name', label: 'Nombre' },
      { name: 'age', label: 'Edad', type: 'number', min: 0 },
      { name: 'address', label: 'Domicilio', span: 2 },
      { name: 'civil_status', label: 'Estado civil', type: 'select', options: civilStatus },
      { name: 'education_level', label: 'Grado de estudios' },
      { name: 'occupation', label: 'Ocupación' },
      { name: 'salary', label: 'Sueldo mensual', type: 'number', min: 0 },
      { name: 'phone', label: 'Teléfono', type: 'tel' },
    ] }],
  },
  {
    id: 'contributors',
    title: 'Integrantes que contribuyen al ingreso mensual',
    shortTitle: 'Contribuyentes',
    description: 'Aportaciones al ingreso familiar mensual.',
    repeaters: [{ name: 'items', title: 'Contribuyente', itemLabel: 'Contribuyente', addLabel: 'Agregar contribuyente', fields: [
      { name: 'name', label: 'Nombre' },
      { name: 'relationship', label: 'Parentesco' },
      { name: 'monthly_income', label: 'Ingreso mensual', type: 'number', min: 0 },
      { name: 'notes', label: 'Observaciones', type: 'textarea', span: 2 },
    ] }],
  },
  {
    id: 'expenses',
    title: 'Egreso mensual',
    shortTitle: 'Egresos',
    description: 'Distribución del gasto mensual. El total se calcula automáticamente.',
    special: 'expenses',
    groups: [{ fields: expenseFields }],
  },
  {
    id: 'income',
    title: 'Ingreso mensual',
    shortTitle: 'Ingresos',
    description: 'Fuentes de ingreso mensual. El total se calcula automáticamente.',
    special: 'income',
    groups: [{ fields: incomeFields }],
  },
  {
    id: 'income-comment',
    title: 'Comentario de ingresos',
    shortTitle: 'Comentario de ingresos',
    description: 'Análisis de consistencia y contexto de los ingresos familiares.',
    groups: [{ fields: [
      { name: 'comment', label: 'Comentario de ingresos', type: 'textarea', span: 2 },
      { name: 'net_family_income', label: 'Ingreso neto mensual familiar', type: 'number', readOnly: true, help: 'Total de ingresos menos total de egresos.' },
    ] }],
  },
  {
    id: 'credits',
    title: 'Créditos activos del candidato',
    shortTitle: 'Créditos activos',
    description: 'Obligaciones crediticias vigentes.',
    repeaters: [{ name: 'items', title: 'Crédito', itemLabel: 'Crédito', addLabel: 'Agregar crédito', fields: [
      { name: 'institution', label: 'Institución' },
      { name: 'credit_type', label: 'Tipo de crédito' },
      { name: 'monthly_payment', label: 'Pago mensual', type: 'number', min: 0 },
      { name: 'overdue_balance', label: 'Saldo vencido', type: 'number', min: 0 },
      { name: 'remaining_balance', label: 'Saldo por pagar', type: 'number', min: 0 },
      { name: 'notes', label: 'Observaciones', type: 'textarea', span: 2 },
    ] }],
  },
  {
    id: 'assets',
    title: 'Bienes del candidato y cónyuge',
    shortTitle: 'Bienes',
    description: 'Inmuebles y automóviles del candidato o su cónyuge.',
    repeaters: [{ name: 'items', title: 'Bien', itemLabel: 'Bien', addLabel: 'Agregar bien', fields: [
      { name: 'type', label: 'Tipo', type: 'select', options: ['Inmueble', 'Automóvil', 'Otro'] },
      { name: 'description', label: 'Ubicación / modelo y marca', span: 2 },
      { name: 'estimated_value', label: 'Valor aproximado', type: 'number', min: 0 },
      { name: 'remaining_balance', label: 'Saldo por liquidar', type: 'number', min: 0 },
      { name: 'owner', label: 'Propietario' },
    ] }],
  },
  {
    id: 'household-items',
    title: 'Distribución del menaje del inmueble',
    shortTitle: 'Menaje',
    description: 'Inventario general del menaje observado.',
    repeaters: [{ name: 'items', title: 'Elemento', itemLabel: 'Elemento', addLabel: 'Agregar elemento', fields: [
      { name: 'type', label: 'Tipo de menaje', span: 2 },
      { name: 'quantity', label: 'Cantidad', type: 'number', min: 0 },
    ] }],
  },
  {
    id: 'housing',
    title: 'Descripción del inmueble',
    shortTitle: 'Inmueble',
    description: 'Condiciones de vivienda, zona y servicios disponibles.',
    groups: [
      { title: 'Características', fields: [
        { name: 'ownership_status', label: 'Estado del inmueble', type: 'select', options: ['Propio', 'Rentado', 'Prestado', 'Hipotecado', 'Otro'] },
        { name: 'rooms', label: 'La vivienda consta de', type: 'textarea', span: 2 },
        { name: 'zone_type', label: 'Tipo de zona' },
        { name: 'internal_condition', label: 'Conservación interna', type: 'select', options: ['Excelente', 'Buena', 'Regular', 'Mala'] },
        { name: 'external_condition', label: 'Conservación externa', type: 'select', options: ['Excelente', 'Buena', 'Regular', 'Mala'] },
      ] },
      { title: 'Servicios existentes en la zona', fields: [
        ...['Agua', 'Drenaje', 'Alumbrado público', 'Pavimentación', 'Banqueta', 'Medios de transporte accesibles', 'Teléfono', 'Recolección de basura'].map((label, index) => ({ name: `zone_service_${index + 1}`, label, type: 'checkbox' as const })),
      ] },
      { title: 'Servicios adicionales', fields: [
        ...['T.V. por cable', 'Internet', 'Teléfono fijo', 'Otro'].map((label, index) => ({ name: `additional_service_${index + 1}`, label, type: 'checkbox' as const })),
        { name: 'additional_other', label: 'Especifique otro servicio' },
      ] },
      { title: 'Observaciones', fields: [
        { name: 'household_condition', label: 'Condiciones del menaje', type: 'textarea', span: 2 },
        { name: 'housing_comments', label: 'Comentarios de la vivienda y zona', type: 'textarea', span: 2 },
      ] },
    ],
  },
  {
    id: 'employment',
    title: 'Trayectoria laboral',
    shortTitle: 'Trayectoria laboral',
    description: 'Verificación de empleos. Inicia con un registro y permite agregar los necesarios.',
    repeaters: [{ name: 'items', title: 'Experiencia laboral', itemLabel: 'Empresa', addLabel: 'Agregar otro empleo', fields: [
      { name: 'company', label: 'Empresa', span: 2 },
      { name: 'industry', label: 'Giro' },
      { name: 'address', label: 'Domicilio', span: 2 },
      { name: 'postal_code', label: 'Código postal' },
      { name: 'city', label: 'Población' },
      { name: 'state', label: 'Estado' },
      { name: 'phones', label: 'Teléfono(s)', type: 'tel' },
      { name: 'start_date', label: 'Fecha de ingreso', type: 'date' },
      { name: 'end_date', label: 'Fecha de salida', type: 'date' },
      { name: 'initial_position', label: 'Puesto inicial' },
      { name: 'final_position', label: 'Puesto final' },
      { name: 'initial_salary', label: 'Sueldo inicial', type: 'number', min: 0 },
      { name: 'final_salary', label: 'Sueldo final', type: 'number', min: 0 },
      { name: 'leaving_reason', label: 'Motivo de salida', type: 'textarea', span: 2 },
      { name: 'direct_manager', label: 'Jefe inmediato' },
      ...performanceFields,
      { name: 'disabilities', label: 'Incapacidades', type: 'textarea', span: 2 },
      { name: 'would_rehire', label: '¿Lo recontratarían?', type: 'select', options: ['Sí', 'No', 'Con reservas', 'No proporcionado'] },
      { name: 'union_member', label: '¿Perteneció a algún sindicato?', type: 'select', options: yesNo },
      { name: 'union_name', label: 'Nombre del sindicato' },
      { name: 'provided_by', label: 'Información proporcionada por' },
      { name: 'provider_position', label: 'Puesto de quien informa' },
      { name: 'comment', label: 'Comentario', type: 'textarea', span: 2 },
    ] }],
  },
  {
    id: 'references',
    title: 'Referencias personales',
    shortTitle: 'Referencias',
    description: 'Referencias proporcionadas por el candidato.',
    repeaters: [{ name: 'items', title: 'Referencia', itemLabel: 'Referencia', addLabel: 'Agregar referencia', fields: [
      { name: 'name', label: 'Nombre', span: 2 },
      { name: 'relationship', label: 'Parentesco' },
      { name: 'known_time', label: 'Tiempo de conocerse' },
      { name: 'phone', label: 'Teléfono', type: 'tel' },
      { name: 'occupation', label: 'Ocupación' },
      { name: 'how_met', label: '¿Cómo se conocieron?' },
      { name: 'visit_frequency', label: '¿Con qué frecuencia se visitan?' },
      { name: 'reference', label: 'Referencia / comentario', type: 'textarea', span: 2 },
    ] }],
  },
  {
    id: 'medical',
    title: 'Antecedentes médicos',
    shortTitle: 'Antecedentes médicos',
    description: 'Información sensible. En producción requerirá consentimiento expreso y acceso restringido.',
    groups: [{ fields: [
      { name: 'general_health', label: '¿Cómo considera su estado de salud general?', type: 'select', options: ['Excelente', 'Bien', 'Regular', 'Mal', 'Muy mal'] },
      { name: 'treatment_disease', label: 'Enfermedad que requiera tratamiento o seguimiento', type: 'textarea', span: 2 },
      { name: 'contagious_disease', label: 'Enfermedad contagiosa actual o previa. ¿Cuál?', type: 'textarea', span: 2 },
      { name: 'recent_surgery', label: 'Intervención quirúrgica en los últimos 5 años', type: 'textarea', span: 2 },
      { name: 'pregnant', label: '¿Se encuentra embarazada?', type: 'select', options: ['Sí', 'No', 'No aplica', 'Prefiere no responder'] },
      { name: 'vision_problem', label: 'Problema de la vista. ¿Cuál? ¿Usa lentes?', type: 'textarea', span: 2 },
      { name: 'hypertension', label: '¿Presenta problemas de hipertensión?', type: 'select', options: yesNo },
      { name: 'current_treatment', label: 'Tratamiento médico actual. Especifique', type: 'textarea', span: 2 },
      { name: 'alcohol_frequency', label: 'Frecuencia de consumo de bebidas alcohólicas' },
      { name: 'smoking_frequency', label: 'Frecuencia con que fuma' },
      { name: 'family_history', label: 'Antecedentes médicos importantes en familiares directos', type: 'textarea', span: 2 },
    ] }],
  },
  {
    id: 'leisure',
    title: 'Esparcimiento',
    shortTitle: 'Esparcimiento',
    description: 'Hábitos, actividades e intereses personales.',
    groups: [{ fields: [
      { name: 'sports', label: '¿Practica algún deporte? ¿Con qué frecuencia?', type: 'textarea', span: 2 },
      { name: 'hobby', label: 'Pasatiempo favorito' },
      { name: 'reading', label: '¿Le gusta leer? Especifique' },
      { name: 'cultural_events', label: '¿Asiste a eventos culturales? ¿Cuáles?', type: 'textarea', span: 2 },
      { name: 'life_project', label: 'Proyecto de vida', type: 'textarea', span: 2 },
    ] }],
  },
  {
    id: 'visits',
    title: 'Visitas',
    shortTitle: 'Visitas',
    description: 'Registro de visitas y URLs de fotografías almacenadas en Cloudflare.',
    repeaters: [{ name: 'items', title: 'Visita', itemLabel: 'Visita', addLabel: 'Agregar otra visita', fields: [
      { name: 'visit_date', label: 'Fecha de visita', type: 'date' },
      { name: 'responsible', label: 'Responsable' },
      { name: 'photo_urls', label: 'URLs de fotografías', type: 'stringList', span: 2, help: 'La primera URL es obligatoria al guardar en producción.' },
      { name: 'notes', label: 'Observaciones de la visita', type: 'textarea', span: 2 },
    ] }],
  },
]

export const initialRepeaterData = consultantSections.reduce<Record<string, Record<string, unknown>>>(
  (result, section) => {
    if (!section.repeaters) return result
    result[section.id] = Object.fromEntries(section.repeaters.map((repeater) => [repeater.name, [{}]]))
    return result
  },
  {},
)
