import { useEffect, useState } from 'react'
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Cloud,
  Database,
  FileCheck2,
  LoaderCircle,
  LogOut,
  Menu,
  Plus,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  consultantSections,
  expenseFields,
  incomeFields,
  initialRepeaterData,
  officialDocuments,
  type ConsultantSection,
  type FieldDefinition,
  type RepeaterDefinition,
} from './consultantFormConfig'
import { useAuth } from '../auth/AuthContext'

type SectionValues = Record<string, unknown>
type DraftData = Record<string, SectionValues>

type StoredDraft = {
  id: string
  data: DraftData
  completedSections: string[]
  updatedAt: string
}

type PostalResponse = {
  estado?: string
  municipio?: string
  asentamientos?: Array<{ nombre?: string }>
}

const STORAGE_KEY = 'sociomanager:consultant-study-draft:v1'

function createEmptyData(): DraftData {
  return Object.fromEntries(
    consultantSections.map((section) => [section.id, { ...(initialRepeaterData[section.id] ?? {}) }]),
  )
}

function loadDraft(): StoredDraft {
  const fallback: StoredDraft = {
    id: `local-${Date.now()}`,
    data: createEmptyData(),
    completedSections: [],
    updatedAt: new Date().toISOString(),
  }

  try {
    const rawDraft = localStorage.getItem(STORAGE_KEY)
    if (!rawDraft) return fallback
    const parsed = JSON.parse(rawDraft) as StoredDraft
    const baseData = createEmptyData()

    for (const section of consultantSections) {
      baseData[section.id] = {
        ...baseData[section.id],
        ...(parsed.data?.[section.id] ?? {}),
      }
    }

    return { ...fallback, ...parsed, data: baseData }
  } catch {
    return fallback
  }
}

function calculateAge(value: string): number | '' {
  if (!value) return ''
  const birthDate = new Date(`${value}T00:00:00`)
  if (Number.isNaN(birthDate.getTime())) return ''
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDifference = today.getMonth() - birthDate.getMonth()
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) age -= 1
  return age >= 0 ? age : ''
}

function sumFields(values: SectionValues, fields: FieldDefinition[]): number {
  return fields.reduce((total, field) => total + (Number(values[field.name]) || 0), 0)
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)
}

