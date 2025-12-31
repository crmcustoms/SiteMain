"use client"

export function MessengerWidget() {
  return (
    <div className="fixed bottom-8 right-8 z-40 flex flex-col gap-4 hidden lg:flex">
      {/* Telegram */}
      <a
        href="https://t.me/crmcustomsua"
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600 transition-all hover:scale-110 shadow-lg"
        title="Telegram"
      >
        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9.036 16.956l-.398 3.77c.57 0 .816-.246 1.113-.54l2.67-2.53 5.537 4.04c1.014.56 1.74.266 1.99-.94l3.61-16.84c.33-1.54-.56-2.14-1.56-1.77l-21.1 8.13c-1.44.56-1.42 1.36-.25 1.72l5.39 1.68 12.52-7.9c.59-.38 1.13-.17.69.24z"/>
        </svg>
      </a>

      {/* Viber */}
      <a
        href="viber://chat?number=%2B380671706703"
        className="w-14 h-14 flex items-center justify-center rounded-full bg-purple-600 hover:bg-purple-700 transition-all hover:scale-110 shadow-lg"
        title="Viber"
      >
        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.198.297-.767.967-.94 1.166-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.099 3.2 5.077 4.363.71.306 1.263.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.288.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        </svg>
      </a>
    </div>
  )
}
