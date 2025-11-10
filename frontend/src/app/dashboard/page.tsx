"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogOut, Thermometer, Droplets } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

/** Interfaces */
interface SensorData {
  dateTime: string;
  location: string;
  sensors: {
    co: { name: string; value: number; unit: string; ispuValue: number };
    pm25: { name: string; value: number; unit: string; ispuValue: number };
    no2: { name: string; value: number; unit: string; ispuValue: number };
    o3: { name: string; value: number; unit: string; ispuValue: number };
    temp: { name: string; value: number; unit: string };
    hum: { name: string; value: number; unit: string };
  };
}

interface DetailedDataItem {
  name: string;
  value: string;
  unit: string;
  status: string;
  statusColor: string;
  dotColor: string;
  ispuValue: number;
}

/** Simple Card component (local) */
function Card({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e: React.KeyboardEvent<HTMLDivElement>) => {
              if (e.key === "Enter" || e.key === " ") onClick();
            }
          : undefined
      }
      className={`rounded-2xl shadow-md bg-blue-50 text-black transition
        ${onClick ? "cursor-pointer hover:scale-[1.02] hover:shadow-lg active:scale-[0.99]" : ""}
        ${className}`}
    >
      {children}
    </div>
  );
}

/** Category helper */
function categoryOf(v: number) {
  if (v <= 50)
    return { label: "Baik", dot: "#00B050", chip: "bg-green-600 text-white" };
  if (v <= 100)
    return { label: "Sedang", dot: "#0000FF", chip: "bg-blue-600 text-white" };
  if (v <= 200)
    return { label: "Tidak Sehat", dot: "#FFFF00", chip: "bg-yellow-400 text-black" };
  if (v <= 300)
    return { label: "Sangat Tidak Sehat", dot: "#FF0000", chip: "bg-red-600 text-white" };
  return { label: "Berbahaya", dot: "#000000", chip: "bg-black text-white" };
}
function getStatusFromISPU(ispuValue: number) {
  const category = categoryOf(ispuValue);
  return { status: category.label, statusColor: category.dot, dotColor: category.dot };
}

/** Warnings (text) */
const warnings: Record<string, string> = {
  "PM₂.₅": "Kadar PM₂.₅ tinggi",
  "NO₂": "Kadar NO₂ tinggi",
  "O₃": "Kadar O₃ tinggi",
  CO: "Kadar CO tinggi",
};

/** Recommendations (1 icon per status) */
const detailedRecommendations: Record<
  string,
  Record<string, { icon: string; texts: string[] }>
