"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
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

// Mapping kategori ISPU
function categoryOf(v: number) {
  if (v <= 50)
    return {
      label: "Baik",
      color: "bg-green-600 text-white",
    };
  if (v <= 100)
    return {
      label: "Sedang",
      color: "bg-blue-600 text-white",
    };
  if (v <= 200)
    return {
      label: "Tidak Sehat",
      color: "bg-yellow-400 text-black",
    };
  if (v <= 300)
    return {
      label: "Sangat Tidak Sehat",
      color: "bg-red-600 text-white",
    };
  return {
    label: "Berbahaya",
    color: "bg-black text-white",
  };
}

// Get pollutant descriptions and recommendations
function getPollutantInfo(pollutantName: string, category: string) {
  const recommendations = {
    "Baik": ["Kualitas udara baik untuk aktivitas normal.", "Tetap jaga kesehatan dengan olahraga teratur."],
    "Sedang": ["Aktivitas outdoor masih aman untuk sebagian besar orang.", "Kelompok sensitif disarankan membatasi aktivitas outdoor yang intens."],
    "Tidak Sehat": ["Batasi aktivitas outdoor.", "Gunakan masker saat beraktivitas di luar ruangan."],
    "Sangat Tidak Sehat": ["Hindari aktivitas outdoor.", "Gunakan masker N95 atau setara.", "Tetap di dalam ruangan dengan ventilasi yang baik."],
    "Berbahaya": ["Hindari semua aktivitas outdoor.", "Gunakan air purifier di dalam ruangan.", "Segera cari pertolongan medis jika mengalami gejala pernapasan."]
  };

  const descriptions = {
    "PM25": "PM 2.5 (Particulate Matter 2.5)",
    "CO": "CO (Carbon Monoksida)",
    "O3": "O3 (Ozon)",
    "NO2": "NO2 (Nitrogen Dioksida)"
  };

  return {
    fullName: descriptions[pollutantName as keyof typeof descriptions] || pollutantName,
    recommendations: recommendations[category as keyof typeof recommendations] || ["Pantau kualitas udara secara berkala."]
  };
}

interface SensorDetailResponse {
  name: string;
  sensorValue: number;
  ispuValue: number;
  dateTime: string;
  location: string;
  unit: string;
}

export default function AirQualityDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [tanggal, setTanggal] = useState("");
  const [jam, setJam] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [startIndex, setStartIndex] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sensorDetail, setSensorDetail] = useState<SensorDetailResponse | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [currentPollutant, setCurrentPollutant] = useState<string>("");


  const windowSize = 7;

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    setUserEmail(email);

    const now = new Date();
    setTanggal(formatTanggalIndonesia(now));
    setJam(formatJamMenit(now));

  }, []);

  // Fetch sensor detail data
  const fetchSensorDetail = async (pollutantParam: string) => {
    try {
      setDataLoading(true);
      const response = await fetch(`http://localhost:8080/api/merge/detail/${pollutantParam}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: SensorDetailResponse = await response.json();
        setSensorDetail(data);

        // Update time display from API data
        const apiDate = new Date(data.dateTime);
        setTanggal(formatTanggalIndonesia(apiDate));
        setJam(formatJamMenit(apiDate));
      } else {
        console.error("Failed to fetch sensor detail");
      }
    } catch (error) {
      console.error("Error fetching sensor detail:", error);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
      const checkAuth = async () => {
        try {
          const response = await fetch("http://localhost:8080/api/auth/me", {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            const userData = await response.json();
            setIsAuthenticated(true);

            const email = userData.email || localStorage.getItem("userEmail");
            setUserEmail(email);

            // Get pollutant parameter and fetch data
            const pollutantParam = searchParams.get("polutan");

            if (pollutantParam) {
              setCurrentPollutant(pollutantParam.toUpperCase());
              await fetchSensorDetail(pollutantParam.toLocaleLowerCase());

              // Generate history data for the specific pollutant
              const today = new Date();
              const data = Array.from({ length: 14 }).map((_, i) => {
                const d = new Date(today);
                d.setDate(today.getDate() - (13 - i));
                const baseValue = pollutantParam.toUpperCase() === 'PM25' ? 60 :
                                 pollutantParam.toUpperCase() === 'CO' ? 220 :
                                 pollutantParam.toUpperCase() === 'NO2' ? 100 : 40;
                const variance = pollutantParam.toUpperCase() === 'PM25' ? 50 :
                               pollutantParam.toUpperCase() === 'CO' ? 50 :
                               pollutantParam.toUpperCase() === 'NO2' ? 40 : 10;
                return {
                  date: formatDayAndDate(d),
                  value: Math.floor(Math.random() * variance + baseValue),
                };
              });
              setHistoryData(data);
            }

          } else {
            setIsAuthenticated(false);
            localStorage.removeItem("userEmail");
            router.push("/");
            return;
          }
        } catch (error) {
          console.error("Auth check failed:", error);
          setIsAuthenticated(false);
          localStorage.removeItem("userEmail");
          router.push("/");
          return;
        } finally {
          setIsLoading(false);
        }
      };

      checkAuth();
    }, [router, searchParams]);

  // Create dynamic pollutant data based on API response
  const getPollutantData = () => {
    if (!sensorDetail) {
      return {
        name: "Memuat data...",
        concentration: "-- µg/m³",
        ispu: 0,
        category: "Memuat...",
        categoryColor: "bg-gray-400 text-white",
        description: "Memuat data sensor...",
        recommendations: ["Tunggu data dimuat."],
      };
    }

    const category = categoryOf(sensorDetail.ispuValue);
    const pollutantInfo = getPollutantInfo(sensorDetail.name, category.label);

    return {
      name: pollutantInfo.fullName,
      concentration: `${sensorDetail.sensorValue} ${sensorDetail.unit}`,
      ispu: sensorDetail.ispuValue,
      category: category.label,
      categoryColor: category.color,
      description: `${pollutantInfo.fullName} berada dalam kategori ${category.label}. Konsentrasi ${sensorDetail.sensorValue} ${sensorDetail.unit} dengan nilai ISPU ${sensorDetail.ispuValue}.`,
      recommendations: pollutantInfo.recommendations,
    };
  };

  const pollutant = getPollutantData();

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
  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8080/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("userEmail");
      router.push("/");
    }
  };

  if (isLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-white font-sans text-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-gray-600">
            Mengambil data...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

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
          {/* Email dropdown */}
          <div className="relative">
            {userEmail && (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-lg hover:bg-blue-700 transition"
                >
                  {userEmail}
                  <svg
                    className={`w-4 h-4 transform transition-transform ${
                      dropdownOpen ? "rotate-180" : "rotate-0"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded-lg shadow-lg border border-gray-200 z-10">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-lg"
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
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
                <span className={`px-2 py-1 rounded-md ${pollutant.categoryColor} text-sm font-semibold`}>
                  {pollutant.concentration}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>ISPU</span>
                <span className={`px-2 py-1 rounded-md ${pollutant.categoryColor} text-sm font-semibold`}>
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
                dataKey="value"
                stroke={currentPollutant === 'PM25' ? '#3b82f6' :
                       currentPollutant === 'CO' ? '#ef4444' :
                       currentPollutant === 'NO2' ? '#f97316' : '#22c55e'}
                name={currentPollutant === 'PM25' ? 'PM 2.5' :
                      currentPollutant === 'CO' ? 'CO' :
                      currentPollutant === 'NO2' ? 'NO₂' : 'O₃'}
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
