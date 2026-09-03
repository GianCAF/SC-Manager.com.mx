import { supabase } from '../../lib/supabase'
import { consultantSections } from './consultantFormConfig'

export type SectionValues = Record<string, unknown>
export type StudyDraftData = Record<string, SectionValues>

export type CandidateStudyResult = {
  studyId: string
  candidateId: string
  candidateName: string
  email: string
  folio: string
  position: string
  company: string
  status: string
  updatedAt: string
}

export type LoadedStudy = {
  draftId: string
  candidateId: string
  data: StudyDraftData
  completedSections: string[]
  createdAt: string
  updatedAt: string
  status: string
}

export type PersistedStudy = {
  studyId: string
  candidateId: string
  folio: string
  createdAt: string
  warning?: string
}

type Row = Record<string, unknown>

const sectionCodeById: Record<string, string> = {
  study: 'opening', personal: 'personal_data', address: 'address', documents: 'official_documents',
  'external-family': 'external_family', 'general-result': 'general_result', academic: 'academic_history',
  languages: 'languages', dependents: 'economic_dependents', 'family-structure': 'family_structure',
  contributors: 'income_contributors', expenses: 'monthly_expenses', income: 'monthly_income',
  'income-comment': 'income_comments', credits: 'active_credits', assets: 'assets',
  'household-items': 'household_items', housing: 'housing', employment: 'employment_history',
  references: 'personal_references', medical: 'medical_background', leisure: 'leisure', visits: 'visits',
}

const resultToUi: Record<string, string> = {
  pending: 'Pendiente', recommended: 'Recomendable', recommended_with_reservations: 'Recomendable con reservas',
  not_recommended: 'No recomendable', requires_validation: 'Requiere validación',
}
const resultToDb = Object.fromEntries(Object.entries(resultToUi).map(([key, value]) => [value, key]))
const riskToUi: Record<string, string> = { not_assessed: 'Sin evaluar', low: 'Bajo', medium: 'Medio', high: 'Alto', critical: 'Alto' }
const riskToDb = Object.fromEntries(Object.entries(riskToUi).map(([key, value]) => [value, key]))
const healthToUi: Record<string, string> = { excellent: 'Excelente', good: 'Bien', regular: 'Regular', bad: 'Mal', very_bad: 'Muy mal' }
const healthToDb = Object.fromEntries(Object.entries(healthToUi).map(([key, value]) => [value, key]))
const tenureToUi: Record<string, string> = { owned: 'Propio', rented: 'Rentado', borrowed: 'Prestado', mortgaged: 'Hipotecado', other: 'Otro' }
const tenureToDb = Object.fromEntries(Object.entries(tenureToUi).map(([key, value]) => [value, key]))
const documentCodes = [
  'birth_certificate', 'marriage_certificate', 'partner_birth_certificate', 'children_birth_certificate',
  'official_id', 'tax_status_certificate', 'social_security_number', 'proof_of_address',
  'infonavit_withholding', 'fonacot_withholding', 'employment_certificates', 'personal_recommendation', 'bbva_statement',
]
const academicCodes = ['primary', 'secondary', 'high_school', 'bachelor']
const academicPrefixes = ['primary', 'secondary', 'high_school', 'degree']
const housingServiceCodes = [
  'water', 'sewerage', 'street_lighting', 'paving', 'sidewalk', 'accessible_transport', 'telephone', 'garbage_collection',
  'cable_tv', 'internet', 'landline', 'other',
]

function rows(value: unknown): Row[] {
  return Array.isArray(value) ? value as Row[] : []
}

function row(value: unknown): Row | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Row : null
}

function text(value: unknown): string {
  return value === null || value === undefined ? '' : String(value)
}

function numberOrEmpty(value: unknown): number | '' {
  return value === null || value === undefined || value === '' ? '' : Number(value)
}

function boolToYesNo(value: unknown): string {
  return value === true ? 'Sí' : value === false ? 'No' : ''
}

function yesNoToBool(value: unknown): boolean | null {
  return value === 'Sí' ? true : value === 'No' ? false : null
}

function year(value: unknown): number | null {
  const parsed = Number(text(value).slice(0, 4))
  return Number.isInteger(parsed) && parsed >= 1900 && parsed <= 2200 ? parsed : null
}

function normalized(value: unknown): string {
  return text(value).trim().toLocaleLowerCase('es-MX')
}

function nonEmptyItems(values: SectionValues): SectionValues[] {
  return rows(values.items).filter((item) => Object.values(item).some((value) => value !== '' && value !== null && value !== undefined && value !== false))
}

async function selectRows(table: string, studyId: string, select = '*'): Promise<Row[]> {
  const { data, error } = await supabase.from(table).select(select).eq('study_id', studyId)
  if (error) throw error
  return rows(data)
}

async function selectOne(table: string, studyId: string): Promise<Row | null> {
  const { data, error } = await supabase.from(table).select('*').eq('study_id', studyId).maybeSingle()
  if (error) throw error
  return row(data)
}

