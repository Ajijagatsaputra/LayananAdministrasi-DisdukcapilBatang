# Disdukcapil Batang dengan Layanan Administrasi

Chatbot Disdukcapil Kabupaten Batang merupakan asisten virtual interaktif berbasis web yang dirancang untuk mempermudah masyarakat dalam mengakses informasi dan layanan publik terkait pendaftaran akta kelahiran secara online.

## Fitur

✅ Fitur Utama:

    📝 Pendaftaran Akta Kelahiran Online: Memberikan panduan lengkap langkah-langkah dan syarat pengajuan akta kelahiran.
    
    📌 Panduan Persyaratan Lengkap: Menjelaskan dokumen yang dibutuhkan sesuai jenis permohonan.

    📦 Pelacakan Status Permohonan: Memberikan informasi tentang cara memeriksa status permohonan akta kelahiran.

    🕐 Layanan Chatbot 24/7: Siap membantu kapan saja tanpa perlu datang langsung ke kantor.

    💬 Respons Interaktif: Chatbot merespons secara real-time dengan jawaban yang relevan sesuai pertanyaan pengguna.

    🧠 Pemrosesan Bahasa Alami (NLTK): Analisis dan klasifikasi pertanyaan berdasarkan konteks menggunakan pipeline machine learning.

    🗂️ Sistem Intents Terstruktur: Memastikan alur percakapan yang logis dan responsif sesuai kebutuhan informasi masyarakat.

Dengan kehadiran chatbot ini, Disdukcapil Batang meningkatkan pelayanan publik secara digital dan memberikan pengalaman layanan yang cepat, mudah, dan efisien bagi seluruh warga.

Dapatkan pelayanan cepat dan efisien hanya di ujung jari Anda. Kunjungi sekarang dan urus semua keperluan administrasi kelahiran dengan mudah! 📲

# Chatbot Layanan Administrasi

Dilengkapi dengan teknologi Natural Language Processing (NLP) menggunakan NLTK, chatbot ini mampu memahami dan merespons pertanyaan pengguna secara alami dan akurat berdasarkan struktur intents yang telah disusun.

## Instalasi

1. Clone repositori ini

```bash
git clone https://github.com/Ajijagatsaputra/
```

2. Instal dependensi yang diperlukan:

```bash
pip install -r requirements.txt
```

3. Latih model chatbot:

```bash
python train.py
```

4. Jalankan aplikasi Flask:

```bash
python atau python3 app.py
```

5. Aktifkan Virtual Environment nya

```bash
source venv/bin/activate
```

6. Matikan Virtual Environment

```bash
deactivate
```

7. Akses aplikasi di http://127.0.0.1:5000/

## Struktur Proyek

- `app.py`: Aplikasi Flask utama
- `train.py`: Skrip untuk melatih model chatbot
- `intents.json`: Berisi data pelatihan dengan intents, pola, dan respons
- `classes.pkl`: File pickle yang berisi kelas intent
- `chatbot_model.h5`: Model TensorFlow yang telah dilatih
- `templates/`: Berisi template HTML
- `static/`: Berisi CSS, JavaScript, dan gambar

## Cara Kerja

Chatbot menggunakan jaringan saraf yang dilatih pada intents yang telah ditentukan terkait layanan akta kelahiran. Ketika pengguna mengirimkan pesan, aplikasi:

1. Melakukan tokenisasi dan lemmatisasi input
2. Membuat bag of words
3. Memprediksi intent menggunakan model yang telah dilatih
4. Mengembalikan respons berdasarkan intent yang diprediksi

Jika file model tidak ditemukan, aplikasi akan kembali ke sistem pencocokan kata kunci sederhana.

## Kustomisasi

Untuk menyesuaikan respons chatbot, edit file `intents.json` dan latih ulang model menggunakan `train_chatbot.py`.
