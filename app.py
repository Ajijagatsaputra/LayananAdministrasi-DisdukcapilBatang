from flask import Flask, render_template, request, jsonify
import pickle
import json
import random
import nltk
import re # Tambahkan import re
from nltk.stem import WordNetLemmatizer
from nltk.tokenize import wordpunct_tokenize # Tambahkan import wordpunct_tokenize
import os

app = Flask(__name__)

# Mengunduh data NLTK yang diperlukan
# Menggunakan try-except untuk menghindari pengunduhan berulang jika sudah ada
try:
    nltk.data.find('corpora/punkt')
except LookupError: # Perbaikan: Mengganti DownloadError dengan LookupError
    nltk.download('punkt')
try:
    nltk.data.find('corpora/wordnet')
except LookupError: # Perbaikan: Mengganti DownloadError dengan LookupError
    nltk.download('wordnet')
try: # Tambahkan ini untuk omw-1.4
    nltk.data.find('corpora/omw-1.4')
except LookupError:
    nltk.download('omw-1.4')


lemmatizer = WordNetLemmatizer()

# --- Fungsi Preprocessing yang Sama Seperti di train.py ---
def preprocess(text):
    """
    Melakukan pra-pemrosesan teks: tokenisasi, lemmatisasi,
    mengubah ke huruf kecil, dan menghapus non-alfabet.
    """
    tokens = wordpunct_tokenize(text)
    tokens = [lemmatizer.lemmatize(word.lower()) for word in tokens if word.isalpha()]
    return " ".join(tokens)
# -----------------------------------------------------------

# Memuat model dan data yang sudah dilatih
model_loaded = False # Flag untuk menandai apakah model berhasil dimuat
try:
    # Mencoba memuat seluruh data chatbot (model, kelas, intent) dari file pickle
    with open('chatbot_data.pickle', 'rb') as f:
        chatbot_data = pickle.load(f)
    model = chatbot_data['model']
    classes = chatbot_data['classes']
    intents = chatbot_data['intents']
    model_loaded = True
    print("Model berhasil dimuat!")
except (FileNotFoundError, IOError, KeyError) as e:
    print(f"Error saat memuat model dari chatbot_data.pickle: {e}")
    print("Mencoba memuat intent dari intents.json sebagai fallback.")
    # Jika pemuatan model gagal, muat hanya intent dari intents.json untuk respons fallback
    try:
        with open('intents.json', 'r', encoding='utf-8') as f: # Pastikan encoding
            intents = json.load(f)
        print("intents.json berhasil dimuat untuk fallback.")
    except (FileNotFoundError, IOError) as e_json:
        print(f"Error saat memuat intents.json: {e_json}")
        intents = {"intents": []} # Fallback ke intent kosong jika intents.json juga gagal
    model_loaded = False # Pastikan model_loaded adalah False jika model penuh tidak dimuat

# Kata kunci yang diizinkan untuk membatasi konteks percakapan
# Kata kunci ini mendefinisikan ruang lingkup pengetahuan chatbot.
allowed_keywords = [
    'ktp', 'kartu keluarga', 'akta', 'kelahiran', 'kematian', 'perkawinan', 'perceraian',
    'pindah', 'datang', 'nik', 'capil', 'dukcapil', 'disdukcapil', 'administrasi', 'kependudukan'
]

def predict_class(sentence):
    """
    Memprediksi kelas intent dari sebuah kalimat.
    Jika model tidak dimuat, ia akan kembali ke pencocokan kata kunci.
    Termasuk pemeriksaan untuk sapaan dan topik di luar lingkup.
    """
    sentence_lower = sentence.lower()

    # Periksa sapaan terlebih dahulu, karena sapaan selalu dalam lingkup
    sapaan_keywords = ['halo', 'hai', 'assalamualaikum', 'selamat pagi', 'selamat siang', 'selamat sore', 'selamat malam']
    is_sapaan = any(word in sentence_lower for word in sapaan_keywords)

    # Jika bukan sapaan dan tidak mengandung kata kunci yang diizinkan,
    # klasifikasikan sebagai 'out_of_scope'.
    if not is_sapaan and not any(keyword in sentence_lower for keyword in allowed_keywords):
        return [{'intent': 'out_of_scope', 'probability': '1.0'}]

    if not model_loaded:
        # Jika model gagal dimuat, gunakan pencocokan kata kunci sederhana
        return keyword_matching(sentence)
    
    try:
        # --- Perbaikan: Preprocess kalimat sebelum memprediksi ---
        processed_sentence = preprocess(sentence)
        intent_idx = model.predict([processed_sentence])[0]
        # -------------------------------------------------------
        return [{'intent': intent_idx, 'probability': '0.9'}]
    except Exception as e:
        print(f"Error dalam prediksi model: {e}")
        # Fallback ke intent umum jika prediksi model gagal
        return [{'intent': 'fallback', 'probability': '1.0'}]