export async function createCandidateStudy(data: StudyDraftData): Promise<PersistedStudy> {
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData.user) throw new Error('Tu sesión expiró. Inicia sesión nuevamente.')

  const userId = authData.user.id
  const companyName = text(data.study.client_company).trim() || 'No registrado'
  const { data: profileData, error: profileError } = await supabase.from('profiles').select('role').eq('id', userId).single()
  if (profileError) throw profileError

  const companyResponse = await supabase.from('client_companies').select('id,legal_name,trade_name').eq('is_active', true)
  if (companyResponse.error) throw companyResponse.error
  let company = rows(companyResponse.data).find((item) => [item.legal_name, item.trade_name].some((name) => normalized(name) === normalized(companyName)))

  if (!company) {
    if (text(row(profileData)?.role) !== 'admin') {
      throw new Error('La empresa solicitante no existe o no está disponible. Solicita a un administrador que la registre.')
    }
    const createdCompany = await supabase
      .from('client_companies')
      .insert({ legal_name: companyName, trade_name: companyName, created_by: userId })
      .select('id,legal_name,trade_name')
      .single()
    if (createdCompany.error) throw createdCompany.error
    company = row(createdCompany.data) ?? undefined
  }
  if (!company?.id) throw new Error('No fue posible identificar la empresa solicitante.')

  const personal = data.personal
  const candidatePayload = {
    full_name: text(personal.candidate_name).trim() || 'No registrado',
    rfc: /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/.test(text(personal.rfc).trim().toUpperCase()) ? text(personal.rfc).trim().toUpperCase() : null,
    birth_date: text(personal.birth_date) || null,
    birth_place: text(personal.birth_place) || null,
    marital_regime: text(personal.marital_regime) || null,
    imss_number: text(personal.imss_number) || null,
    email: text(personal.email).trim().toLowerCase() || null,
    nationality: text(personal.nationality) || null,
    marital_status: text(personal.civil_status) || null,
    education_level: text(personal.education_level) || null,
    curp: /^[A-Z][AEIOUX][A-Z]{2}[0-9]{6}[HM][A-Z]{5}[A-Z0-9][0-9]$/.test(text(personal.curp).trim().toUpperCase()) ? text(personal.curp).trim().toUpperCase() : null,
  }

  let candidateId = ''
  if (candidatePayload.curp) {
    const existingCandidate = await supabase.from('candidates').select('id').eq('curp', candidatePayload.curp).is('deleted_at', null).maybeSingle()
    if (existingCandidate.error) throw existingCandidate.error
    candidateId = text(row(existingCandidate.data)?.id)
  }

  if (candidateId) {
    const updatedCandidate = await supabase.from('candidates').update(candidatePayload).eq('id', candidateId)
    if (updatedCandidate.error) throw updatedCandidate.error
  } else {
    const createdCandidate = await supabase.from('candidates').insert({ ...candidatePayload, created_by: userId }).select('id').single()
    if (createdCandidate.error) throw createdCandidate.error
    candidateId = text(row(createdCandidate.data)?.id)
  }

  const createdStudy = await supabase
    .from('studies')
    .insert({ job_position: text(data.study.position).trim() || 'No registrado', client_company_id: text(company.id), created_by: userId })
    .select('id,folio,created_at')
    .single()
  if (createdStudy.error) throw createdStudy.error
  const study = row(createdStudy.data) ?? {}
  const studyId = text(study.id)
  const folio = text(study.folio)
  const createdAt = text(study.created_at)

  const link = await supabase.from('study_candidates').insert({ study_id: studyId, candidate_id: candidateId, created_by: userId })
  if (link.error) throw new Error('Se creó el expediente ' + folio + ', pero no fue posible vincular al cliente: ' + link.error.message)

  try {
    for (const section of consultantSections) {
      await saveCandidateStudySection(studyId, candidateId, section.id, data[section.id] ?? {})
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Error desconocido'
    return { studyId, candidateId, folio, createdAt, warning: 'El expediente quedó creado, pero alguna sección necesita volver a guardarse: ' + detail }
  }

  return { studyId, candidateId, folio, createdAt }
}
export async function searchCandidateStudies(term: string): Promise<CandidateStudyResult[]> {
  const normalized = term.trim().replaceAll('%', '').replaceAll('_', '')
  if (normalized.length < 2) return []

  const { data: candidateData, error: candidateError } = await supabase
    .from('candidates')
    .select('id,full_name,email')
    .ilike('full_name', `%${normalized}%`)
    .is('deleted_at', null)
    .order('full_name')
    .limit(20)
  if (candidateError) throw candidateError
  const candidates = rows(candidateData)
  if (!candidates.length) return []

  const candidateIds = candidates.map((candidate) => text(candidate.id))
  const { data: linkData, error: linkError } = await supabase.from('study_candidates').select('study_id,candidate_id').in('candidate_id', candidateIds)
  if (linkError) throw linkError
  const links = rows(linkData)
  if (!links.length) return []

  const studyIds = links.map((link) => text(link.study_id))
  const { data: studyData, error: studyError } = await supabase
    .from('studies')
    .select('id,folio,job_position,client_company_id,status_id,updated_at')
    .in('id', studyIds)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })
  if (studyError) throw studyError
  const studies = rows(studyData)

  const companyIds = [...new Set(studies.map((study) => text(study.client_company_id)).filter(Boolean))]
  const statusIds = [...new Set(studies.map((study) => text(study.status_id)).filter(Boolean))]
  const [companyResponse, statusResponse] = await Promise.all([
    companyIds.length ? supabase.from('client_companies').select('id,legal_name,trade_name').in('id', companyIds) : Promise.resolve({ data: [], error: null }),
    statusIds.length ? supabase.from('study_statuses').select('id,label').in('id', statusIds) : Promise.resolve({ data: [], error: null }),
  ])
  if (companyResponse.error) throw companyResponse.error
  if (statusResponse.error) throw statusResponse.error
  const companyById = new Map(rows(companyResponse.data).map((company) => [text(company.id), text(company.trade_name || company.legal_name)]))
  const statusById = new Map(rows(statusResponse.data).map((status) => [text(status.id), text(status.label)]))
  const candidateById = new Map(candidates.map((candidate) => [text(candidate.id), candidate]))
  const candidateIdByStudy = new Map(links.map((link) => [text(link.study_id), text(link.candidate_id)]))

  return studies.map((study) => {
    const candidateId = candidateIdByStudy.get(text(study.id)) ?? ''
    const candidate = candidateById.get(candidateId) ?? {}
    return {
      studyId: text(study.id), candidateId, candidateName: text(candidate.full_name), email: text(candidate.email),
      folio: text(study.folio), position: text(study.job_position), company: companyById.get(text(study.client_company_id)) ?? '',
      status: statusById.get(text(study.status_id)) ?? 'Sin estado', updatedAt: text(study.updated_at),
    }
  })
}