export function ConsultantWorkspace() {
  const { profile, signOut } = useAuth()
  const [draft, setDraft] = useState<StoredDraft>(loadDraft)
  const [activeSectionId, setActiveSectionId] = useState(consultantSections[0].id)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [cacheStatus, setCacheStatus] = useState<'saved' | 'saving'>('saved')
  const [sectionStatus, setSectionStatus] = useState('')
  const [postalStatus, setPostalStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [postalOptions, setPostalOptions] = useState<string[]>([])

  const activeSectionIndex = consultantSections.findIndex((section) => section.id === activeSectionId)
  const activeSection = consultantSections[activeSectionIndex]
  const values = draft.data[activeSectionId] ?? {}
  const candidateName = String(draft.data.personal?.candidate_name || 'Nuevo candidato')
  const position = String(draft.data.study?.position || 'Puesto pendiente de captura')
  const totalExpenses = sumFields(draft.data.expenses ?? {}, expenseFields)
  const totalIncome = sumFields(draft.data.income ?? {}, incomeFields)
  const netFamilyIncome = totalIncome - totalExpenses

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const nextDraft = { ...draft, updatedAt: new Date().toISOString() }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextDraft))
      setCacheStatus('saved')
    }, 450)
    return () => window.clearTimeout(timer)
  }, [draft])

  const completedCount = draft.completedSections.length
  const completionPercentage = Math.round((completedCount / consultantSections.length) * 100)

  const goToSection = (sectionId: string) => {
    setActiveSectionId(sectionId)
    setSectionStatus('')
    setSidebarOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const updateValue = (name: string, value: unknown) => {
    setCacheStatus('saving')
    setDraft((current) => {
      const currentSection = current.data[activeSectionId] ?? {}
      const nextSection = { ...currentSection, [name]: value }
      if (activeSectionId === 'personal' && name === 'birth_date') {
        nextSection.age = calculateAge(String(value))
      }
      return { ...current, data: { ...current.data, [activeSectionId]: nextSection } }
    })
    setSectionStatus('')
  }

  const saveSection = () => {
    const nextDraft: StoredDraft = {
      ...draft,
      completedSections: draft.completedSections.includes(activeSectionId)
        ? draft.completedSections
        : [...draft.completedSections, activeSectionId],
      updatedAt: new Date().toISOString(),
    }
    setDraft(nextDraft)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextDraft))
    setCacheStatus('saved')
    setSectionStatus('Sección guardada en el borrador local')
  }

  const updateRepeater = (repeaterName: string, index: number, fieldName: string, value: unknown) => {
    const items = [...((values[repeaterName] as SectionValues[] | undefined) ?? [{}])]
    items[index] = { ...items[index], [fieldName]: value }
    updateValue(repeaterName, items)
  }

  const addRepeaterItem = (repeaterName: string) => {
    const items = [...((values[repeaterName] as SectionValues[] | undefined) ?? [{}]), {}]
    updateValue(repeaterName, items)
  }

  const removeRepeaterItem = (repeaterName: string, index: number) => {
    const items = ((values[repeaterName] as SectionValues[] | undefined) ?? [{}]).filter((_, itemIndex) => itemIndex !== index)
    updateValue(repeaterName, items.length ? items : [{}])
  }

  const lookupPostalCode = async () => {
    const postalCode = String(values.postal_code ?? '').trim()
    if (!/^\d{5}$/.test(postalCode)) {
      setPostalStatus('error')
      return
    }

    setCacheStatus('saving')
    setPostalStatus('loading')
    try {
      const response = await fetch(`https://postali.app/api/v1/mx/cp/${postalCode}`)
      if (!response.ok) throw new Error('Postal code lookup failed')
      const result = await response.json() as PostalResponse
      const neighborhoods = (result.asentamientos ?? []).map((item) => item.nombre).filter(Boolean) as string[]
      setDraft((current) => ({
        ...current,
        data: {
          ...current.data,
          address: {
            ...current.data.address,
            state: result.estado ?? current.data.address?.state ?? '',
            municipality: result.municipio ?? current.data.address?.municipality ?? '',
            neighborhood: neighborhoods[0] ?? current.data.address?.neighborhood ?? '',
          },
        },
      }))
      setPostalOptions(neighborhoods)
      setPostalStatus('success')
    } catch {
      setPostalStatus('error')
    }
  }

  const clearDraft = () => {
    if (!window.confirm('¿Deseas eliminar el borrador local de este estudio?')) return
    const emptyDraft: StoredDraft = {
      id: `local-${Date.now()}`,
      data: createEmptyData(),
      completedSections: [],
      updatedAt: new Date().toISOString(),
    }
    localStorage.removeItem(STORAGE_KEY)
    setDraft(emptyDraft)
    setActiveSectionId(consultantSections[0].id)
  }

  const goPrevious = () => {
    if (activeSectionIndex > 0) goToSection(consultantSections[activeSectionIndex - 1].id)
  }

  const goNext = () => {
    if (activeSectionIndex < consultantSections.length - 1) goToSection(consultantSections[activeSectionIndex + 1].id)
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
          <button type="button" onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Abrir menú de formularios">
            <Menu size={22} />
          </button>
          <Link to="/" className="flex shrink-0 items-center gap-3">
            <img src="/imagenes/logo1.png" alt="SocioManager" className="h-9 w-auto" />
            <span className="hidden text-sm font-extrabold tracking-tight text-[#071a38] sm:block">Panel de consultor</span>
          </Link>
          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            <div className="hidden items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 md:flex">
              {cacheStatus === 'saving' ? <LoaderCircle size={14} className="animate-spin" /> : <Cloud size={14} />}
              {cacheStatus === 'saving' ? 'Guardando borrador...' : 'Borrador local protegido'}
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#071a38] text-white"><CircleUserRound size={19} /></div>
            <div className="hidden leading-tight sm:block">
              <p className="text-xs font-bold text-slate-800">{profile?.full_name}</p>
              <p className="text-[11px] text-slate-500">{profile?.role === 'admin' ? 'Administrador' : 'Consultor'}</p>
            </div>
            <button type="button" onClick={() => void signOut()} className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800" aria-label="Cerrar sesión"><LogOut size={18} /></button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1800px]">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-80 shrink-0 overflow-y-auto border-r border-slate-200 bg-[#071a38] text-white lg:block">
          <SidebarContent completedSections={draft.completedSections} activeSectionId={activeSectionId} onSelect={goToSection} completionPercentage={completionPercentage} />
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button type="button" className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" aria-label="Cerrar menú" onClick={() => setSidebarOpen(false)} />
            <aside className="relative h-full w-[min(88vw,340px)] overflow-y-auto bg-[#071a38] text-white shadow-2xl">
              <button type="button" onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 rounded-lg p-2 text-slate-300 hover:bg-white/10" aria-label="Cerrar menú"><X size={20} /></button>
              <SidebarContent completedSections={draft.completedSections} activeSectionId={activeSectionId} onSelect={goToSection} completionPercentage={completionPercentage} />
            </aside>
          </div>
        )}

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <section className="mb-6 overflow-hidden rounded-2xl border border-blue-100 bg-[linear-gradient(115deg,#071a38_0%,#123e78_70%,#2563eb_140%)] p-5 text-white shadow-lg shadow-blue-950/10 sm:p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15"><BriefcaseBusiness size={24} /></div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.16em] text-blue-200 uppercase"><span>Expediente activo</span><span className="h-1 w-1 rounded-full bg-blue-300" /><span>{draft.id}</span></div>
                  <h1 className="mt-1 truncate text-xl font-extrabold sm:text-2xl">{candidateName}</h1>
                  <p className="mt-1 truncate text-sm text-blue-100">{position}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center sm:gap-3">
                <Metric label="Avance" value={`${completionPercentage}%`} />
                <Metric label="Secciones" value={`${completedCount}/${consultantSections.length}`} />
                <Metric label="Estado" value="Borrador" />
              </div>
            </div>
          </section>

          <div className="mb-5 lg:hidden">
            <label className="text-xs font-bold tracking-wide text-slate-500 uppercase" htmlFor="mobile-section">Formulario actual</label>
            <select id="mobile-section" value={activeSectionId} onChange={(event) => goToSection(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none">
              {consultantSections.map((section, index) => <option key={section.id} value={section.id}>{index + 1}. {section.title}</option>)}
            </select>
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-5 sm:px-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold tracking-[0.16em] text-blue-600 uppercase">Formulario {activeSectionIndex + 1} de {consultantSections.length}</p>
                  <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#071a38]">{activeSection.title}</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{activeSection.description}</p>
                </div>
                <div className="hidden rounded-xl bg-slate-50 p-3 text-slate-400 sm:block"><FileCheck2 size={24} /></div>
              </div>
            </div>

            <form onSubmit={(event) => { event.preventDefault(); saveSection() }} className="p-5 sm:p-7">
              <SectionContent
                section={activeSection}
                values={values}
                updateValue={updateValue}
                updateRepeater={updateRepeater}
                addRepeaterItem={addRepeaterItem}
                removeRepeaterItem={removeRepeaterItem}
                lookupPostalCode={lookupPostalCode}
                postalStatus={postalStatus}
                postalOptions={postalOptions}
                totalExpenses={totalExpenses}
                totalIncome={totalIncome}
                netFamilyIncome={netFamilyIncome}
              />

              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center">
                <button type="button" onClick={goPrevious} disabled={activeSectionIndex === 0} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={18} />Anterior</button>
                <button type="button" onClick={clearDraft} className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 sm:mr-auto"><Trash2 size={17} />Limpiar borrador</button>
                {sectionStatus && <p className="text-center text-xs font-semibold text-emerald-600">{sectionStatus}</p>}
                <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700"><Save size={18} />Guardar formulario</button>
                <button type="button" onClick={goNext} disabled={activeSectionIndex === consultantSections.length - 1} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#071a38] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#102b54] disabled:cursor-not-allowed disabled:opacity-40">Siguiente<ChevronRight size={18} /></button>
              </div>
            </form>
          </section>

          <div className="mt-5 flex items-center justify-between rounded-xl border border-dashed border-slate-300 bg-white/70 px-4 py-3 text-xs text-slate-500">
            <span className="flex items-center gap-2"><Database size={15} />Supabase se conectará después de aprobar estos formularios.</span>
            <span className="hidden sm:inline">Último borrador: {new Date(draft.updatedAt).toLocaleString('es-MX')}</span>
          </div>
        </main>
      </div>
    </div>
  )
}

