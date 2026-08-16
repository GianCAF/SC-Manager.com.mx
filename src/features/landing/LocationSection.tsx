const mapUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3759.5085375429156!2d-99.00335632400977!3d19.595638281720816!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d1ee3adca42653%3A0xf77875c928be8ff9!2sR%C3%ADo%20Consulado%2049%2C%20Jardines%20de%20Morelos%2C%2055070%20Ecatepec%20de%20Morelos%2C%20M%C3%A9x.!5e0!3m2!1ses-419!2smx!4v1700000000000!5m2!1ses-419!2smx'

export function LocationSection() {
  return (
    <section aria-label="Ubicación de la empresa" className="bg-slate-50 px-4 pb-12">
      <div className="mx-auto h-56 max-w-7xl overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 shadow-md md:h-72">
        <iframe
          title="Ubicación de la Empresa"
          src={mapUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          className="h-full w-full"
        />
      </div>
    </section>
  )
}