export async function loadCandidateStudy(studyId: string, emptyData: StudyDraftData): Promise<LoadedStudy> {
  const { data: linkData, error: linkError } = await supabase.from('study_candidates').select('candidate_id').eq('study_id', studyId).maybeSingle()
  if (linkError) throw linkError
  const candidateId = text(row(linkData)?.candidate_id)
  if (!candidateId) throw new Error('El expediente no tiene un cliente vinculado.')

  const [studyResponse, candidateResponse, progressResponse, address, result, expenses, income, incomeComment, housing, medical, leisure,
    externalFamily, academics, languages, dependents, family, contributors, credits, assets, household, employment, references, visits] = await Promise.all([
    supabase.from('studies').select('id,folio,job_position,client_company_id,status_id,created_at,updated_at').eq('id', studyId).single(),
    supabase.from('candidates').select('*').eq('id', candidateId).single(),
    supabase.from('section_progress').select('section_id,is_complete,section_definitions(code)').eq('study_id', studyId),
    selectOne('candidate_addresses', studyId), selectOne('study_results', studyId), selectOne('monthly_expenses', studyId),
    selectOne('monthly_income', studyId), selectOne('income_comments', studyId), selectOne('housing_details', studyId),
    selectOne('medical_background', studyId), selectOne('leisure_information', studyId), selectRows('external_family_connections', studyId),
    selectRows('academic_history', studyId, '*,academic_levels(code)'), selectRows('languages', studyId), selectRows('economic_dependents', studyId),
    selectRows('family_members', studyId), selectRows('income_contributors', studyId), selectRows('active_credits', studyId),
    selectRows('assets', studyId), selectRows('household_items', studyId), selectRows('employment_history', studyId),
    selectRows('personal_references', studyId), selectRows('visits', studyId),
  ])
  if (studyResponse.error) throw studyResponse.error
  if (candidateResponse.error) throw candidateResponse.error
  if (progressResponse.error) throw progressResponse.error
  const study = row(studyResponse.data) ?? {}
  const candidate = row(candidateResponse.data) ?? {}

  let company = ''
  if (study.client_company_id) {
    const response = await supabase.from('client_companies').select('legal_name,trade_name').eq('id', text(study.client_company_id)).maybeSingle()
    if (response.error) throw response.error
    const companyRow = row(response.data)
    company = text(companyRow?.trade_name || companyRow?.legal_name)
  }

  const data: StudyDraftData = structuredClone(emptyData)
  data.study = { position: text(study.job_position), client_company: company, study_folio: text(study.folio) }
  data.personal = {
    candidate_name: text(candidate.full_name), rfc: text(candidate.rfc), birth_date: text(candidate.birth_date), birth_place: text(candidate.birth_place),
    marital_regime: text(candidate.marital_regime), imss_number: text(candidate.imss_number), email: text(candidate.email),
    nationality: text(candidate.nationality), civil_status: text(candidate.marital_status), education_level: text(candidate.education_level), curp: text(candidate.curp),
  }
  data.address = address ? {
    street_number: text(address.street_and_number), neighborhood: text(address.neighborhood), cross_streets: text(address.between_streets),
    postal_code: text(address.postal_code), municipality: text(address.municipality), state: text(address.state),
    time_at_address: text(address.residence_duration), time_in_city: text(address.city_residence_duration), home_phone: text(address.home_phone),
    mobile_phone: text(address.mobile_phone), emergency_phone: text(address.emergency_phone),
  } : {}
  data['general-result'] = result ? { result_status: resultToUi[text(result.result)] ?? text(result.result), risk_level: riskToUi[text(result.risk_level)] ?? text(result.risk_level), summary: text(result.conclusion || result.general_observations) } : {}
  data.expenses = expenses ? { rent: numberOrEmpty(expenses.rent), food: numberOrEmpty(expenses.food), clothing: numberOrEmpty(expenses.clothing_and_footwear), tuition: numberOrEmpty(expenses.tuition), transport: numberOrEmpty(expenses.transportation), alimony: numberOrEmpty(expenses.alimony), vehicle: numberOrEmpty(expenses.fuel_and_vehicle_services), utilities: numberOrEmpty(expenses.utilities), leisure: numberOrEmpty(expenses.leisure), infonavit: numberOrEmpty(expenses.infonavit) } : {}
  data.income = income ? { gross_salary: numberOrEmpty(income.gross_monthly_income), commissions_vouchers: numberOrEmpty(income.commissions_and_vouchers), retirement_pension: numberOrEmpty(income.retirement_pension), other_income: numberOrEmpty(income.other_income) } : {}
  data['income-comment'] = incomeComment ? { comment: text(incomeComment.analysis_comment) } : {}
  data['external-family'] = mapExternalFamily(externalFamily)
  data.academic = mapAcademics(academics)
  data.languages = { items: languages.map((item) => ({ language: text(item.language_name), institution: text(item.training_institution), reading: numberOrEmpty(item.reading_pct), conversation: numberOrEmpty(item.conversation_pct), comprehension: numberOrEmpty(item.comprehension_pct), supporting_document: text(item.supporting_document) })) }
  data.dependents = { items: dependents.map((item) => ({ name: text(item.full_name), age: numberOrEmpty(item.age), relationship: text(item.relationship), lives_with_candidate: boolToYesNo(item.lives_with_candidate) })) }
  data['family-structure'] = { items: family.map((item) => ({ relationship: text(item.relationship), name: text(item.full_name), age: numberOrEmpty(item.age), address: text(item.address), civil_status: text(item.marital_status), education_level: text(item.education_level), occupation: text(item.occupation), salary: numberOrEmpty(item.salary), phone: text(item.phone) })) }
  data.contributors = { items: contributors.map((item) => ({ name: text(item.full_name), relationship: text(item.relationship), monthly_income: numberOrEmpty(item.monthly_income), notes: text(item.observations) })) }
  data.credits = { items: credits.map((item) => ({ institution: text(item.institution), credit_type: text(item.credit_type), monthly_payment: numberOrEmpty(item.monthly_payment), overdue_balance: numberOrEmpty(item.overdue_balance), remaining_balance: numberOrEmpty(item.balance_due), notes: text(item.observations) })) }
  data.assets = { items: assets.map((item) => ({ type: ({ real_estate: 'Inmueble', vehicle: 'Automóvil', other: 'Otro' } as Record<string, string>)[text(item.type)] ?? text(item.type), description: text(item.description || [item.location, item.model, item.brand].filter(Boolean).join(' / ')), estimated_value: numberOrEmpty(item.approximate_value), remaining_balance: numberOrEmpty(item.outstanding_balance), owner: text(item.owner) })) }
  data['household-items'] = { items: household.map((item) => ({ type: text(item.item_type), quantity: numberOrEmpty(item.quantity) })) }
  data.housing = housing ? { ownership_status: tenureToUi[text(housing.tenure)] ?? text(housing.tenure), rooms: text(housing.housing_composition), zone_type: text(housing.zone_type), internal_condition: text(housing.internal_conservation), external_condition: text(housing.external_conservation), household_condition: text(housing.household_condition), housing_comments: text(housing.housing_and_zone_comments) } : {}
  data.employment = { items: employment.map(mapEmployment) }
  data.references = { items: references.map((item) => ({ name: text(item.full_name), relationship: text(item.relationship), known_time: text(item.acquaintance_duration), phone: text(item.phone), occupation: text(item.occupation), how_met: text(item.how_met), visit_frequency: text(item.visit_frequency), reference: text(item.reference_comment) })) }
  data.medical = medical ? { general_health: healthToUi[text(medical.general_health)] ?? text(medical.general_health), treatment_disease: text(medical.illness_requires_followup), contagious_disease: text(medical.contagious_disease), recent_surgery: text(medical.surgery_last_five_years), pregnant: text(medical.pregnancy), vision_problem: text(medical.vision_problems), hypertension: text(medical.hypertension), current_treatment: text(medical.current_medical_treatment), alcohol_frequency: text(medical.alcohol_frequency), smoking_frequency: text(medical.smoking_frequency), family_history: text(medical.direct_family_medical_history) } : {}
  data.leisure = leisure ? { sports: text(leisure.sport_frequency), hobby: text(leisure.favorite_hobby), reading: text(leisure.preferred_readings), cultural_events: text(leisure.cultural_events), life_project: text(leisure.life_project) } : {}
  data.visits = { items: visits.map((item) => ({ visit_date: text(item.visit_at).slice(0, 10), responsible: text(item.responsible_profile_id), notes: text(item.observations), photo_urls: [''] })) }
  for (const key of Object.keys(data)) if (data[key]?.items && !rows(data[key].items).length) data[key].items = [{}]

  const completedCodes = new Set(rows(progressResponse.data).filter((item) => item.is_complete).map((item) => text(row(item.section_definitions)?.code)))
  const completedSections = Object.entries(sectionCodeById).filter(([, code]) => completedCodes.has(code)).map(([id]) => id)
  return { draftId: studyId, candidateId, data, completedSections, createdAt: text(study.created_at), updatedAt: text(study.updated_at) || new Date().toISOString(), status: 'Guardado' }
}

