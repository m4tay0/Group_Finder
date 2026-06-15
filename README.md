# Group Finder - Ekip Oluşturma Sistemi

Bu proje, öğrencilerin survey (anket) cevaplarına ve arkadaş tercihlerine göre optimum proje grupları oluşturan bir web uygulamasıdır. Backend tarafı FastAPI (Python), frontend tarafı ise React (Vite + Tailwind CSS) ile geliştirilmiştir.

---

## 🛠️ Sistem Gereksinimleri
*   **Python 3.10 veya üzeri**
*   **Node.js (v18+) ve npm**

---

## 🚀 Kurulum ve Çalıştırma Adımları

Uygulamayı yerel bilgisayarınızda çalıştırmak için aşağıdaki adımları sırasıyla uygulayınız.

### 1. Backend (FastAPI) Kurulumu
1. Proje ana dizinindeyken terminali açın.
2. Gerekli kütüphaneleri yükleyin:
   ```bash
   pip install -r requirements.txt
   ```
3. Backend sunucusunu başlatın:
   ```bash
   python -m app.main
   ```
   *   Sunucu çalıştıktan sonra API belgelerine (Swagger UI) [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) adresinden erişebilirsiniz.
   *   Veritabanı (SQLite) ilk çalıştırmada otomatik olarak oluşturulacak ve test verileriyle (seed) doldurulacaktır.

### 2. Frontend (React + Vite) Kurulumu
1. Farklı bir terminal penceresinde `frontend` klasörüne geçiş yapın:
   ```bash
   cd frontend
   ```
2. Gerekli paketleri kurun:
   ```bash
   npm install
   ```
3. Arayüz geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   ```
   *(Eğer Windows PowerShell kullanıyorsanız ve script engeli hatası alırsanız `npm.cmd run dev` komutunu çalıştırabilirsiniz).*

4. Tarayıcınızda [http://localhost:5173](http://localhost:5173) adresine giderek uygulamayı açın.

---

## 📦 Teslimat İçin ZIP Dosyası Oluşturma Rehberi
Projeyi hocanıza göndermek üzere ZIP'lemeden önce lütfen aşağıdaki klasörleri silerek dosya boyutunu küçültün:
1.  `frontend/node_modules/` (npm paketleri)
2.  `app/__pycache__/` ve `app/routers/__pycache__/`
3.  Gizli `.git` ve `.agent` klasörleri

Bu klasörler silindikten sonra ana dizini sıkıştırıp (ZIP) hocanıza gönderebilirsiniz.