function SidebarContent({ completedSections, activeSectionId, onSelect, completionPercentage }: { completedSections: string[]; activeSectionId: string; onSelect: (id: string) => void; completionPercentage: number }) {
  return (
    <div className="px-4 py-6">
      <div className="mb-5 px-3">
        <p className="text-[11px] font-bold tracking-[0.18em] text-blue-300 uppercase">Captura del estudio</p>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-300"><span>Progreso general</span><span className="font-bold text-white">{completionPercentage}%</span></div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-blue-400 transition-all" style={{ width: `${completionPercentage}%` }} /></div>
      </div>
      <nav aria-label="Formularios del estudio" className="space-y-1">
        {consultantSections.map((section, index) => {
          const active = activeSectionId === section.id
          const complete = completedSections.includes(section.id)
          return (
            <button key={section.id} type="button" onClick={() => onSelect(section.id)} className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs transition ${active ? 'bg-blue-500 text-white shadow-lg shadow-blue-950/20' : 'text-slate-300 hover:bg-white/7 hover:text-white'}`}>
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-extrabold ${complete ? 'bg-emerald-400 text-emerald-950' : active ? 'bg-white/15 text-white' : 'bg-white/8 text-slate-400'}`}>{complete ? <Check size={13} strokeWidth={3} /> : index + 1}</span>
              <span className="min-w-0 flex-1 truncate font-semibold">{section.shortTitle}</span>
              {active && <ArrowRight size={14} className="shrink-0" />}
            </button>
          )
        })}
      </nav>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="min-w-20 rounded-xl bg-white/8 px-3 py-2.5 ring-1 ring-white/10"><p className="text-[10px] font-semibold text-blue-200">{label}</p><p className="mt-0.5 text-sm font-extrabold text-white">{value}</p></div>
}