function mapExternalFamily(items: Row[]): SectionValues {
  const result: SectionValues = {}
  for (const item of items) {
    const type = text(item.connection_type)
    if (type === 'insurance') Object.assign(result, { insurance_relative: 'Sí', insurance_name: text(item.relative_name), insurance_company: text(item.organization_name), insurance_role: text(item.position_title) })
    if (type === 'government') Object.assign(result, { government_relative: 'Sí', government_name: text(item.relative_name), government_institution: text(item.organization_name), government_role: text(item.position_title) })
    if (type === 'political_party') Object.assign(result, { political_relative: 'Sí', political_party: text(item.political_party) })
  }
  return result
}

function mapAcademics(items: Row[]): SectionValues {
  const result: SectionValues = {}
  const prefixByCode: Record<string, string> = { primary: 'primary', secondary: 'secondary', high_school: 'high_school', bachelor: 'degree' }
  for (const item of items) {
    const prefix = prefixByCode[text(row(item.academic_levels)?.code)]
    if (!prefix) continue
    result[`${prefix}_start`] = item.start_year ? `${item.start_year}-01-01` : ''
    result[`${prefix}_end`] = item.end_year ? `${item.end_year}-01-01` : ''
    result[`${prefix}_institution`] = text(item.institution)
    result[`${prefix}_document`] = text(item.document_received)
    result[`${prefix}_location`] = text(item.locality)
    if (prefix === 'degree') { result.title = text(item.title_name); result.professional_license = text(item.professional_license) }
  }
  return result
}

