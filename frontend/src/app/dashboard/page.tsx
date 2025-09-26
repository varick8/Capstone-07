"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

// Interface for sensor data
interface SensorData {
  _id: string;
  co: number;
  pm25: number;
  temp: number;
  hum: number;
  loc: string;
  no2: number;
  o3: number;
  dateTime: string;
  __v: number;
}

// Interface for detailed data
interface DetailedDataItem {
  name: string;
  value: string;
  unit: string;   
  status: string;
  statusColor: string;
  dotColor: string;
}

// Komponen Card sederhana
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
          ? (e) => {
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

// Mapping kategori ISPU
function categoryOf(v: number) {
  if (v <= 50)
    return {
      label: "Baik",
      dot: "#00B050", // Hijau
      chip: "bg-green-600 text-white",
    };
  if (v <= 100)
    return {
      label: "Sedang",
      dot: "#0000FF", // Biru
      chip: "bg-blue-600 text-white",
    };
  if (v <= 200)
    return {
      label: "Tidak Sehat",
      dot: "#FFFF00", // Kuning
      chip: "bg-yellow-400 text-black",
    };
  if (v <= 300)
    return {
      label: "Sangat Tidak Sehat",
      dot: "#FF0000", // Merah
      chip: "bg-red-600 text-white",
    };
  return {
    label: "Berbahaya",
    dot: "#000000", // Hitam
    chip: "bg-black text-white",
  };
}

// Mapping peringatan
const warnings: Record<string, string> = {
  "PM₂.₅": "Kadar PM₂.₅ tinggi",
  "NO₂": "Kadar NO₂ tinggi",
  "O₃": "Kadar O₃ tinggi",
  "CO": "Kadar CO tinggi",
};

// Tambahkan mapping rekomendasi
const recommendations: Record<string, string[]> = {
  "PM₂.₅": [
    "Kurangi aktivitas luar ruangan dan gunakan masker respirator",
    "Segera masuk ke ruangan tertutup bila terasa sesak, batuk, atau mata perih",
    "Tetap terhidrasi untuk membantu tubuh mengurangi efek iritasi.",
  ],
  "NO₂": [
    "Kurangi aktivitas di jalan raya yang padat",
    "Gunakan masker ketika berpergian",
    "Segera berpindah ke area dengan sirkulasi udara lebih baik jika mata/paru terasa perih.",
  ],
  "O₃": [
    "Hindari aktivitas luar di siang hingga sore atau sekitar pukul 10.00–16.00 saat O₃ mencapai puncak.",
    "Bila terpaksa, batasi durasi paparan dan gunakan kacamata pelindung untuk cegah iritasi mata.",
    "Pilih beraktivitas di pagi atau sore menjelang malam",
  ],
  "CO": [
    "Segera menjauh dari sumber polusi yaitu asap kendaraan, knalpot, kebakaran terbuka",
    "Jangan berada lama di sekitar area tertutup.",
    "Jika mulai pusing, mual, atau lemas segera ke area terbuka yang banyak oksigen.",
  ],
};

// Function to calculate ISPU from sensor values
function calculateISPU(pollutant: string, value: number): number {
  // Simplified ISPU calculation - you may need to adjust based on actual ISPU formula
  switch (pollutant) {
    case "PM₂.₅":
      return Math.min(300, (value / 35) * 100); // Rough approximation
    case "CO":
      return Math.min(300, (value / 30) * 100); // Rough approximation
    case "O₃":
      return Math.min(300, (value / 235) * 100); // Rough approximation
    case "NO2":
      return Math.min(300, (value / 200) * 100); // Rough approximation
    default:
      return 0;
  }
}

// Function to get status based on value and pollutant type
function getStatus(pollutant: string, value: number) {
  const ispu = calculateISPU(pollutant, value);
  const category = categoryOf(ispu);

  return {
    status: category.label,
    statusColor: category.dot, // warna utk tulisan
    dotColor: category.dot,    // warna utk dot (penting!)
  };
}

  // Mapping kategori → warna teks
  const colorMap: Record<string, string> = {
    "Baik": "text-green-500",
    "Sedang": "text-blue-500",
    "Tidak Sehat": "text-yellow-500",
    "Sangat Tidak Sehat": "text-red-500",
    "Berbahaya": "text-black-500",
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

  // Fetch sensor data from API
  const fetchSensorData = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/sensors/lastest", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: SensorData = await response.json();
        setSensorData(data);

        // Update temperature from sensor data
        setTemperature(`${data.temp} °C`);

        // Update ISPU data
        const newIspuData = [
          { name: "PM₂.₅", value: calculateISPU("PM₂.₅", data.pm25) },
          { name: "CO", value: calculateISPU("CO", data.co) },
          { name: "O₃", value: calculateISPU("O₃", data.o3) },
          { name: "NO₂", value: calculateISPU("NO₂", data.no2) },
        ];
        setIspuData(newIspuData);

        // Update detailed data
        const newDetailedData: DetailedDataItem[] = [
          {
            name: "PM₂.₅",
            value: `${data.pm25}`,
            unit: "µg/m³",
            ...getStatus("PM₂.₅", data.pm25),
          },
          {
            name: "CO",
            value: `${data.co}`,
            unit: "µg/m³",
            ...getStatus("CO", data.co),
          },
          {
            name: "O₃",
            value: `${data.o3}`,
            unit: "µg/m³",
            ...getStatus("O₃", data.o3),
          },
          {
            name: "NO₂",
            value: `${data.no2}`,
            unit: "µg/m³",
            ...getStatus("NO₂", data.no2),
          },
        ];

        setDetailedData(newDetailedData);
      }
    } catch (error) {
      console.error("Error fetching sensor data:", error);
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

          await fetchSensorData();
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
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) {
      const now = new Date();
      const tanggal = now.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const jam = now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });

      setCurrentDate(tanggal);
      setCurrentTime(jam);

      const interval = setInterval(fetchSensorData, 30000);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white font-sans text-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Memverifikasi akses...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const goToDetail = (polutan: string) => {
    router.push(`/detailISPU?polutan=${encodeURIComponent(polutan)}`);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-black ">
      <div className="max-w-[1500px] mx-auto p-5">
        {/* Header */}
        <div className="flex justify-between items-start bg-blue-900 text-white rounded-2xl px-5 py-4 mb-6">
          <div>
            <h1 className="text-lg font-semibold">Indeks Standar Pencemaran Udara</h1>
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

        {/* Grid 3 kolom 2 baris */}
        <div className="grid grid-cols-3 grid-rows-[60px,1fr] gap-4 mb-6">
          {/* Location & Date */}
          <Card className="relative col-span-2 px-5 py-4 bg-[url('/background.png')] bg-cover bg-center rounded-2xl overflow-hidden">
            {/* Overlay putih tipis agar teks tetap terbaca */}
            <div className="absolute inset-0 bg-white/40"></div>

            {/* Isi card */}
            <div className="relative flex justify-between items-center h-full text-blue-900">
              <div className="flex flex-col">
                <span className="font-extrabold">
                  📍 {sensorData?.loc || "Sleman, Yogyakarta"}
                </span>
                <span className="flex items-center gap-3 text-xs text-blue-900">
                  <span className="flex items-center gap-1">
                    <Thermometer className="w-4 h-4 text-blue-900" />
                    {temperature}
                  </span>
                  <span className="flex items-center gap-1">
                    <Droplets className="w-4 h-4 text-blue-900" />
                    {sensorData?.hum || "--"}%
                  </span>
                </span>
              </div>

              <div className="text-right text-sm">
                <p className="font-extrabold">{currentDate}</p>
                <p className="font-extrabold">{currentTime}</p>
              </div>
            </div>
          </Card>

          {/* Hasil ISPU */}
          <Card className="row-span-2 p-3 bg-gray-50">
            <p className="font-bold text-xm text-center mb-2">Hasil ISPU</p>
            <div className="space-y-2">
              {ispuData.map((row, i) => {
                const cat = categoryOf(row.value);
                return (
                  <div
                    key={i}
                    onClick={() => goToDetail(row.name)}
                    className={`flex flex-col items-center justify-center rounded-lg px-2 py-3 text-white cursor-pointer transition 
                                active:scale-[0.97] hover:scale-[1.02] hover:shadow-lg hover:opacity-90 ${cat.chip}`}
                  >
                    <div className="flex items-center justify-center gap-2 w-full">
                    <p className="text-[15px] font-semibold">{row.name} :</p>
                    <p className="text-sm font-bold">{Math.round(row.value)}</p>
                  </div>
                </div>
                );
              })}
            </div>
          </Card>

          {/* Container Peringatan + Rekomendasi */}
         <div className="flex flex-row gap-4 justify-start w-[1000px] mt-4 ml-1">
            
            {/* Peringatan */}
            <Card className="flex flex-col items-center justify-center bg-red-100 border-l-4 border-red-600 py-4 px-6 w-[200px]">
              <div className="text-red-600 text-2xl mb-1">⚠️</div>
              <p className="font-bold text-red-700 leading-tight">PERINGATAN</p>
              <p className="text-xs text-center mt-1">Kadar PM₂.₅ tinggi</p>
            </Card>

            {/* Rekomendasi */}
            <Card className="flex flex-col bg-blue-100 py-4 px-6 w-[650px]">
            <p className="font-bold mb-2 text-center">Rekomendasi</p>

            {/* Flex row supaya gambar & card putih sejajar */}
            <div className="flex flex-row items-center gap-3">
              {/* Gambar di kiri */}
              <div className="flex-shrink-0">
                <img src="/image.png" alt="gambar" className="w-12 h-12" />
              </div>

              {/* Card isi rekomendasi */}
              <Card className="p-4 border-slate-200 bg-white w-full">
                <ul className="list-disc list-inside text-xs space-y-1 text-gray-700">
                  <li>Kurangi aktivitas luar ruangan dan gunakan masker</li>
                  <li>Segera masuk ke ruangan tertutup bila terasa sesak, batuk, atau mata perih</li>
                  <li>Tetap terhidrasi untuk membantu tubuh mengurangi efek iritasi</li>
                </ul>
              </Card>
            </div>
          </Card>
          </div>
        </div>

        {/* Data polutan */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-8">
            <Card className="row-span-4 p-10 bg-blue-90">
              <div className="grid grid-cols-2 gap-3">
                {detailedData.map((item, idx) => {
                  const cat = categoryOf(parseFloat(item.value));
                  return (
                    <Card
                    key={idx}
                    onClick={() => goToDetail(item.name)}
                    className="p-4 border-slate-200 bg-white hover:bg-slate-200 hover:shadow-md transition cursor-pointer active:scale-[0.99]"
                    >
                    <div className="flex flex-col justify-between h-full">
                      {/* Baris atas: Nama polutan + Value */}
                      <div className="flex justify-between items-start">
                        {/* Nama polutan */}
                        <span className="px-2 py-1 rounded-md bg-blue-900 text-white text-[15px] font-semibold">
                          {item.name}
                        </span>
                        {/* Value */}
                        <p className="text-xl font-bold">{item.value}</p>
                      </div>
                      {/* Baris bawah: Dot + Status di kiri, Unit di kanan */}
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center gap-2">
                          <Dot color={item.dotColor} />
                          <p className="text-m font-medium" style={{ color: item.statusColor }}>
                            {item.status}
                          </p>
                        </div>
                        <p className="text-m text-gray-700">{item.unit}</p>
                      </div>
                    </div>
                    </Card>
                  );
                })}
              </div>
            </Card>
          </div>
          
          {/* Diagram */}
          <Card className="col-span-4 px-5 py-5 bg-slate-100 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={ispuData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
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

// Komponen titik warna kecil
function Dot({ color }: { color: string }) {
  return <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: color }} />;
}
