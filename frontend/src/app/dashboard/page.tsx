import React from "react";

// Komponen Card sederhana
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl shadow-md bg-blue-50 text-black ${className}`}>{children}</div>
  );
}

// Mapping kategori ISPU → warna/label
function categoryOf(v: number) {
  if (v <= 50) return { label: "Baik", dot: "#22c55e", chip: "bg-green-100 text-green-700" };
  if (v <= 100) return { label: "Sedang", dot: "#facc15", chip: "bg-yellow-100 text-yellow-700" };
  if (v <= 199) return { label: "Tidak Sehat", dot: "#f97316", chip: "bg-orange-100 text-orange-700" };
  if (v <= 299) return { label: "Sangat Tidak Sehat", dot: "#ef4444", chip: "bg-red-100 text-red-700" };
  return { label: "Berbahaya", dot: "#6b21a8", chip: "bg-purple-100 text-purple-700" };
}

export default function AirQualityDashboard() {
  // ISPU per polutan
  const ispuData = [
    { name: "PM 2,5", value: 90.4 },
    { name: "CO", value: 275.7 },
    { name: "O3", value: 41.67 },
    { name: "NO2", value: 132.94 },
  ];

  // Data polutan (dengan satuan & status)
  const detailedData = [
    { name: "PM 2,5", value: "55,4 µg/m³", status: "Sedang", statusColor: "text-yellow-600" },
    { name: "CO", value: "30000 µg/m³", status: "Sangat Tidak Sehat", statusColor: "text-red-600" },
    { name: "O3", value: "100 µg/m³", status: "Baik/Sehat", statusColor: "text-green-600" },
    { name: "NO2", value: "500 µg/m³", status: "Tidak Sehat", statusColor: "text-orange-600" },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-black">
      <div className="max-w-[1200px] mx-auto p-5">
        {/* Header */}
        <div className="flex justify-between items-center bg-blue-900 text-white rounded-2xl px-5 py-4 mb-4">
          <h1 className="text-lg font-semibold">Indeks Standar Pencemaran Udara</h1>
          <p className="text-sm">jasicawilliamson@gmail.com</p>
        </div>

      {/* Grid 3 kolom 2 baris */}
      <div className="grid grid-cols-3 grid-rows-[60px,1fr] gap-4 mb-6">
        {/* Location & Date (col-span-2, row-1) */}
        <Card className="col-span-2 flex justify-between items-center bg-blue-50 px-5 py-2">
          <div className="flex items-center gap-2">
            <span className="text-blue-600">📍</span>
            <span className="font-semibold">Sleman, Yogyakarta</span>
          </div>
          <div className="text-right text-sm">
            <p>Rabu, 7 Mei 2025</p>
            <p className="font-semibold">09.00</p>
          </div>
        </Card>

       {/* Hasil ISPU (col-3, span 2 rows) */}
      <Card className="row-span-2 p-4 bg-grey/80">
        <p className="font-medium text-sm text-center mb-2">Hasil ISPU</p>
        <div className="space-y-1">
          {ispuData.map((row, i) => {
            const cat = categoryOf(row.value);
            return (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-2 py-2 hover:shadow-sm"
                style={{ borderLeftWidth: 5, borderLeftColor: cat.dot }}
              >
                <div className="flex items-center gap-3">
                  <Dot color={cat.dot} />
                  <div className="leading-tight">
                    <p className="text-[12px] font-semibold">{row.name}</p>
                    <span className={`text-[10px] px-1.5 py-1 rounded-full ${cat.chip}`}>
                      {cat.label}
                    </span>
                  </div>
                </div>
                <div className="text-sm font-bold">{Math.round(row.value)}</div>
              </div>
            );
          })}
        </div>
      </Card>


        {/* Peringatan (col-1, row-2) */}
        <Card className="flex flex-col items-center justify-center bg-red-100 border-l-4 border-red-600 py-5 min-h-[180px]">
          <div className="text-red-600 text-3xl mb-1">⚠️</div>
          <p className="font-bold text-red-700 leading-tight">PERINGATAN</p>
          <p className="text-xs">Kadar CO Sangat Tinggi</p>
        </Card>

        {/* Rekomendasi (col-2, row-2) */}
        <Card className="flex items-center justify-center py-6 min-h-[120px]">
          <div className="text-center px-3">
            <p className="font-bold mb-1">Rekomendasi</p>
            <p className="text-xs">
              Gunakan masker karbon aktif saat berada di luar untuk mengurangi paparan CO.
            </p>
          </div>
        </Card>
      </div>


       {/* Baris berikutnya: Data polutan + Diagram */}
      <div className="grid grid-cols-12 gap-3">
        {/* Data polutan */}
        <div className="col-span-7">
          <div className="grid grid-cols-2 gap-2">
            {detailedData.map((item, idx) => (
              <Card
                key={idx}
                className="p-3 text-center bg-slate-100"
              >
                <p className="text-[11px] font-semibold leading-snug">{item.name}</p>
                <p className="text-base font-bold leading-snug">{item.value}</p>
                <p className={`text-[11px] ${item.statusColor}`}>{item.status}</p>
              </Card>
            ))}
          </div>
        </div>


          {/* Diagram */}
          <Card className="col-span-5 px-5 py-6 bg-slate-100 h-40 flex items-center justify-center">
            <p className="text-xs opacity-70">
              [Diagram placeholder] → di sini nanti diagram batang/garis ISPU
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Komponen titik warna kecil
function Dot({ color }: { color: string }) {
  return <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: color }} />;
}
