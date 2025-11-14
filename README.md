# 🏭 IoT-Based Air Quality Monitoring System

**Sistem Pemantauan Kualitas Udara Berbasis IoT**

Proyek ini merupakan implementasi dashboard web untuk memantau kualitas udara secara **real-time** menggunakan data dari perangkat IoT. Sistem mengukur berbagai parameter lingkungan seperti O₃, CO, NO₂, PM2.5, suhu, dan kelembapan. Data dikirimkan melalui **MQTT**, disimpan dalam **MongoDB**, dan ditampilkan dalam bentuk grafik interaktif melalui website berbasis **Next.js**.

Repo ini berisi **kode website/dashboard**, termasuk API, tampilan UI, dan integrasi data.

---

## 📌 Fitur Utama

### 🌫 Real-time Air Quality Monitoring

* Tampilan nilai **O₃**, **CO**, **NO₂**, **NH₃**, dan **PM2.5**
* Pembacaan **suhu (°C)** dan **kelembapan (RH)**

### 📊 Visualisasi Data

* Grafik historis tiap parameter
* Kategori **ISPU (Indeks Standar Pencemar Udara)** sesuai Permen-LHK No. 14 Tahun 2020
* Warna indikator: Baik → Sedang → Tidak Sehat → Sangat Tidak Sehat → Berbahaya

### 🌐 Dashboard Web Modern

* Dibangun menggunakan **Next.js**
* UI responsif dan mudah digunakan
* Tampilan hi-fi dari desain final

### ☁️ Integrasi IoT

* Data dikirim melalui **MQTT**
* Node-RED digunakan untuk menerima, memproses, dan menyimpan data ke Database

### 🗄 Penyimpanan Data

* Menggunakan **MongoDB**
* Penyimpanan nilai sensor, timestamp, dan kategori ISPU

---

## 🏗 Arsitektur Sistem

```
Sensor (MQ131, MiCS-6814, SDS011, DHT22, Neo-6M V2)
        │
     STM32
        │ (MQTT)
   MQTT Broker
        │
     Node-RED
        │ (API)
      MongoDB
        │
   Express.js Backend
        │
     Next.js Frontend (Dashboard)
```

---

## 🧪 Sensor yang Digunakan

| Sensor        | Fungsi                 |
| ------------- | ---------------------- |
| **MQ131**     | Deteksi Ozon (O₃)      |
| **MiCS-6814** | Deteksi CO, NO₂, NH₃   |
| **SDS011**    | Deteksi partikel PM2.5 |
| **DHT22**     | Suhu & kelembapan      |
| **Neo-6M V2**    | GPS (Lokasi geografis) |

---

## 📁 Teknologi yang Digunakan

### **Frontend**

* Next.js
* React.js
* Tailwind CSS
* Chart.js / Recharts

### **Backend**

* Express.js
* Node.js
* MQTT Client
* MongoDB

### **IoT Processing**

* Node-RED
* MQTT Broker

---

## 📈 Perhitungan ISPU

Perhitungan ISPU menggunakan rumus resmi:

```
ISPU = Ib + ((Ia - Ib) / (Xa - Xb)) * (X - Xb)
```

Dengan kategori:

* **0–50** : Baik
* **51–100** : Sedang
* **101–199** : Tidak Sehat
* **200–299** : Sangat Tidak Sehat
* **≥ 300** : Berbahaya

## 👥 Tim Pengembang

| Nama                    | NIM                | Prodi               |
| ----------------------- | ------------------ | ------------------- |
| Varick Zahir Sarjiman   | 22/496418/TK/54384 | Teknologi Informasi |
| Luthfi Hakim            | 22/498198/TK/54637 | Teknik Elektro      |
| Rio Veri Kurniawan      | 22/494919/TK/54342 | Teknik Elektro      |
| Ester Nathania Febriand | 22/498034/TK/54610 | Teknik Biomedis     |
| Diah Ayu Rahmawati      | 22/499722/TK/54760 | Teknologi Informasi |

---

## 📄 Lisensi

Proyek ini dikembangkan untuk Capstone Project Departemen Teknik Elektro dan Teknologi Informasi, Fakultas Teknik, Universitas Gadjah Mada.

---