type SectionContentProps = {
  section: ConsultantSection
  values: SectionValues
  updateValue: (name: string, value: unknown) => void
  updateRepeater: (repeater: string, index: number, field: string, value: unknown) => void
  addRepeaterItem: (repeater: string) => void
  removeRepeaterItem: (repeater: string, index: number) => void
  lookupPostalCode: () => void
  postalStatus: 'idle' | 'loading' | 'success' | 'error'
  postalOptions: string[]
  totalExpenses: number
  totalIncome: number
  netFamilyIncome: number
}

function SectionContent(props: SectionContentProps) {
  const { section, values, updateValue } = props

  if (section.special === 'documents') {
    const documents = (values.items as Record<string, { presented?: boolean; fileUrl?: string }> | undefined) ?? {}
    return (
      <div className="space-y-3">
        <CloudflareNotice />
        {officialDocuments.map((documentName, index) => {
          const key = `document_${index + 1}`
          const item = documents[key] ?? {}
          const updateDocument = (patch: Partial<typeof item>) => updateValue('items', { ...documents, [key]: { ...item, ...patch } })
          return (
            <div key={documentName} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4 md:grid-cols-[minmax(230px,0.8fr)_1.6fr] md:items-center">
              <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-slate-700">
                <input type="checkbox" checked={Boolean(item.presented)} onChange={(event) => updateDocument({ presented: event.target.checked })} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                {documentName}
              </label>
              <input type="url" value={item.fileUrl ?? ''} onChange={(event) => updateDocument({ fileUrl: event.target.value })} placeholder="https://cdn.cloudflare.com/archivo..." className={inputClassName} aria-label={`URL de ${documentName}`} />
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-7">
      {section.id === 'medical' && <SensitiveDataNotice />}
      {section.id === 'visits' && <CloudflareNotice />}
      {section.groups?.map((group, groupIndex) => (
        <div key={`${section.id}-group-${groupIndex}`}>
          {group.title && <div className="mb-4"><h3 className="text-sm font-extrabold text-[#123e78]">{group.title}</h3>{group.description && <p className="mt-1 text-xs text-slate-500">{group.description}</p>}</div>}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {group.fields.map((field) => {
              const computedValue = field.name === 'net_family_income' ? props.netFamilyIncome : values[field.name]
              return (
                <Field key={field.name} field={field} value={computedValue} onChange={(value) => updateValue(field.name, value)}>
                  {section.special === 'postalAddress' && field.name === 'postal_code' && (
                    <button type="button" onClick={props.lookupPostalCode} className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800">
                      {props.postalStatus === 'loading' ? <LoaderCircle size={14} className="animate-spin" /> : <Search size={14} />}
                      Autocompletar domicilio
                    </button>
                  )}
                  {section.special === 'postalAddress' && field.name === 'neighborhood' && props.postalOptions.length > 1 && (
                    <select value={String(values.neighborhood ?? '')} onChange={(event) => updateValue('neighborhood', event.target.value)} className="mt-2 w-full rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
                      {props.postalOptions.map((option) => <option key={option}>{option}</option>)}
                    </select>
                  )}
                </Field>
              )
            })}
          </div>
          {section.special === 'postalAddress' && props.postalStatus === 'error' && <p className="mt-3 text-xs font-semibold text-rose-600">No fue posible consultar el código postal. Verifica los 5 dígitos o captura los campos manualmente.</p>}
        </div>
      ))}

      {section.special === 'expenses' && <FinancialTotal label="Total de egresos" value={props.totalExpenses} tone="rose" />}
      {section.special === 'income' && <FinancialTotal label="Total de ingresos" value={props.totalIncome} tone="emerald" />}

      {section.repeaters?.map((repeater) => (
        <Repeater
          key={repeater.name}
          definition={repeater}
          items={(values[repeater.name] as SectionValues[] | undefined) ?? [{}]}
          onUpdate={(index, field, value) => props.updateRepeater(repeater.name, index, field, value)}
          onAdd={() => props.addRepeaterItem(repeater.name)}
          onRemove={(index) => props.removeRepeaterItem(repeater.name, index)}
        />
      ))}
    </div>
  )
}

const inputClassName = 'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-500'

function Field({ field, value, onChange, children }: { field: FieldDefinition; value: unknown; onChange: (value: unknown) => void; children?: React.ReactNode }) {
  const spanClass = field.span === 3 ? 'md:col-span-2 xl:col-span-3' : field.span === 2 ? 'md:col-span-2' : ''
  const stringValue = value === undefined || value === null ? '' : String(value)

  if (field.type === 'checkbox') {
    return (
      <label className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 ${spanClass}`}>
        <input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
        <span className="text-sm font-semibold text-slate-700">{field.label}</span>
      </label>
    )
  }

  return (
    <label className={`block ${spanClass}`}>
      <span className="mb-1.5 block text-xs font-bold text-slate-600">
        {field.label}{field.required && <span className="text-rose-500" aria-hidden="true"> *</span>}
      </span>
      {field.type === 'textarea' ? (
        <textarea rows={4} value={stringValue} onChange={(event) => onChange(event.target.value)} placeholder={field.placeholder} readOnly={field.readOnly} required={field.required} className={`${inputClassName} resize-y`} />
      ) : field.type === 'select' ? (
        <select value={stringValue} onChange={(event) => onChange(event.target.value)} required={field.required} className={inputClassName}>
          <option value="">Selecciona una opción</option>
          {field.options?.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      ) : (
        <input type={field.type ?? 'text'} value={stringValue} onChange={(event) => onChange(field.type === 'number' ? (Number.isNaN(event.target.valueAsNumber) ? '' : event.target.valueAsNumber) : event.target.value)} placeholder={field.placeholder} min={field.min} max={field.max} step={field.step} readOnly={field.readOnly} required={field.required} className={inputClassName} />
      )}
      {field.help && <span className="mt-1.5 block text-[11px] leading-4 text-slate-400">{field.help}</span>}
      {children}
    </label>
  )
}

function Repeater({ definition, items, onUpdate, onAdd, onRemove }: { definition: RepeaterDefinition; items: SectionValues[]; onUpdate: (index: number, field: string, value: unknown) => void; onAdd: () => void; onRemove: (index: number) => void }) {
  return (
    <div>
      {definition.description && <p className="mb-4 text-sm text-slate-500">{definition.description}</p>}
      <div className="space-y-5">
        {items.map((item, index) => (
          <fieldset key={`${definition.name}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
            <legend className="px-2 text-sm font-extrabold text-[#123e78]">{definition.itemLabel} {index + 1}</legend>
            <div className="mb-4 flex justify-end">
              {items.length > 1 && <button type="button" onClick={() => onRemove(index)} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50"><Trash2 size={14} />Eliminar</button>}
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {definition.fields.map((field) => field.type === 'stringList' ? (
                <StringListField key={field.name} field={field} values={(item[field.name] as string[] | undefined) ?? ['']} onChange={(nextValues) => onUpdate(index, field.name, nextValues)} />
              ) : (
                <Field key={field.name} field={field} value={item[field.name]} onChange={(value) => onUpdate(index, field.name, value)} />
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      <button type="button" onClick={onAdd} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-dashed border-blue-300 bg-blue-50/60 px-4 py-2.5 text-sm font-bold text-blue-700 transition hover:border-blue-500 hover:bg-blue-50"><Plus size={17} />{definition.addLabel}</button>
    </div>
  )
}

function StringListField({ field, values, onChange }: { field: FieldDefinition; values: string[]; onChange: (values: string[]) => void }) {
  const normalizedValues = values.length ? values : ['']
  return (
    <div className="md:col-span-2 xl:col-span-3">
      <span className="mb-1.5 block text-xs font-bold text-slate-600">{field.label}</span>
      <div className="space-y-2">
        {normalizedValues.map((url, index) => (
          <div key={index} className="flex gap-2">
            <input type="url" value={url} onChange={(event) => onChange(normalizedValues.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} placeholder="https://imagedelivery.net/..." className={inputClassName} aria-label={`${field.label} ${index + 1}`} />
            {normalizedValues.length > 1 && <button type="button" onClick={() => onChange(normalizedValues.filter((_, itemIndex) => itemIndex !== index))} className="rounded-xl border border-slate-300 px-3 text-slate-500 hover:border-rose-300 hover:text-rose-600" aria-label={`Eliminar URL ${index + 1}`}><X size={17} /></button>}
          </div>
        ))}
      </div>
      <button type="button" onClick={() => onChange([...normalizedValues, ''])} className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800"><Plus size={14} />Añadir otra fotografía</button>
      {field.help && <span className="mt-1 block text-[11px] text-slate-400">{field.help}</span>}
    </div>
  )
}

function FinancialTotal({ label, value, tone }: { label: string; value: number; tone: 'rose' | 'emerald' }) {
  const classes = tone === 'rose' ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'
  return <div className={`flex items-center justify-between rounded-xl border px-5 py-4 ${classes}`}><span className="text-sm font-bold">{label}</span><strong className="text-xl">{formatCurrency(value)}</strong></div>
}

function CloudflareNotice() {
  return <div className="flex gap-3 rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-cyan-900"><Cloud className="mt-0.5 shrink-0" size={20} /><div><p className="text-sm font-bold">Archivos preparados para Cloudflare</p><p className="mt-1 text-xs leading-5 text-cyan-800">En esta fase se captura la URL pública o firmada. Después vincularemos la subida directa a Cloudflare y guardaremos la URL resultante en Supabase.</p></div></div>
}

function SensitiveDataNotice() {
  return <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950"><ShieldCheck className="mt-0.5 shrink-0" size={20} /><div><p className="text-sm font-bold">Sección de datos personales sensibles</p><p className="mt-1 text-xs leading-5 text-amber-800">La futura base aplicará acceso restringido, trazabilidad y consentimiento expreso. La interfaz actual solo guarda un borrador local en este navegador.</p></div></div>
}
