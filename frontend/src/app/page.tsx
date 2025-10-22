"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("userEmail", email);
        router.push("/dashboard");
      } else {
        setError(data.message || "Login failed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative font-sans overflow-hidden">
      {/* Background gambar full */}
      <div className="absolute inset-0 bg-[url('/mountain.png')] bg-cover bg-center"></div>

      {/* Lapisan gradasi lembut */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-blue-100/40 to-blue-600/60 backdrop-blur-[1px]"></div>

      {/* Elemen dekoratif gelembung cahaya */}
      <div className="absolute top-[-100px] right-[100px] w-[400px] h-[400px] bg-blue-400/30 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-100px] left-[50px] w-[300px] h-[300px] bg-cyan-300/25 rounded-full blur-[100px]"></div>

      {/* Konten utama */}
      <div className="relative z-10 flex w-full max-w-6xl justify-between items-center px-16">
        {/* Kiri - teks sambutan */}
        <div className="max-w-lg">
          <h1 className="text-4xl font-extrabold text-blue-900 mb-2">Halo,</h1>
          <h2 className="text-5xl font-extrabold text-blue-800 mb-4">
            Selamat Datang!
          </h2>
          <p className="text-gray-800 text-base leading-relaxed">
            Pantau kualitas udara di sekitarmu secara mudah dan cepat melalui
            sistem perhitungan ISPU kami.
          </p>
        </div>

        {/* Kanan - form login */}
        <div className="backdrop-blur-xl bg-white/25 border border-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] rounded-2xl p-10 w-full max-w-sm transition-all duration-500 hover:bg-white/30">
          <h2 className="text-center text-2xl font-semibold text-blue-900 mb-6">
            Masuk ke Akunmu
          </h2>

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-100 py-2 rounded mb-3">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                className="w-full px-4 py-2 mt-1 border rounded-lg text-black bg-blue-50/80 focus:ring-2 focus:ring-blue-400 outline-none placeholder:text-gray-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@mail.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-2 mt-1 border rounded-lg text-black bg-blue-50/80 focus:ring-2 focus:ring-blue-400 outline-none pr-10 placeholder:text-gray-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-900 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition"
            >
              {isLoading ? "Memproses..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
