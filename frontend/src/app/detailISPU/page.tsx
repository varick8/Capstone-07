"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
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

export default function AirQualityDetailPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Ambil email dari localStorage
    const email = localStorage.getItem("userEmail");
    setUserEmail(email);
  }, []);

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

  // Data history ISPU 4 polutan
  const historyData = [
    { time: "07:00", PM25: 70, CO: 210, NO2: 100, O3: 40 },
    { time: "08:00", PM25: 80, CO: 230, NO2: 120, O3: 42 },
    { time: "09:00", PM25: 85, CO: 250, NO2: 130, O3: 45 },
    { time: "10:00", PM25: 90, CO: 275.7, NO2: 132.94, O3: 41.67 },
    { time: "11:00", PM25: 95, CO: 260, NO2: 125, O3: 43 },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-black">
      <div className="max-w-[1200px] mx-auto p-5">
        {/* Header */}
        <div className="flex justify-between items-center bg-blue-900 text-white rounded-2xl px-5 py-4 mb-6">
          <div className="flex items-center gap-3">
            {/* Tombol Back */}
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
          <div className="text-sm">
            <p>
              <span className="font-semibold">Diambil pada :</span> Rabu, 7 Mei
              2025
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
                <span
                  className={`px-2 py-1 rounded-md ${pollutant.categoryColor} text-sm font-semibold`}
                >
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

        {/* Diagram History ISPU */}
        <Card className="p-6 h-80 flex items-center justify-center bg-slate-100">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="PM25"
                stroke="#3b82f6"
                name="PM 2.5"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="CO"
                stroke="#ef4444"
                name="CO"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="NO2"
                stroke="#f97316"
                name="NO₂"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="O3"
                stroke="#22c55e"
                name="O₃"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