def keyword_matching(sentence):
    """
    Fungsi pencocokan berbasis kata kunci sederhana yang digunakan sebagai fallback
    ketika model utama tidak dimuat.
    """
    sentence = sentence.lower()
    keywords = {
        'sapaan': ['halo', 'hai', 'selamat', 'pagi', 'siang', 'sore', 'malam', 'assalamualaikum'],
        'ucapan_sampai': ['sampai', 'jumpa', 'selamat', 'tinggal', 'terima kasih'],
        'syarat': ['syarat', 'dokumen', 'apa', 'harus', 'saya'],
        'proses': ['proses', 'bagaimana', 'langkah', 'step', 'cara'],
        'biaya': ['biaya', 'harga', 'berapa', 'bayar', 'uang'],
        'lokasi': ['kantor', 'alamat', 'dimana', 'lokasi', 'tempat'],
        'online': ['online', 'website', 'internet', 'digital'],
        'waktu': ['waktu', 'berapa', 'lama', 'hari', 'minggu'],
        'koreksi': ['koreksi', 'ganti', 'ubah', 'perbaiki', 'perbarui'],
        'duplikat': ['duplikat', 'salinan', 'ganda', 'kehilangan', 'lagi']
    }
    
    for intent, words_list in keywords.items():
        if any(word in sentence for word in words_list):
            return [{'intent': intent, 'probability': '0.8'}]
    
    # Jika tidak ada pencocokan kata kunci spesifik, kembalikan 'fallback'
    return [{'intent': 'fallback', 'probability': '1.0'}]

def get_response(intents_list, intents_json):
    """
    Mengambil respons acak berdasarkan tag intent yang diprediksi.
    Menangani respons spesifik 'out_of_scope' dan 'syarat'.
    """
    tag = intents_list[0]['intent']
    list_of_intents = intents_json.get('intents', []) # Menggunakan .get untuk akses yang lebih aman

    result = "Maaf, saya tidak mengerti. Bisakah Anda mengulang pertanyaan Anda?" # Fallback default

    # Tangani 'out_of_scope' secara eksplisit
    if tag == "out_of_scope":
        result = "Maaf, saya hanya dapat membantu pertanyaan terkait administrasi kependudukan."
        return result

    # Temukan intent yang cocok dan pilih respons acak
    for i in list_of_intents:
        if i['tag'] == tag:
            result = random.choice(i['responses'])
            break
    
    # Tambahkan tautan jika intentnya adalah 'syarat'
    if tag == "syarat":
        # Mengubah tautan menjadi relatif agar menunjuk ke bagian dalam halaman yang sama
        result += ' <a href="#persyaratan" target="_blank" class="text-blue-500 hover:underline">Lihat persyaratan di sini</a>.'

    return result

@app.route('/')
def home():
    """Merender halaman antarmuka chat utama."""
    return render_template('index.html')

@app.route('/get_response', methods=['POST'])
def chatbot_response():
    """
    Endpoint API untuk menerima pesan pengguna dan mengembalikan respons chatbot.
    """
    data = request.json
    message = data.get('message', '') # Mengambil pesan dari payload JSON dengan aman

    # Prediksi intent dan dapatkan respons
    predicted_intents = predict_class(message)
    response_text = get_response(predicted_intents, intents)
    
    return jsonify({'response': response_text})

if __name__ == '__main__':
    # Dapatkan port dari variabel lingkungan atau default ke 5000
    port = int(os.environ.get('PORT', 5000))
    # Jalankan aplikasi Flask
    app.run(host='0.0.0.0', port=port, debug=True) # debug=True untuk pengembangan