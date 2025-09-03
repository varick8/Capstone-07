"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Simpan email ke localStorage
    localStorage.setItem("userEmail", email);

    // Redirect ke dashboard
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-white font-sans text-black">
      <div className="max-w-[1500px] mx-auto p-5">
        {/* Header */}
        <div className="flex justify-between items-center bg-blue-900 text-white rounded-2xl px-5 py-4 mb-6">
          <h1 className="text-lg font-semibold">
            Indeks Standar Pencemaran Udara
          </h1>
        </div>

        {/* Login Form */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg mt-6">
            <h2 className="text-3xl font-bold text-center text-gray-800">
              Selamat Datang!
            </h2>
            <p className="text-center text-gray-500">
              Silakan login untuk melanjutkan
            </p>

            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 text-white bg-blue-900 rounded-lg hover:bg-blue-800 transition font-semibold"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