> = {
  "PM₂.₅": {
    Baik: {
      icon: "/happy.png",
      texts: [
        "Aktivitas luar ruangan normal.",
        "Nikmati udara segar hari ini.",
        "Tetap jaga kebersihan lingkungan sekitar.",
      ],
    },
    Sedang: {
      icon: "/home.png",
      texts: [
        "Kelompok sensitif perlu berhati-hati.",
        "Kurangi aktivitas fisik berat di luar.",
        "Pantau kualitas udara secara berkala.",
      ],
    },
    "Tidak Sehat": {
      icon: "/mask.png",
      texts: [
        "Batasi aktivitas luar ruangan.",
        "Gunakan masker bila ada gejala sesak.",
        "Tutup jendela untuk mencegah udara kotor masuk.",
      ],
    },
    "Sangat Tidak Sehat": {
      icon: "/home.png",
      texts: [
        "Hindari aktivitas luar ruangan.",
        "Tetap di dalam dengan udara bersih.",
        "Gunakan pembersih udara (air purifier) bila memungkinkan.",
      ],
    },
    Berbahaya: {
      icon: "/home.png",
      texts: [
        "Jangan keluar rumah sama sekali.",
        "Segera cari bantuan medis bila perlu.",
        "Ikuti informasi darurat dari pihak berwenang.",
      ],
    },
  },
  CO: {
    Baik: {
      icon: "/happy.png",
      texts: [
        "Udara sehat, aman beraktivitas.",
        "Cocok untuk olahraga luar ruangan.",
        "Tetap waspadai area dengan lalu lintas padat.",
      ],
    },
    Sedang: {
      icon: "/people.png",
      texts: [
        "Kelompok rentan lebih waspada.",
        "Kurangi aktivitas di area lalu lintas padat.",
        "Pastikan ventilasi udara di rumah tetap baik.",
      ],
    },
    "Tidak Sehat": {
      icon: "/mask.png",
      texts: [
        "Batasi waktu di dekat sumber emisi.",
        "Gunakan masker karbon aktif jika perlu.",
        "Hindari area dengan banyak kendaraan bermotor.",
      ],
    },
    "Sangat Tidak Sehat": {
      icon: "/home.png",
      texts: [
        "Hindari aktivitas luar ruangan di area padat kendaraan.",
        "Tetap di dalam dengan ventilasi bersih.",
        "Gunakan pembersih udara jika tersedia.",
      ],
    },
    Berbahaya: {
      icon: "/home.png",
      texts: [
        "Jangan keluar rumah sama sekali.",
        "Segera cari pertolongan medis bila ada gejala.",
        "Ikuti panduan evakuasi dari otoritas setempat.",
      ],
    },
  },
  "O₃": {
    Baik: {
      icon: "/happy.png",
      texts: [
        "Aktivitas luar ruangan normal.",
        "Udara cukup bersih untuk berolahraga.",
        "Tetap pantau kualitas udara bila berada di kota besar.",
      ],
    },
    Sedang: {
      icon: "/home.png",
      texts: [
        "Kelompok sensitif perlu berhati-hati.",
        "Kurangi aktivitas fisik berat di luar.",
        "Hindari paparan sinar matahari langsung terlalu lama.",
      ],
    },
    "Tidak Sehat": {
      icon: "/mask.png",
      texts: [
        "Batasi waktu di luar, terutama siang hari.",
        "Gunakan masker bila ada gejala sesak.",
        "Tutup jendela rumah untuk mengurangi paparan ozon.",
      ],
    },
    "Sangat Tidak Sehat": {
      icon: "/home.png",
      texts: [
        "Hindari aktivitas luar ruangan.",
        "Gunakan HEPA purifier bila di dalam ruangan.",
        "Minum air putih lebih banyak untuk menjaga kesehatan paru.",
      ],
    },
    Berbahaya: {
      icon: "/home.png",
      texts: [
        "Jangan keluar rumah sama sekali.",
        "Cari bantuan medis bila mengalami gejala berat.",
        "Ikuti peringatan darurat dari pihak berwenang.",
      ],
    },
  },
  "NO₂": {
    Baik: {
      icon: "/happy.png",
      texts: [
        "Aktivitas normal, aman.",
        "Udara bersih, cocok untuk olahraga ringan.",
        "Tetap jaga kebersihan udara sekitar.",
      ],
    },
    Sedang: {
      icon: "/people.png",
      texts: [
        "Kelompok sensitif kurangi aktivitas di dekat jalan ramai.",
        "Hindari olahraga di area padat lalu lintas.",
        "Gunakan masker ringan bila terasa sesak.",
      ],
    },
    "Tidak Sehat": {
      icon: "/mask.png",
      texts: [
        "Kurangi paparan lalu lintas.",
        "Gunakan masker karbon aktif bila perlu.",
        "Jaga ventilasi rumah tetap bersih dan tertutup.",
      ],
    },
    "Sangat Tidak Sehat": {
      icon: "/home.png",
      texts: [
        "Hindari keluar rumah dekat sumber polusi.",
        "Gunakan respirator dengan filter karbon aktif.",
        "Tetap di ruangan dengan udara bersih.",
      ],
    },
    Berbahaya: {
      icon: "/home.png",
      texts: [
        "Jangan keluar rumah sama sekali.",
        "Cari tempat aman dengan kualitas udara lebih bersih.",
        "Segera konsultasikan ke dokter bila ada gejala berat.",
      ],
    },
  },
};

