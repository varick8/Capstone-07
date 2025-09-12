"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Komponen Card sederhana
function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl shadow-md bg-white text-black ${className}`}>
      {children}
    </div>
  );
}

// Helper untuk format hari + tanggal
function formatDayAndDate(date: Date) {
  const hari = date.toLocaleDateString("id-ID", { weekday: "long" });
  const tanggal = date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
  });
  return `${hari}, ${tanggal}`;
}

// Helper untuk format tanggal lengkap + tahun
function formatTanggalIndonesia(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

// Helper untuk format waktu
function formatJamMenit(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export default function AirQualityDetailPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [tanggal, setTanggal] = useState("");
  const [jam, setJam] = useState("");
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [startIndex, setStartIndex] = useState(0); // indeks awal window

  const windowSize = 7; // tampilkan data 7 hari 

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    setUserEmail(email);

    const now = new Date();
    setTanggal(formatTanggalIndonesia(now));
    setJam(formatJamMenit(now));

    // generate data 14 hari
    const today = new Date();
    const data = Array.from({ length: 14 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (13 - i));
      return {
        date: formatDayAndDate(d),
        PM25: Math.floor(Math.random() * 50 + 60),
        CO: Math.floor(Math.random() * 50 + 220),
        NO2: Math.floor(Math.random() * 40 + 100),
        O3: Math.floor(Math.random() * 10 + 40),
      };
    });
    setHistoryData(data);
  }, []);

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

  // slice data untuk ditampilkan
  const visibleData = historyData.slice(startIndex, startIndex + windowSize);

  // handler geser
  const handlePrev = () => {
    if (startIndex > 0) setStartIndex(startIndex - 1);
  };
  const handleNext = () => {
    if (startIndex + windowSize < historyData.length)
      setStartIndex(startIndex + 1);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-black">
      <div className="max-w-[1200px] mx-auto p-5">
        {/* Header */}
        <div className="flex justify-between items-center bg-blue-900 text-white rounded-2xl px-5 py-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="p-2 rounded-full hover:bg-blue-800 transition"
            >
              <IoArrowBack size={22} />
            </button>
            <h1 className="text-lg font-semibold">
              Indeks Standar Pencemaran Udara
            </h1>
          </div>
          {userEmail && (
            <div className="text-sm font-medium mt-1">{userEmail}</div>
          )}
        </div>

        {/* Judul Polutan + Tanggal */}
        <div className="flex justify-between items-center bg-blue-50 rounded-2xl px-5 py-3 mb-6">
          <h2 className="text-base font-bold">{pollutant.name}</h2>
          <div className="text-sm text-right">
            <p>
              <span className="font-semibold">Diambil pada :</span> {tanggal}
            </p>
            <p>
              <span className="font-semibold">Pukul :</span> {jam}
            </p>
          </div>
        </div>

        {/* Data utama + deskripsi + rekomendasi */}
        <div className="grid grid-cols-12 gap-5 mb-8">
          <Card className="col-span-12 md:col-span-4 bg-blue-50 p-4">
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
                <span
                  className={`px-2 py-1 rounded-md ${pollutant.categoryColor} text-sm font-semibold`}
                >
                  {pollutant.category}
                </span>
              </div>
            </div>
          </Card>

          <Card className="col-span-12 md:col-span-4 bg-purple-50 p-4">
            <h3 className="font-bold text-purple-700 mb-3">Deskripsi Singkat</h3>
            <p className="text-sm leading-relaxed">{pollutant.description}</p>
          </Card>

          <Card className="col-span-12 md:col-span-4 bg-green-50 p-4">
            <h3 className="font-bold text-green-700 mb-3">Rekomendasi</h3>
            <ul className="list-decimal list-inside text-sm space-y-1">
              {pollutant.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Diagram History ISPU */}
        <Card className="p-6 h-[400px] bg-slate-100 relative">
          {/* Tombol navigasi */}
          <button
            onClick={handlePrev}
            disabled={startIndex === 0}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2 hover:bg-gray-100 disabled:opacity-40"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNext}
            disabled={startIndex + windowSize >= historyData.length}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2 hover:bg-gray-100 disabled:opacity-40"
          >
            <ChevronRight size={20} />
          </button>

          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={visibleData}
              margin={{ top: 20, right: 30, left: 0, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
              <XAxis
                dataKey="date"
                angle={-20}
                textAnchor="end"
                height={60}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Line
                type="monotone"
                dataKey="PM25"
                stroke="#3b82f6"
                name="PM 2.5"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="CO"
                stroke="#ef4444"
                name="CO"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="NO2"
                stroke="#f97316"
                name="NO₂"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="O3"
                stroke="#22c55e"
                name="O₃"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
