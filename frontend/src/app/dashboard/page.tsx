"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

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

// Mapping kategori ISPU → warna/label
function categoryOf(v: number) {
  if (v <= 50)
    return {
      label: "Baik",
      dot: "#22c55e",
      chip: "bg-green-100 text-green-700",
    };
  if (v <= 100)
    return {
      label: "Sedang",
      dot: "#facc15",
      chip: "bg-yellow-100 text-yellow-700",
    };
  if (v <= 199)
    return {
      label: "Tidak Sehat",
      dot: "#f97316",
      chip: "bg-orange-100 text-orange-700",
    };
  if (v <= 299)
    return {
      label: "Sangat Tidak Sehat",
      dot: "#ef4444",
      chip: "bg-red-100 text-red-700",
    };
  return {
    label: "Berbahaya",
    dot: "#6b21a8",
    chip: "bg-purple-100 text-purple-700",
  };
}

export default function AirQualityDashboard() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [temperature, setTemperature] = useState("26 °C");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check authentication by making a request to verify the token
        const response = await fetch("http://localhost:8080/api/auth/me", {
          method: "GET",
          credentials: "include", // Include cookies
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          // User is authenticated
          const userData = await response.json();
          setIsAuthenticated(true);
          
          // Set user email from API response or localStorage
          const email = userData.email || localStorage.getItem("userEmail");
          setUserEmail(email);
        } else {
          // User is not authenticated
          setIsAuthenticated(false);
          // Clear any stored email
          localStorage.removeItem("userEmail");
          // Redirect to login page
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
      // Format tanggal & jam realtime
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

      // TODO: fetch suhu real dari API cuaca
      setTemperature("26 °C");
    }
  }, [isAuthenticated]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8080/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local storage and redirect regardless of API response
      localStorage.removeItem("userEmail");
      router.push("/");
    }
  };

  // Show loading spinner while checking authentication
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

  // Don't render dashboard content if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // ISPU per polutan
  const ispuData = [
    { name: "PM 2,5", value: 90.4 },
    { name: "CO", value: 275.7 },
    { name: "O3", value: 41.67 },
    { name: "NO2", value: 132.94 },
  ];

  // Data polutan (dengan satuan & status)
  const detailedData = [
    {
      name: "PM 2,5",
      value: "55,4 µg/m³",
      status: "Sedang",
      statusColor: "text-yellow-600",
    },
    {
      name: "CO",
      value: "30000 µg/m³",
      status: "Sangat Tidak Sehat",
      statusColor: "text-red-600",
    },
    {
      name: "O3",
      value: "100 µg/m³",
      status: "Baik/Sehat",
      statusColor: "text-green-600",
    },
    {
      name: "NO2",
      value: "500 µg/m³",
      status: "Tidak Sehat",
      statusColor: "text-orange-600",
    },
  ];

  // helper redirect ke halaman detail dengan query param
  const goToDetail = (polutan: string) => {
    router.push(`/detailISPU?polutan=${encodeURIComponent(polutan)}`);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-black">
      <div className="max-w-[1200px] mx-auto p-5">
        {/* Header */}
<div className="flex justify-between items-start bg-blue-900 text-white rounded-2xl px-5 py-4 mb-6">
  <div>
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
        {/* Dropdown icon */}
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
          <Card className="col-span-2 flex justify-between items-center bg-blue-50 px-5 py-2">
            <div className="flex flex-col">
              <span className="font-semibold">📍 Sleman, Yogyakarta</span>
              <span className="text-xs text-gray-500">
                Suhu: {temperature}
              </span>
            </div>
            <div className="text-right text-sm">
              <p>{currentDate}</p>
              <p className="font-semibold">{currentTime}</p>
            </div>
          </Card>

          {/* Hasil ISPU — tiap item clickable + hover */}
          <Card className="row-span-2 p-4 bg-gray-50">
            <p className="font-medium text-sm text-center mb-2">Hasil ISPU</p>
            <div className="space-y-2">
              {ispuData.map((row, i) => {
                const cat = categoryOf(row.value);
                return (
                  <div
                    key={i}
                    onClick={() => goToDetail(row.name)}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 hover:bg-slate-100 hover:shadow-md transition cursor-pointer active:scale-[0.99]"
                    style={{ borderLeftWidth: 5, borderLeftColor: cat.dot }}
                  >
                    <div className="flex items-center gap-3">
                      <Dot color={cat.dot} />
                      <div className="leading-tight">
                        <p className="text-[12px] font-semibold">{row.name}</p>
                        <span className={`text-[10px] px-1.5 py-1 rounded-full ${cat.chip}`}>{cat.label}</span>
                      </div>
                    </div>

                    <div className="text-sm font-bold">{Math.round(row.value)}</div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Peringatan */}
          <Card className="flex flex-col items-center justify-center bg-red-100 border-l-4 border-red-600 py-5 min-h-[180px]">
            <div className="text-red-600 text-3xl mb-1">⚠️</div>
            <p className="font-bold text-red-700 leading-tight">PERINGATAN</p>
            <p className="text-xs">Kadar CO Sangat Tinggi</p>
          </Card>

          {/* Rekomendasi */}
          <Card className="flex items-center justify-center py-6 min-h-[120px]">
            <div className="text-center px-5">
              <p className="font-bold mb-1">Rekomendasi</p>
              <p className="text-xs">
                Gunakan masker karbon aktif saat berada di luar untuk
                mengurangi paparan CO.
              </p>
            </div>
          </Card>
        </div>

        {/* Data polutan + Diagram */}
        <div className="grid grid-cols-12 gap-3">
          {/* Data polutan clickable */}
          <div className="col-span-7">
            <div className="grid grid-cols-2 gap-3">
              {detailedData.map((item, idx) => (
                <Card
                  key={idx}
                  onClick={() => goToDetail(item.name)}
                  className="p-3 text-center bg-slate-100 hover:bg-slate-200 hover:shadow-md transition cursor-pointer active:scale-[0.99]"
                >
                  <p className="text-[11px] font-semibold leading-snug">{item.name}</p>
                  <p className="text-base font-bold leading-snug">{item.value}</p>
                  <p className={`text-[11px] ${item.statusColor}`}>{item.status}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Diagram */}
          <Card className="col-span-5 px-5 py-5 bg-slate-100 h-50 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ispuData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
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
  return (
    <span
      className="inline-block w-3 h-3 rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}