export default function AirQualityDashboard() {
  const router = useRouter();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [temperature, setTemperature] = useState("26 °C");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [detailedData, setDetailedData] = useState<DetailedDataItem[]>([]);
  const [ispuData, setIspuData] = useState([
    { name: "PM₂.₅", value: 0 },
    { name: "CO", value: 0 },
    { name: "O₃", value: 0 },
    { name: "NO₂", value: 0 },
  ]);

  // Background style that changes according to hour
  const [bgStyle, setBgStyle] = useState("bg-[url('/background.png')] bg-cover bg-center");
  const [gradientStyle, setGradientStyle] = useState("");
  const [textColor, setTextColor] = useState("text-blue-900");

  // Fetch sensor data from backend
  const fetchSensorData = async () => {
    try {
      const response = await fetch("https://capstone-07-backend.vercel.app/api/merge/home", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        console.error("Fetch sensor data failed, status:", response.status);
        return;
      }

      const data: SensorData = await response.json();
      setSensorData(data);
      setTemperature(`${data.sensors.temp.value} ${data.sensors.temp.unit}`);

      // Update date and time from API response
      if (data.dateTime) {
        const apiDate = new Date(data.dateTime);
        setCurrentDate(
          apiDate.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        );
        setCurrentTime(apiDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }));

        // Update background based on API time
        const hours = apiDate.getHours();
        if (hours >= 5 && hours < 11) {
      setBgStyle("bg-[url('/morning.png')] bg-cover bg-center bg-no-repeat");
      setGradientStyle("from-black/40 to-transparent");
      setTextColor("text-blue-900");
    } else if (hours >= 11 && hours < 16) {
      setBgStyle("bg-[url('/afternoon.png')] bg-cover bg-center bg-no-repeat");
      setGradientStyle("from-black/30 to-transparent");
      setTextColor("text-blue-900");
    } else if (hours >= 16 && hours < 18) {
      setBgStyle("bg-[url('/evening.png')] bg-cover bg-center bg-no-repeat");
      setGradientStyle("from-black/35 to-transparent");
      setTextColor("text-white");
    } else {
      setBgStyle("bg-[url('/night.png')] bg-cover bg-center bg-no-repeat");
      setGradientStyle("from-black/15 to-transparent");
      setTextColor("text-white");
    }

      }

      const newDetailedData: DetailedDataItem[] = [
        {
          name: "PM₂.₅",
          value: `${data.sensors.pm25.value}`,
          unit: data.sensors.pm25.unit,
          ispuValue: data.sensors.pm25.ispuValue,
          ...getStatusFromISPU(data.sensors.pm25.ispuValue),
        },
        {
          name: "CO",
          value: `${data.sensors.co.value}`,
          unit: data.sensors.co.unit,
          ispuValue: data.sensors.co.ispuValue,
          ...getStatusFromISPU(data.sensors.co.ispuValue),
        },
        {
          name: "O₃",
          value: `${data.sensors.o3.value}`,
          unit: data.sensors.o3.unit,
          ispuValue: data.sensors.o3.ispuValue,
          ...getStatusFromISPU(data.sensors.o3.ispuValue),
        },
        {
          name: "NO₂",
          value: `${data.sensors.no2.value}`,
          unit: data.sensors.no2.unit,
          ispuValue: data.sensors.no2.ispuValue,
          ...getStatusFromISPU(data.sensors.no2.ispuValue),
        },
      ];

      setDetailedData(newDetailedData);

      const ispuChartData = [
        { name: "PM₂.₅", value: data.sensors.pm25.ispuValue },
        { name: "CO", value: data.sensors.co.ispuValue },
        { name: "O₃", value: data.sensors.o3.ispuValue },
        { name: "NO₂", value: data.sensors.no2.ispuValue },
      ];
      setIspuData(ispuChartData);
    } catch (error) {
      console.error("Error fetching sensor data:", error);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("https://capstone-07-backend.vercel.app/api/auth/me", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          const userData = await response.json();
          setIsAuthenticated(true);
          const email = userData.email || localStorage.getItem("userEmail");
          setUserEmail(email);
          // Fetch initial sensor data
          await fetchSensorData();
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem("userEmail");
          router.push("/");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
        localStorage.removeItem("userEmail");
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Fetch sensor data every 30 seconds
    // Date, time, and background are now updated by fetchSensorData
    const fetchInterval = setInterval(() => {
      fetchSensorData();
    }, 60 * 1000);

    return () => {
      clearInterval(fetchInterval);
    };
  }, [isAuthenticated]);

  const handleLogout = async () => {
    try {
      await fetch("https://capstone-07-backend.vercel.app/api/auth/logout", {
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

  // Determine worst pollutant
  const worstPollutant: DetailedDataItem = (() => {
    if (!detailedData || detailedData.length === 0) {
      return {
        name: "PM₂.₅",
        value: "0",
        unit: "µg/m³",
        status: "Baik",
        statusColor: categoryOf(0).dot,
        dotColor: categoryOf(0).dot,
        ispuValue: 0,
      } as DetailedDataItem;
    }
    const order = ["Baik", "Sedang", "Tidak Sehat", "Sangat Tidak Sehat", "Berbahaya"];
    return detailedData.reduce((prev, curr) => {
      const prevIdx = order.indexOf(prev.status);
      const currIdx = order.indexOf(curr.status);
      if (currIdx > prevIdx) return curr;
      if (currIdx === prevIdx && curr.ispuValue > prev.ispuValue) return curr;
      return prev;
    }, detailedData[0]);
  })();

  // Get recommendation object (icon + texts) for the worst pollutant & status
  const recData = detailedRecommendations[worstPollutant.name]?.[worstPollutant.status];

  const recTexts = recData?.texts ?? [];
  const recIcon = recData?.icon ?? "/happy.png";

  const recsStringList = recTexts; // for compatibility with old code naming

  const pollutantMapping: Record<string, string> = {
    "PM₂.₅": "PM25",
    "PM2.5": "PM25",
    CO: "CO",
    "O₃": "O3",
    O3: "O3",
    "NO₂": "NO2",
    NO2: "NO2",
  };

  const goToDetail = (polutan: string) => {
    const apiParam = pollutantMapping[polutan] || polutan;
    router.push(`/detailISPU?polutan=${encodeURIComponent(apiParam)}`);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-black ">
      <div className="max-w-[1500px] mx-auto p-3 sm:p-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-blue-900 text-white rounded-2xl px-4 sm:px-5 py-3 sm:py-4 mb-4 sm:mb-6 gap-3 sm:gap-0">
          <div className="flex items-center gap-3">
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

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4 sm:mb-6">
          {/* Location & Date */}
          <Card
        className={`relative lg:col-span-2 px-4 sm:px-5 py-3 sm:py-4 ${bgStyle} rounded-2xl overflow-hidden transition-all duration-700 ease-in-out min-h-[120px] sm:min-h-[80px]`}>
        <div
          className={`absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t ${gradientStyle} pointer-events-none rounded-b-2xl`}
        ></div>
        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center h-full drop-shadow-md gap-2 sm:gap-0">
          <div className="flex flex-col">
            <span className={`font-extrabold ${textColor} text-sm sm:text-base`}>
              📍 {sensorData?.location || "Sleman, Yogyakarta"}
            </span>
            <span className={`flex items-center gap-2 sm:gap-3 text-xs ${textColor}`}>
              <span className="flex items-center gap-1">
                <Thermometer className="w-3 h-3 sm:w-4 sm:h-4 text-blue-300" />
                {temperature}
              </span>
              <span className="flex items-center gap-1">
                <Droplets className="w-3 h-3 sm:w-4 sm:h-4 text-blue-300" />
                {sensorData?.sensors?.hum?.value ?? "--"}
                {sensorData?.sensors?.hum?.unit ?? "%"}
              </span>
            </span>
          </div>

          <div className="text-left sm:text-right text-xs sm:text-sm">
            <p className={`font-extrabold ${textColor}`}>{currentDate}</p>
            <p className={`font-extrabold ${textColor}`}>{currentTime}</p>
          </div>
        </div>
      </Card>

          {/* ISPU Summary */}
          <Card className="p-3 bg-slate-100 lg:row-span-2">
            <p className="font-bold text-sm sm:text-base text-center mb-2">Hasil ISPU</p>
            <div className="space-y-2">
              {ispuData.map((row, i) => {
                const cat = categoryOf(row.value);
                return (
                  <div
                    key={i}
                    onClick={() => goToDetail(row.name)}
                    className={`flex flex-col items-center justify-center rounded-lg px-2 py-2 sm:py-3 text-white cursor-pointer transition active:scale-[0.97] hover:scale-[1.02] hover:shadow-lg hover:opacity-90 ${cat.chip}`}
                  >
                    <div className="flex items-center justify-center gap-2 w-full">
                      <p className="text-sm sm:text-[15px] font-semibold">{row.name} :</p>
                      <p className="text-sm font-bold">{Math.round(row.value)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Warning + Recommendation */}
          <div className="lg:col-span-2 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-start w-full">
            {worstPollutant.status === "Baik" ? (
              <Card className="flex flex-col items-center justify-center bg-green-100 border-l-4 border-green-600 py-3 sm:py-4 px-4 sm:px-6 w-full sm:w-auto sm:min-w-[180px]">
                <div className="text-green-600 text-xl sm:text-2xl mb-1">✓</div>
                <p className="font-bold text-green-700 leading-tight text-sm sm:text-base">STATUS</p>
                <p className="text-xs text-center mt-1 text-green-700">
                  Udara dalam kondisi baik
                </p>
              </Card>
            ) : (
              <Card className="flex flex-col items-center justify-center bg-red-100 border-l-4 border-red-600 py-3 sm:py-4 px-4 sm:px-6 w-full sm:w-auto sm:min-w-[180px]">
                <div className="text-red-600 text-xl sm:text-2xl mb-1">⚠</div>
                <p className="font-bold text-red-700 leading-tight text-sm sm:text-base">PERINGATAN</p>
                <p className="text-xs text-center mt-1">
                  {worstPollutant.status === "Sedang"
                    ? "Udara dalam kondisi sedang"
                    : warnings[worstPollutant.name] || `Kadar ${worstPollutant.name} ${worstPollutant.status.toLowerCase()}`}
                </p>
              </Card>
            )}

            <Card className="flex flex-col bg-blue-100 py-3 sm:py-4 px-4 sm:px-6 flex-1">
              <p className="font-bold mb-2 text-center text-sm sm:text-base">Rekomendasi</p>
              <div className="flex flex-row items-center gap-3">
                <div className="flex-shrink-0">
                  <Image src={recIcon} alt="icon rekomendasi" width={40} height={40} className="w-10 h-10 sm:w-12 sm:h-12" />
                </div>
                <Card className="p-3 sm:p-4 border-slate-200 bg-white w-full">
                  <ul className="list-disc list-inside text-xs space-y-1 text-gray-700">
                    {recsStringList.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                    {recsStringList.length === 0 && <li>Tidak ada rekomendasi tersedia.</li>}
                  </ul>
                </Card>
              </div>
            </Card>
          </div>
        </div>

        {/* Detailed pollutant cards + chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8">
            <Card className="row-span-4 p-4 sm:p-6 lg:p-10 bg-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {detailedData.map((item, idx) => (
                  <Card
                    key={idx}
                    onClick={() => goToDetail(item.name)}
                    className="p-3 sm:p-4 border-slate-200 bg-white hover:bg-slate-200 hover:shadow-md transition cursor-pointer active:scale-[0.99]"
                  >
                    <div className="flex flex-col justify-between h-full">
                      <div className="flex justify-between items-start">
                        <span className="px-2 py-1 rounded-md bg-blue-900 text-white text-sm sm:text-[15px] font-semibold">
                          {item.name}
                        </span>
                        <p className="text-lg sm:text-xl font-bold">{item.value}</p>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center gap-2">
                          <Dot color={item.dotColor} />
                          <p className="text-sm sm:text-base font-medium" style={{ color: item.statusColor }}>
                            {item.status}
                          </p>
                        </div>
                        <p className="text-sm sm:text-base text-gray-700">{item.unit}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </div>

          <Card className="lg:col-span-4 px-4 py-4 sm:px-5 sm:py-5 bg-slate-100 flex items-center justify-center min-h-[250px]">
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={ispuData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value">
                  {ispuData.map((entry, idx) => {
                    const cat = categoryOf(entry.value);
                    return (
                      <Cell
                        key={`cell-${idx}`}
                        fill={cat.dot}
                        className="cursor-pointer transition hover:opacity-80 active:scale-95"
                        onClick={() => goToDetail(entry.name)}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </div>
  );
}

/** Small Dot component */
function Dot({ color }: { color: string }) {
  return <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: color }} />;
}