function mapEmployment(item: Row): SectionValues {
  return { company: text(item.company_name), industry: text(item.business_line), address: text(item.address), postal_code: text(item.postal_code), city: text(item.locality), state: text(item.state), phones: text(item.phones), start_date: text(item.start_date), end_date: text(item.end_date), initial_position: text(item.initial_position), final_position: text(item.final_position), initial_salary: numberOrEmpty(item.initial_salary), final_salary: numberOrEmpty(item.final_salary), leaving_reason: text(item.leaving_reason), direct_manager: text(item.immediate_supervisor), disabilities: text(item.disabilities_or_absences), would_rehire: boolToYesNo(item.would_rehire), union_member: boolToYesNo(item.union_member), union_name: text(item.union_name), provided_by: text(item.information_provided_by), provider_position: text(item.provider_position), comment: text(item.comment) }
}

async function replaceRows(table: string, studyId: string, values: Row[]): Promise<void> {
  const deleteResponse = await supabase.from(table).delete().eq('study_id', studyId)
  if (deleteResponse.error) throw deleteResponse.error
  if (!values.length) return
  const insertResponse = await supabase.from(table).insert(values.map((value) => ({ ...value, study_id: studyId })))
  if (insertResponse.error) throw insertResponse.error
}

async function lookupIds(table: string, codes: string[]): Promise<Map<string, string>> {
  const response = await supabase.from(table).select('id,code').in('code', codes)
  if (response.error) throw response.error
  return new Map(rows(response.data).map((item) => [text(item.code), text(item.id)]))
}

async function saveDocuments(studyId: string, candidateId: string, values: SectionValues): Promise<void> {
  const documentTypeIds = await lookupIds('document_types', documentCodes)
  const driveLink = text(values.drive_link).trim()
  let fileAssetId: string | null = null
  if (driveLink) {
    const asset = await supabase.from('file_assets').upsert({
      provider: 'other', bucket: 'google-drive', object_key: driveLink, public_url: driveLink,
      original_name: 'Carpeta de documentos en Google Drive', mime_type: 'text/uri-list', size_bytes: 0,
      metadata: { purpose: 'candidate_official_documents' },
    }, { onConflict: 'provider,bucket,object_key' }).select('id').single()
    if (asset.error) throw asset.error
    fileAssetId = text(row(asset.data)?.id) || null
  }
  const selected = documentCodes.flatMap((code, index) => {
    const item = row(values['document_' + (index + 1)])
    return item?.presented && documentTypeIds.get(code)
      ? [{ candidate_id: candidateId, document_type_id: documentTypeIds.get(code), presented: true, file_asset_id: fileAssetId }]
      : []
  })
  await replaceRows('official_documents', studyId, selected)
}

