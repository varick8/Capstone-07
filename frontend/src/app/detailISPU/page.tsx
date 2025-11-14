"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import Image from "next/image";
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

interface CustomDotProps {
  cx?: number;
  cy?: number;
  payload?: {
    categoryColor?: string;
    [key: string]: unknown;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      date: string;
      value: number;
      category: string;
      categoryColor: string;
      [key: string]: unknown;
    };
  }>;
}

function AirQualityDetailPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [tanggal, setTanggal] = useState("");
  const [jam, setJam] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [historyData, setHistoryData] = useState<Array<{ date: string; dateShort: string; value: number; category: string; categoryColor: string }>>([]);
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/merge/detail/${pollutantParam}`, {
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
            const cat = categoryOf(item.value);
            return {
              date: formatTanggalIndonesia(itemDate),
              dateShort: itemDate.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
              value: item.value,
              category: cat.label,
              categoryColor: cat.color,
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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`, {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, searchParams]);

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/logout`, {
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

  // Helper function to convert Tailwind class to hex color
  const getCategoryHexColor = (categoryColor: string) => {
    if (categoryColor.includes('green-600')) return '#16a34a';
    if (categoryColor.includes('blue-600')) return '#2563eb';
    if (categoryColor.includes('yellow-400')) return '#facc15';
    if (categoryColor.includes('red-600')) return '#dc2626';
    if (categoryColor.includes('black')) return '#000000';
    return '#6b7280'; // default gray
  };

  // Custom dot component
  const CustomDot = (props: CustomDotProps) => {
    const { cx, cy, payload } = props;
    if (!payload) return null;
    const color = getCategoryHexColor(payload.categoryColor || '');
    return (
      <circle
        cx={cx}
        cy={cy}
        r={5}
        fill={color}
        stroke="#fff"
        strokeWidth={2}
      />
    );
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const statusColor = getCategoryHexColor(data.categoryColor || '');
      return (
        <div style={{
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '12px'
        }}>
          <p style={{ margin: '0 0 4px 0', fontWeight: '500' }}>{data.date}</p>
          <p style={{ margin: '2px 0' }}>ISPU: {data.value}</p>
          <p style={{ margin: '2px 0 0 0', fontWeight: 'bold', fontSize: '11px', color: statusColor }}>Status: {data.category}</p>
        </div>
      );
    }
    return null;
  };
  useEffect(() => {
      if (!isAuthenticated || !currentPollutant) return;

      // Fetch sensor data every 60 seconds
      // Date, time, and background are now updated by fetchSensorData
      const fetchInterval = setInterval(() => {
        fetchSensorDetail(currentPollutant.toLowerCase());
      }, 60 * 1000);

      return () => {
        clearInterval(fetchInterval);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, currentPollutant]);

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
      <div className="max-w-[1500px] mx-auto p-3 sm:p-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-blue-900 text-white rounded-2xl px-4 sm:px-5 py-3 sm:py-4 mb-4 sm:mb-6 gap-3 sm:gap-0">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => router.push("/dashboard")}
              className="p-2 rounded-full hover:bg-blue-800"
            >
              <IoArrowBack size={20} className="sm:hidden" />
              <IoArrowBack size={22} className="hidden sm:block" />
            </button>
            <Image src="/icononly_transparent_nobuffer.png" alt="ISPURE Logo" width={32} height={32} className="w-6 h-6 sm:w-8 sm:h-8" />
            <h1 className="text-base sm:text-lg font-semibold">Indeks Standar Pencemaran Udara</h1>
          </div>
          <div className="relative w-full sm:w-auto">
            {userEmail && (
                         <div className="relative">
                           <button
                             onClick={() => setDropdownOpen((prev) => !prev)}
                             className="flex items-center gap-1 text-xs sm:text-sm font-medium px-3 py-1 rounded-lg hover:bg-blue-700 transition w-full sm:w-auto justify-between sm:justify-start"
                           >
                             <span className="truncate max-w-[200px]">{userEmail}</span>
                             <svg
                               className={`w-4 h-4 transform transition-transform flex-shrink-0 ${dropdownOpen ? "rotate-180" : "rotate-0"}`}
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

        {/* Info */}
        <div className="flex flex-col sm:flex-row justify-between bg-blue-50 rounded-2xl px-4 sm:px-5 py-3 mb-4 sm:mb-6 gap-2 sm:gap-0">
          <h2 className="font-bold text-sm sm:text-base">{pollutant.name}</h2>
          <div className="text-xs sm:text-sm text-left sm:text-right">
            <p>
              <span className="font-semibold">Diambil pada:</span> {tanggal}
            </p>
            <p>
              <span className="font-semibold">Pukul:</span> {jam}
            </p>
          </div>
        </div>

        {/* Data utama */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 mb-6 sm:mb-8">
          <Card className="bg-blue-50 p-4">
            <h3 className="font-bold text-blue-700 mb-3 text-sm sm:text-base">Data Utama</h3>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between items-center">
                <span>Konsentrasi</span>
                <span className={`px-2 py-1 rounded-md text-xs sm:text-sm ${pollutant.categoryColor}`}>{pollutant.concentration}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>ISPU</span>
                <span className={`px-2 py-1 rounded-md text-xs sm:text-sm ${pollutant.categoryColor}`}>{pollutant.ispu}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Kategori</span>
                <span className={`px-2 py-1 rounded-md text-xs sm:text-sm ${pollutant.categoryColor}`}>{pollutant.category}</span>
              </div>
            </div>
          </Card>

          <Card className="bg-purple-50 p-4">
            <h3 className="font-bold text-purple-700 mb-3 text-sm sm:text-base">Deskripsi Singkat</h3>
            <p className="text-xs sm:text-sm leading-relaxed">{pollutant.description}</p>
          </Card>

          <Card className="bg-green-50 p-4">
            <h3 className="font-bold text-green-700 mb-3 text-sm sm:text-base">Rekomendasi</h3>
            <ul className="list-decimal list-inside text-xs sm:text-sm space-y-1">
              {pollutant.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Diagram History ISPU */}
        <div className="space-y-3">
        <Card className="p-4 sm:p-6 h-[350px] sm:h-[400px] bg-slate-100 relative">
          {dataLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
                <p className="text-gray-600 text-sm">Memuat data historis...</p>
              </div>
            </div>
          ) : historyData.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 text-sm">Tidak ada data historis tersedia</p>
            </div>
          ) : (
            <>
              {/* Tombol navigasi */}
              <button
                onClick={handlePrev}
                disabled={startIndex === 0}
                className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-1.5 sm:p-2 hover:bg-gray-100 disabled:opacity-40 z-10"
              >
                <ChevronLeft size={16} className="sm:hidden" />
                <ChevronLeft size={20} className="hidden sm:block" />
              </button>
              <button
                onClick={handleNext}
                disabled={startIndex + windowSize >= historyData.length}
                className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-1.5 sm:p-2 hover:bg-gray-100 disabled:opacity-40 z-10"
              >
                <ChevronRight size={16} className="sm:hidden" />
                <ChevronRight size={20} className="hidden sm:block" />
              </button>

              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={visibleData}
                  margin={{ top: 40, right: 40, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                  <XAxis
                    dataKey="dateShort"
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: "10px", color: "#f97316" }} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#f97316"
                    name={currentPollutant === 'PM25' ? 'PM₂.₅' :
                          currentPollutant === 'CO' ? 'CO' :
                          currentPollutant === 'NO2' ? 'NO₂' : 'O₃'}
                    strokeWidth={2}
                    dot={<CustomDot />}
                    activeDot={{ r: 7, fill: "#f97316", stroke: "#f97316" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </>
          )}
        </Card>
        </div>
      </div>
    </div>
  );
}

export default function AirQualityDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white font-sans text-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Mengambil data...</p>
        </div>
      </div>
    }>
      <AirQualityDetailPageContent />
    </Suspense>
  );
}