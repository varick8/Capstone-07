import React from "react";

// Komponen Card sederhana
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl shadow-md bg-white text-black ${className}`}>
      {children}
    </div>
  );
}

export default function AirQualityDetailPage() {
  // Data spesifik untuk polutan CO
  const pollutant = {
    name: "CO (Carbon Monoksida)",
    concentration: "30000 µg/m³",
    ispu: 275.7,
    category: "Sangat Tidak Sehat",
    categoryColor: "bg-red-600 text-white",
    description: `CO berada dalam kategori Sangat Tidak Sehat. 
    Konsentrasi CO sebesar 30.000 µg/m³ menandakan kualitas udara yang sangat buruk 
    untuk kelompok sensitif dan masyarakat umum.`,
    recommendations: [
      "Hindari aktivitas luar ruangan.",
      "Gunakan masker karbon aktif.",
      "Periksa ventilasi dalam ruangan.",
    ],
  };

  return (
    <div className="min-h-screen bg-white font-sans text-black">
      <div className="max-w-[1100px] mx-auto p-5">
        {/* Header */}
        <div className="flex justify-between items-center bg-blue-900 text-white rounded-2xl px-5 py-4 mb-4">
          <h1 className="text-lg font-semibold">Indeks Standar Pencemaran Udara</h1>
          <p className="text-sm">jasicawilliamson@gmail.com</p>
        </div>

        {/* Judul Polutan + Tanggal */}
        <div className="flex justify-between items-center bg-blue-50 rounded-2xl px-5 py-3 mb-6">
          <h2 className="text-base font-bold">{pollutant.name}</h2>
          <div className="text-sm">
            <p>
              <span className="font-semibold">Diambil pada :</span> Rabu, 7 Mei 2025
            </p>
            <p>
              <span className="font-semibold">Pukul :</span> 09.30
            </p>
          </div>
        </div>

        {/* Data utama + deskripsi + rekomendasi */}
        <div className="grid grid-cols-12 gap-5 mb-8">
          {/* Data Utama */}
          <Card className="col-span-4 bg-blue-50 p-4">
            <h3 className="font-bold text-blue-700 mb-3">Data Utama</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span>Konsentrasi</span>
                <span className="px-2 py-1 rounded-md bg-red-600 text-white text-sm font-semibold">
                  {pollutant.concentration}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>ISPU</span>
                <span className="px-2 py-1 rounded-md bg-red-600 text-white text-sm font-semibold">
                  {pollutant.ispu}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Kategori</span>
                <span className={`px-2 py-1 rounded-md ${pollutant.categoryColor} text-sm font-semibold`}>
                  {pollutant.category}
                </span>
              </div>
            </div>
          </Card>

          {/* Deskripsi Singkat */}
          <Card className="col-span-4 bg-purple-50 p-4">
            <h3 className="font-bold text-purple-700 mb-3">Deskripsi Singkat</h3>
            <p className="text-sm leading-relaxed">{pollutant.description}</p>
          </Card>

          {/* Rekomendasi */}
          <Card className="col-span-4 bg-green-50 p-4">
            <h3 className="font-bold text-green-700 mb-3">Rekomendasi</h3>
            <ul className="list-decimal list-inside text-sm space-y-1">
              {pollutant.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Diagram */}
        <Card className="p-6 h-64 flex items-center justify-center bg-slate-100">
          <p className="text-sm opacity-70">[Diagram placeholder] → Grafik tren polutan CO</p>
        </Card>
      </div>
    </div>
  );
}