async function saveExternalFamily(studyId: string, values: SectionValues): Promise<void> {
  const connections: Row[] = []
  if (values.insurance_relative === 'Sí') connections.push({ connection_type: 'insurance', relative_name: text(values.insurance_name) || null, organization_name: text(values.insurance_company) || null, position_title: text(values.insurance_role) || null })
  if (values.government_relative === 'Sí') connections.push({ connection_type: 'government', relative_name: text(values.government_name) || null, organization_name: text(values.government_institution) || null, position_title: text(values.government_role) || null })
  if (values.political_relative === 'Sí') connections.push({ connection_type: 'political_party', political_party: text(values.political_party) || null })
  await replaceRows('external_family_connections', studyId, connections)
}

async function saveAcademics(studyId: string, values: SectionValues): Promise<void> {
  const levelIds = await lookupIds('academic_levels', academicCodes)
  const records = academicPrefixes.flatMap((prefix, index) => {
    const hasData = [values[prefix + '_start'], values[prefix + '_end'], values[prefix + '_institution'], values[prefix + '_document'], values[prefix + '_location']].some(Boolean)
      || (prefix === 'degree' && (values.title || values.professional_license))
    if (!hasData) return []
    return [{
      academic_level_id: levelIds.get(academicCodes[index]),
      start_year: year(values[prefix + '_start']),
      end_year: year(values[prefix + '_end']),
      institution: text(values[prefix + '_institution']) || null,
      document_received: text(values[prefix + '_document']) || null,
      locality: text(values[prefix + '_location']) || null,
      title_name: prefix === 'degree' ? text(values.title) || null : null,
      professional_license: prefix === 'degree' ? text(values.professional_license) || null : null,
    }]
  })
  await replaceRows('academic_history', studyId, records)
}

async function saveHousingServices(studyId: string, values: SectionValues): Promise<void> {
  const serviceIds = await lookupIds('housing_service_types', housingServiceCodes)
  const records = housingServiceCodes.flatMap((code, index) => {
    const fieldName = index < 8 ? 'zone_service_' + (index + 1) : 'additional_service_' + (index - 7)
    if (!values[fieldName]) return []
    return [{ service_type_id: serviceIds.get(code), available: true, details: code === 'other' ? text(values.additional_other) || null : null }]
  }).filter((item) => item.service_type_id)
  await replaceRows('housing_services', studyId, records)
}

async function saveEmployment(studyId: string, values: SectionValues): Promise<void> {
  const remove = await supabase.from('employment_history').delete().eq('study_id', studyId)
  if (remove.error) throw remove.error
  const factorResponse = await supabase.from('performance_factor_definitions').select('id,sort_order').order('sort_order')
  const ratingResponse = await supabase.from('performance_rating_definitions').select('id,label')
  if (factorResponse.error) throw factorResponse.error
  if (ratingResponse.error) throw ratingResponse.error
  const factors = rows(factorResponse.data)
  const ratingByLabel = new Map(rows(ratingResponse.data).map((rating) => [text(rating.label), text(rating.id)]))

  for (const item of nonEmptyItems(values).filter((entry) => text(entry.company))) {
    const employment = await supabase.from('employment_history').insert({
      study_id: studyId, company_name: text(item.company), business_line: text(item.industry) || null,
      address: text(item.address) || null, postal_code: /^[0-9]{5}$/.test(text(item.postal_code)) ? text(item.postal_code) : null, locality: text(item.city) || null,
      state: text(item.state) || null, phones: text(item.phones) || null, start_date: text(item.start_date) || null,
      end_date: item.current_job ? null : text(item.end_date) || null, initial_position: text(item.initial_position) || null,
      final_position: text(item.final_position) || null, initial_salary: item.initial_salary || null, final_salary: item.final_salary || null,
      leaving_reason: text(item.leaving_reason) || null, immediate_supervisor: text(item.direct_manager) || null,
      disabilities_or_absences: text(item.disabilities) || null, would_rehire: yesNoToBool(item.would_rehire),
      union_member: yesNoToBool(item.union_member), union_name: item.union_member === 'Sí' ? text(item.union_name) || null : null,
      information_provided_by: text(item.provided_by) || null, provider_position: text(item.provider_position) || null,
      comment: text(item.comment) || null,
    }).select('id').single()
    if (employment.error) throw employment.error
    const performance = Object.entries(item).filter(([key, value]) => key.startsWith('performance_') && value).flatMap(([key, value]) => {
      const factor = factors[Number(key.replace('performance_', '')) - 1]
      const ratingId = ratingByLabel.get(text(value))
      return factor?.id && ratingId ? [{ study_id: studyId, employment_id: text(row(employment.data)?.id), factor_id: text(factor.id), rating_id: ratingId }] : []
    })
    if (performance.length) {
      const saved = await supabase.from('employment_performance').insert(performance)
      if (saved.error) throw saved.error
    }
  }
}

