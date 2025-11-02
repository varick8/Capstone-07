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

function formatTanggalIndonesia(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
function formatJamMenit(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

// Kategori ISPU
function categoryOf(v: number) {
  if (v <= 50) return { label: "Baik", color: "bg-green-600 text-white" };
  if (v <= 100) return { label: "Sedang", color: "bg-blue-600 text-white" };
  if (v <= 200) return { label: "Tidak Sehat", color: "bg-yellow-400 text-black" };
  if (v <= 300) return { label: "Sangat Tidak Sehat", color: "bg-red-600 text-white" };
  return { label: "Berbahaya", color: "bg-black text-white" };
}

// Rekomendasi per polutan
const recommendations: Record<string, Record<string, string[]>> = {
  "PM25": {
    "Baik": ["Aktivitas luar ruangan normal.",
            "Nikmati udara segar hari ini.",
            "Tetap jaga kebersihan lingkungan sekitar.",
    ],
    "Sedang": [
      "Kelompok sensitif perlu berhati-hati.",
      "Kurangi aktivitas fisik berat di luar.",
      "Pantau kualitas udara secara berkala.",
    ],
    "Tidak Sehat": [
      "Batasi aktivitas luar ruangan.",
      "Gunakan masker bila ada gejala sesak.",
      "Tutup jendela untuk mencegah udara kotor masuk.",
    ],
    "Sangat Tidak Sehat": [
      "Hindari aktivitas luar ruangan.",
      "Tetap di dalam dengan udara bersih.",
      "Gunakan pembersih udara (air purifier) bila memungkinkan.",
    ],
    "Berbahaya": [
      "Jangan keluar rumah sama sekali.",
      "Segera cari bantuan medis bila perlu.",
       "Ikuti informasi darurat dari pihak berwenang.",
    ],
  },
  "NO2": {
    "Baik": ["Aktivitas normal, aman.",
    "Udara bersih, cocok untuk olahraga ringan.",
    "Tetap jaga kebersihan udara sekitar.",
    ],
    "Sedang": [
      "Kelompok sensitif kurangi aktivitas di dekat jalan ramai.",
      "Hindari olahraga di area padat lalu lintas.",
      "Gunakan masker ringan bila terasa sesak."
    ],
    "Tidak Sehat": [
      "Kurangi paparan lalu lintas.",
      "Gunakan masker karbon aktif bila perlu.",
      "Jaga ventilasi rumah tetap bersih dan tertutup."
    ],
    "Sangat Tidak Sehat": [
      "Hindari keluar rumah dekat sumber polusi.",
      "Gunakan respirator dengan filter karbon aktif.",
      "Tetap di ruangan dengan udara bersih.",
    ],
    "Berbahaya": [
      "Jangan keluar rumah sama sekali.",
      "Cari tempat aman dengan kualitas udara lebih bersih.",
       "Segera konsultasikan ke dokter bila ada gejala berat.",
    ],
  },
  "O3": {
    "Baik": ["Aktivitas luar ruangan normal.",
    "Udara cukup bersih untuk berolahraga.",
    "Tetap pantau kualitas udara bila berada di kota besar.",
    ],
    "Sedang": [
      "Kelompok sensitif perlu berhati-hati.",
      "Kurangi aktivitas fisik berat di luar.",
      "Hindari paparan sinar matahari langsung terlalu lama.",
    ],
    "Tidak Sehat": [
      "Batasi waktu di luar, terutama siang hari.",
      "Gunakan masker bila ada gejala sesak.",
      "Tutup jendela rumah untuk mengurangi paparan ozon.",
    ],
    "Sangat Tidak Sehat": [
      "Hindari aktivitas luar ruangan.",
      "Gunakan HEPA purifier bila di dalam ruangan.",
      "Minum air putih lebih banyak untuk menjaga kesehatan paru."
    ],
    "Berbahaya": [
      "Jangan keluar rumah sama sekali.",
      "Cari bantuan medis bila mengalami gejala berat.",
      "Ikuti peringatan darurat dari pihak berwenang.",
    ],
  },
  "CO": {
    "Baik": ["Aktivitas normal, udara sehat.",
    "Cocok untuk olahraga luar ruangan.",
    "Tetap waspadai area dengan lalu lintas padat."

    ],
    "Sedang": [
      "Kelompok rentan lebih waspada.",
      "Kurangi aktivitas di area lalu lintas padat.",
       "Pastikan ventilasi udara di rumah tetap baik.",
    ],
    "Tidak Sehat": [
      "Batasi waktu di dekat sumber emisi.",
      "Gunakan masker karbon aktif jika perlu.",
      "Hindari area dengan banyak kendaraan bermotor.",
    ],
    "Sangat Tidak Sehat": [
      "Hindari aktivitas luar ruangan di area padat kendaraan.",
      "Tetap di dalam dengan ventilasi bersih.",
      "Gunakan pembersih udara jika tersedia.",
    ],
    "Berbahaya": [
      "Jangan keluar rumah sama sekali.",
      "Segera cari pertolongan medis bila ada gejala.",
      "Ikuti panduan evakuasi dari otoritas setempat.",
    ],
  },
};

// Deskripsi polutan
function getPollutantInfo(
  pollutantName: string,
  category: string,
  sensorValue?: number,
  unit?: string,
  ispu?: number
) {
  const descriptions: Record<string, Record<string, string>> = {
    CO: {
      Baik: `CO berada dalam kategori Baik. Konsentrasi ${sensorValue} ${unit} aman untuk semua aktivitas.`,
      Sedang: `CO Sedang. Konsentrasi ${sensorValue} ${unit} masih aman namun kelompok sensitif sebaiknya berhati-hati.`,
      "Tidak Sehat": `CO Tidak Sehat. Konsentrasi ${sensorValue} ${unit} dapat menimbulkan gangguan pernapasan.`,
      "Sangat Tidak Sehat": `CO Sangat Tidak Sehat. Konsentrasi ${sensorValue} ${unit} menunjukkan udara buruk.`,
      Berbahaya: `CO Berbahaya. Konsentrasi ${sensorValue} ${unit} dapat menyebabkan dampak serius.`,
    },
    O3: {
      Baik: `O₃ Baik. Konsentrasi ${sensorValue} ${unit} (ISPU ${ispu}) menunjukkan udara sehat.`,
      Sedang: `O₃ Sedang. Konsentrasi ${sensorValue} ${unit} (ISPU ${ispu}) aman bagi sebagian besar orang.`,
      "Tidak Sehat": `O₃ Tidak Sehat. Dapat mengganggu pernapasan.`,
      "Sangat Tidak Sehat": `O₃ Sangat Tidak Sehat. Berisiko bagi semua kelompok.`,
      Berbahaya: `O₃ Berbahaya. Dapat menyebabkan dampak kesehatan serius.`,
    },
    PM25: {
      Baik: `PM₂.₅ Baik. Konsentrasi ${sensorValue} ${unit} aman.`,
      Sedang: `PM₂.₅ Sedang. Dapat menimbulkan gejala ringan bagi kelompok sensitif.`,
      "Tidak Sehat": `PM₂.₅ Tidak Sehat. Dapat menimbulkan gangguan pernapasan.`,
      "Sangat Tidak Sehat": `PM₂.₅ Sangat Tidak Sehat. Berisiko tinggi bagi kesehatan.`,
      Berbahaya: `PM₂.₅ Berbahaya. Dapat menyebabkan dampak serius bagi semua orang.`,
    },
    NO2: {
      Baik: `NO₂ Baik. Konsentrasi ${sensorValue} ${unit} aman.`,
      Sedang: `NO₂ Sedang. Dapat memengaruhi kelompok sensitif.`,
      "Tidak Sehat": `NO₂ Tidak Sehat. Dapat memperburuk kondisi pernapasan.`,
      "Sangat Tidak Sehat": `NO₂ Sangat Tidak Sehat. Berisiko tinggi untuk kesehatan.`,
      Berbahaya: `NO₂ Berbahaya. Dapat menyebabkan dampak serius.`,
    },
  };

  const fullNames: Record<string, string> = {
    PM25: "PM₂.₅ (Particulate Matter 2.5)",
    CO: "CO (Carbon Monoksida)",
    O3: "O₃ (Ozon)",
    NO2: "NO₂ (Nitrogen Dioksida)",
  };

  const recs = recommendations[pollutantName]?.[category] || ["Pantau kualitas udara secara berkala."];

  return {
    fullName: fullNames[pollutantName] || pollutantName,
    description:
      descriptions[pollutantName]?.[category] ||
      `${pollutantName} berada dalam kategori ${category}.`,
    recommendations: recs,
  };
}

interface HistoricalData {
  date: string;
  value: number;
}

interface SensorDetailResponse {
  name: string;
  sensorValue: string | number;
  ispuValue: number;
  dateTime: string;
  location: string;
  unit: string;
  historical: HistoricalData[];
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
  const [currentCategory, setCurrentCategory] = useState<string>("");

  const windowSize = 7;

  // Normalisasi nama polutan
  const canonicalPollutant = (raw: string | null | undefined) => {
    if (!raw) return "";
    const s = String(raw).toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (s.includes("PM25") || s.includes("PM2")) return "PM25";
    if (s.includes("CO")) return "CO";
    if (s.includes("O3")) return "O3";
    if (s.includes("NO2")) return "NO2";
    return s;
  };

  // Fetch sensor detail
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
        const canonical = canonicalPollutant(data.name);
        setSensorDetail({ ...data, name: canonical });
        const cat = categoryOf(data.ispuValue);
        setCurrentCategory(cat.label);

        // Update date and time from API response
        const apiDate = new Date(data.dateTime);
        setTanggal(formatTanggalIndonesia(apiDate));
        setJam(formatJamMenit(apiDate));

        // Process historical data from API
        if (data.historical && data.historical.length > 0) {
          const processedHistory = data.historical.map((item) => {
            const itemDate = new Date(item.date);
            return {
              date: formatTanggalIndonesia(itemDate),
              dateShort: itemDate.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
              value: item.value,
            };
          });
          setHistoryData(processedHistory);
          // Set startIndex to show the most recent data
          const maxStart = Math.max(0, processedHistory.length - windowSize);
          setStartIndex(maxStart);
        }
      } else console.error("Gagal fetch sensor detail");
    } catch (e) {
      console.error("Error fetching detail:", e);
    } finally {
      setDataLoading(false);
    }
  };

  // Check auth + load data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/auth/me", {
          credentials: "include",
        });
        if (!res.ok) {
          setIsAuthenticated(false);
          router.push("/");
          return;
        }
        setIsAuthenticated(true);
        const userData = await res.json();
        setUserEmail(userData.email || localStorage.getItem("userEmail"));

        const pollutantParamRaw = searchParams.get("polutan");
        const normalized = canonicalPollutant(pollutantParamRaw);
        if (normalized) {
          setCurrentPollutant(normalized);
          await fetchSensorDetail(normalized.toLowerCase());
        }
      } catch {
        setIsAuthenticated(false);
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [router, searchParams]);

  // Data polutan
  const getPollutantData = () => {
    if (!sensorDetail)
      return {
        name: "Memuat data...",
        concentration: "--",
        ispu: 0,
        category: "Memuat...",
        categoryColor: "bg-gray-300",
        description: "Memuat data sensor...",
        recommendations: ["Tunggu data dimuat."],
      };

    const cat = categoryOf(sensorDetail.ispuValue);
    const label = currentCategory || cat.label;
    const sensorValueNum = typeof sensorDetail.sensorValue === 'string' 
      ? parseFloat(sensorDetail.sensorValue) 
      : sensorDetail.sensorValue;
    const info = getPollutantInfo(sensorDetail.name, label, sensorValueNum, sensorDetail.unit, sensorDetail.ispuValue);

    return {
      name: info.fullName,
      concentration: `${sensorDetail.sensorValue} ${sensorDetail.unit}`,
      ispu: sensorDetail.ispuValue,
      category: label,
      categoryColor: cat.color,
      description: info.description,
      recommendations: info.recommendations,
    };
  };

  const pollutant = getPollutantData();
  const visibleData = historyData.slice(startIndex, startIndex + windowSize);
  useEffect(() => {
      if (!isAuthenticated) return;
  
      // Fetch sensor data every 30 seconds
      // Date, time, and background are now updated by fetchSensorData
      const fetchInterval = setInterval(() => {
        fetchSensorDetail(currentPollutant.toLowerCase());
      }, 60 * 1000);
  
      return () => {
        clearInterval(fetchInterval);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white font-sans text-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Mengambil data...</p>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) return null;
  
  // Fungsi navigasi untuk diagram
    const handlePrev = () => {
      if (startIndex > 0) {
        setStartIndex(startIndex - 1);
      }
    };

    const handleNext = () => {
      if (startIndex + windowSize < historyData.length) {
        setStartIndex(startIndex + 1);
      }
    };

   return (
    <div className="min-h-screen bg-white font-sans text-black">
      <div className="max-w-[1500px] mx-auto p-5">
        {/* Header */}
        <div className="flex justify-between items-center bg-blue-900 text-white rounded-2xl px-5 py-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="p-2 rounded-full hover:bg-blue-800"
            >
              <IoArrowBack size={22} />
            </button>
            <h1 className="text-lg font-semibold">Indeks Standar Pencemaran Udara</h1>
          </div>
          <div className="relative">
            {userEmail && (
              <>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="px-3 py-1 rounded-lg hover:bg-blue-700"
                >
                  {userEmail}
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 bg-white text-black rounded-lg shadow-lg border border-gray-200 z-10">
                    <button
                      onClick={() => {
                        localStorage.removeItem("userEmail");
                        router.push("/");
                      }}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex justify-between bg-blue-50 rounded-2xl px-5 py-3 mb-6">
          <h2 className="font-bold">{pollutant.name}</h2>
          <div className="text-sm text-right">
            <p>
              <span className="font-semibold">Diambil pada:</span> {tanggal}
            </p>
            <p>
              <span className="font-semibold">Pukul:</span> {jam}
            </p>
          </div>
        </div>

        {/* Data utama */}
        <div className="grid grid-cols-12 gap-5 mb-8">
          <Card className="col-span-12 md:col-span-4 bg-blue-50 p-4">
            <h3 className="font-bold text-blue-700 mb-3">Data Utama</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Konsentrasi</span>
                <span className={`px-2 py-1 rounded-md ${pollutant.categoryColor}`}>{pollutant.concentration}</span>
              </div>
              <div className="flex justify-between">
                <span>ISPU</span>
                <span className={`px-2 py-1 rounded-md ${pollutant.categoryColor}`}>{pollutant.ispu}</span>
              </div>
              <div className="flex justify-between">
                <span>Kategori</span>
                <span className={`px-2 py-1 rounded-md ${pollutant.categoryColor}`}>{pollutant.category}</span>
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
          {dataLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
                <p className="text-gray-600">Memuat data historis...</p>
              </div>
            </div>
          ) : historyData.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Tidak ada data historis tersedia</p>
            </div>
          ) : (
            <>
              {/* Tombol navigasi */}
              <button
                onClick={handlePrev}
                disabled={startIndex === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2 hover:bg-gray-100 disabled:opacity-40 z-10"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={handleNext}
                disabled={startIndex + windowSize >= historyData.length}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2 hover:bg-gray-100 disabled:opacity-40 z-10"
              >
                <ChevronRight size={20} />
              </button>

              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={visibleData}
                  margin={{ top: 50, right: 60, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                  <XAxis
                    dataKey="dateShort"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#f9fafb",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                    labelFormatter={(label, payload) => {
                      if (payload && payload.length > 0) {
                        return payload[0].payload.date;
                      }
                      return label;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={currentPollutant === 'PM25' ? '#3b82f6' :
                           currentPollutant === 'CO' ? '#ef4444' :
                           currentPollutant === 'NO2' ? '#f97316' : '#22c55e'}
                    name={currentPollutant === 'PM25' ? 'PM₂.₅' :
                          currentPollutant === 'CO' ? 'CO' :
                          currentPollutant === 'NO2' ? 'NO₂' : 'O₃'}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}