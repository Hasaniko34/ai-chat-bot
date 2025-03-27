'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white text-center p-4">
      <div className="space-y-4 max-w-md">
        <h2 className="text-4xl font-bold">Beklenmedik Bir Hata Oluştu</h2>
        <p>Üzgünüz, uygulama genelinde bir hata oluştu.</p>
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          onClick={() => reset()}
        >
          Tekrar Dene
        </button>
      </div>
    </div>
  )
} 