async function saveVisits(studyId: string, values: SectionValues): Promise<void> {
  const remove = await supabase.from('visits').delete().eq('study_id', studyId)
  if (remove.error) throw remove.error
  for (const item of nonEmptyItems(values).filter((entry) => text(entry.visit_date))) {
    const visit = await supabase.from('visits').insert({
      study_id: studyId, visit_at: text(item.visit_date),
      responsible_profile_id: /^[0-9a-f-]{36}$/i.test(text(item.responsible)) ? text(item.responsible) : null,
      observations: text(item.notes) || null,
    }).select('id').single()
    if (visit.error) throw visit.error
    const urls = Array.isArray(item.photo_urls) ? item.photo_urls.map(text).map((url) => url.trim()).filter(Boolean) : []
    for (const [index, url] of urls.entries()) {
      const asset = await supabase.from('file_assets').upsert({
        provider: 'other', bucket: 'external-visit-photos', object_key: url, public_url: url,
        original_name: 'Fotografía de visita ' + (index + 1), mime_type: 'text/uri-list', size_bytes: 0,
        metadata: { purpose: 'visit_photo' },
      }, { onConflict: 'provider,bucket,object_key' }).select('id').single()
      if (asset.error) throw asset.error
      const photo = await supabase.from('visit_photos').insert({
        study_id: studyId, visit_id: text(row(visit.data)?.id), file_asset_id: text(row(asset.data)?.id), display_order: index,
      })
      if (photo.error) throw photo.error
    }
  }
}
export async function saveCandidateStudySection(studyId: string, candidateId: string, sectionId: string, values: SectionValues): Promise<void> {
  let response: { error: { message?: string } | null } = { error: null }
  switch (sectionId) {
    case 'study': response = await supabase.from('studies').update({ job_position: text(values.position).trim() || 'No registrado' }).eq('id', studyId); break
    case 'personal': {
      const rfc = text(values.rfc).trim().toUpperCase()
      const curp = text(values.curp).trim().toUpperCase()
      response = await supabase.from('candidates').update({
        full_name: text(values.candidate_name).trim() || 'No registrado',
        rfc: /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/.test(rfc) ? rfc : null,
        birth_date: text(values.birth_date) || null,
        birth_place: text(values.birth_place) || null,
        marital_regime: text(values.marital_regime) || null,
        imss_number: text(values.imss_number) || null,
        email: text(values.email).trim().toLowerCase() || null,
        nationality: text(values.nationality) || null,
        marital_status: text(values.civil_status) || null,
        education_level: text(values.education_level) || null,
        curp: /^[A-Z][AEIOUX][A-Z]{2}[0-9]{6}[HM][A-Z]{5}[A-Z0-9][0-9]$/.test(curp) ? curp : null,
      }).eq('id', candidateId)
      break
    }    case 'documents': await saveDocuments(studyId, candidateId, values); break
    case 'external-family': await saveExternalFamily(studyId, values); break
    case 'academic': await saveAcademics(studyId, values); break
    case 'address': response = await supabase.from('candidate_addresses').upsert({ study_id: studyId, candidate_id: candidateId, street_and_number: text(values.street_number) || null, neighborhood: text(values.neighborhood) || null, between_streets: text(values.cross_streets) || null, postal_code: /^[0-9]{5}$/.test(text(values.postal_code)) ? text(values.postal_code) : null, municipality: text(values.municipality) || null, state: text(values.state) || null, residence_duration: text(values.time_at_address) || null, city_residence_duration: text(values.time_in_city) || null, home_phone: text(values.home_phone) || null, mobile_phone: text(values.mobile_phone) || null, emergency_phone: text(values.emergency_phone) || null }, { onConflict: 'study_id' }); break
    case 'general-result': response = await supabase.from('study_results').upsert({ study_id: studyId, result: resultToDb[text(values.result_status)] ?? 'pending', risk_level: riskToDb[text(values.risk_level)] ?? 'not_assessed', conclusion: text(values.summary) || null }, { onConflict: 'study_id' }); break
    case 'expenses': response = await supabase.from('monthly_expenses').upsert({ study_id: studyId, rent: values.rent || 0, food: values.food || 0, clothing_and_footwear: values.clothing || 0, tuition: values.tuition || 0, transportation: values.transport || 0, alimony: values.alimony || 0, fuel_and_vehicle_services: values.vehicle || 0, utilities: values.utilities || 0, leisure: values.leisure || 0, infonavit: values.infonavit || 0 }, { onConflict: 'study_id' }); break
    case 'income': response = await supabase.from('monthly_income').upsert({ study_id: studyId, gross_monthly_income: values.gross_salary === '' || values.gross_salary === undefined ? null : values.gross_salary, commissions_and_vouchers: values.commissions_vouchers || 0, retirement_pension: values.retirement_pension || 0, other_income: values.other_income || 0 }, { onConflict: 'study_id' }); break
    case 'income-comment': response = await supabase.from('income_comments').upsert({ study_id: studyId, analysis_comment: text(values.comment) || null }, { onConflict: 'study_id' }); break
    case 'languages': await replaceRows('languages', studyId, nonEmptyItems(values).filter((item) => text(item.language)).map((item) => ({ language_name: text(item.language), training_institution: text(item.institution) || null, reading_pct: item.reading || null, conversation_pct: item.conversation || null, comprehension_pct: item.comprehension || null, supporting_document: text(item.supporting_document) || null }))); break
    case 'dependents': await replaceRows('economic_dependents', studyId, nonEmptyItems(values).filter((item) => text(item.name)).map((item) => ({ full_name: text(item.name), age: item.age || null, relationship: text(item.relationship) || null, lives_with_candidate: yesNoToBool(item.lives_with_candidate) }))); break
    case 'family-structure': await replaceRows('family_members', studyId, nonEmptyItems(values).filter((item) => text(item.relationship)).map((item) => ({ relationship: text(item.relationship), full_name: text(item.name) || null, age: item.age || null, address: text(item.address) || null, marital_status: text(item.civil_status) || null, education_level: text(item.education_level) || null, occupation: text(item.occupation) || null, salary: item.salary || null, phone: text(item.phone) || null }))); break
    case 'contributors': await replaceRows('income_contributors', studyId, nonEmptyItems(values).filter((item) => text(item.name)).map((item) => ({ full_name: text(item.name), relationship: text(item.relationship) || null, monthly_income: item.monthly_income || 0, observations: text(item.notes) || null }))); break
    case 'credits': await replaceRows('active_credits', studyId, nonEmptyItems(values).filter((item) => text(item.institution)).map((item) => ({ institution: text(item.institution), credit_type: text(item.credit_type) || null, monthly_payment: item.monthly_payment || 0, overdue_balance: item.overdue_balance || 0, balance_due: item.remaining_balance || 0, observations: text(item.notes) || null }))); break
    case 'assets': await replaceRows('assets', studyId, nonEmptyItems(values).filter((item) => text(item.type)).map((item) => ({ type: ({ Inmueble: 'real_estate', 'Automóvil': 'vehicle', Otro: 'other' } as Record<string, string>)[text(item.type)] ?? 'other', description: text(item.description) || null, approximate_value: item.estimated_value || 0, outstanding_balance: item.remaining_balance || 0, owner: ['candidate', 'spouse', 'joint', 'other'].includes(text(item.owner)) ? text(item.owner) : 'candidate' }))); break
    case 'household-items': await replaceRows('household_items', studyId, nonEmptyItems(values).filter((item) => text(item.type)).map((item) => ({ item_type: text(item.type), quantity: item.quantity || 0 }))); break
    case 'housing': response = await supabase.from('housing_details').upsert({ study_id: studyId, tenure: tenureToDb[text(values.ownership_status)] || null, housing_composition: text(values.rooms) || null, zone_type: text(values.zone_type) || null, internal_conservation: text(values.internal_condition) || null, external_conservation: text(values.external_condition) || null, household_condition: text(values.household_condition) || null, housing_and_zone_comments: text(values.housing_comments) || null }, { onConflict: 'study_id' }); if (!response.error) await saveHousingServices(studyId, values); break
    case 'employment': await saveEmployment(studyId, values); break
    case 'references': await replaceRows('personal_references', studyId, nonEmptyItems(values).filter((item) => text(item.name)).map((item) => ({ full_name: text(item.name), relationship: text(item.relationship) || null, acquaintance_duration: text(item.known_time) || null, phone: text(item.phone) || null, occupation: text(item.occupation) || null, how_met: text(item.how_met) || null, visit_frequency: text(item.visit_frequency) || null, reference_comment: text(item.reference) || null }))); break
    case 'medical': response = await supabase.from('medical_background').upsert({ study_id: studyId, general_health: healthToDb[text(values.general_health)] || null, illness_requires_followup: text(values.treatment_disease) || null, contagious_disease: text(values.contagious_disease) || null, surgery_last_five_years: text(values.recent_surgery) || null, pregnancy: text(values.pregnant) || null, vision_problems: text(values.vision_problem) || null, hypertension: text(values.hypertension) || null, current_medical_treatment: text(values.current_treatment) || null, alcohol_frequency: text(values.alcohol_frequency) || null, smoking_frequency: text(values.smoking_frequency) || null, direct_family_medical_history: text(values.family_history) || null }, { onConflict: 'study_id' }); break
    case 'leisure': response = await supabase.from('leisure_information').upsert({ study_id: studyId, sport_frequency: text(values.sports) || null, favorite_hobby: text(values.hobby) || null, preferred_readings: text(values.reading) || null, cultural_events: text(values.cultural_events) || null, life_project: text(values.life_project) || null }, { onConflict: 'study_id' }); break
    case 'visits': await saveVisits(studyId, values); break
    default: throw new Error('La sección solicitada no tiene persistencia configurada.')
  }
  if (response.error) throw response.error
  const code = sectionCodeById[sectionId]
  if (code) {
    const progress = await supabase.rpc('mark_study_section_complete', { p_study_id: studyId, p_section_code: code, p_is_complete: true })
    if (progress.error) throw progress.error
  }
}
