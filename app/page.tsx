import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center max-w-3xl">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          ImotiBG+
        </h1>
        <p className="text-xl text-gray-700 mb-2">
          Български имотен портал с данни за близост до POI
        </p>
        <p className="text-lg text-gray-600 mb-8">
          Bulgarian Real Estate Portal with POI Proximity Data
        </p>

        <div className="flex gap-4 justify-center mb-12">
          <Link
            href="/properties"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Разгледай имоти
          </Link>
          <Link
            href="/properties/new"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-50 transition font-medium border border-blue-600"
          >
            Добави имот
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-2">🏠</div>
            <h3 className="font-semibold mb-2">Имоти</h3>
            <p className="text-sm text-gray-600">
              Преглед на налични имоти с пълна информация
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-2">📍</div>
            <h3 className="font-semibold mb-2">POI данни</h3>
            <p className="text-sm text-gray-600">
              Разстояния до магазини, училища, транспорт и др.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-2">✨</div>
            <h3 className="font-semibold mb-2">Персонализиране</h3>
            <p className="text-sm text-gray-600">
              Оценка на имоти според вашите приоритети
            </p>
          </div>
        </div>

        <p className="mt-12 text-sm text-gray-500">
          Phase 1: Foundation - Complete ✓
        </p>
      </div>
    </main>
  );
}
