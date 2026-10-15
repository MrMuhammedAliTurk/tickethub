# TicketHub — Proje Tanıtım Dokümanı

## Projenin Amacı

Bu proje kapsamında, Node.js ve Express.js kullanılarak gerçek hayatta kullanılabilecek bir **Etkinlik ve Biletleme Sistemi (TicketHub)** REST API'sinin tasarlanması ve geliştirilmesi amaçlanmıştır. Sistem tamamen REST API mantığında geliştirilmiş olup; etkinliklerin, mekanların, katılımcıların ve biletlerin yönetimini tek bir panel üzerinden sağlar.

## Senaryo

Bir etkinlik organizasyon şirketi; düzenlediği etkinlikleri, etkinliklerin gerçekleştiği mekanları, bilet satışlarını ve katılımcılarını takip etmek istemektedir. Şirketin ihtiyaçları şunlardır:

- Etkinlik oluşturma, listeleme, güncelleme ve silme
- Mekan (salon/sahne) kayıtlarının yönetilmesi
- Katılımcı kayıtlarının tutulması
- Bilet satışının yapılması ve kapasite kontrolü
- Etkinliklerin kategori, şehir ve anahtar kelimeye göre filtrelenmesi
- Satış, doluluk ve katılımcı listesi gibi temel raporlamaların üretilmesi

## Sistemin Özellikleri

### Zorunlu Kapsam

- ✅ **CRUD Operasyonları** — Etkinlik, mekan, katılımcı ve bilet için eksiksiz ekleme/listeleme/detay/güncelleme/silme
- ✅ **Routing Yapısı** — Modüler ve düzenli rota dosyaları
- ✅ **Logger Middleware** — Tüm isteklerin (method, endpoint, zaman damgası, durum kodu) konsola ve log dosyasına kaydedilmesi

### İleri Seviye Özellikler (İsteğe Bağlı)

- ✅ **Filtreleme, Arama, Sayfalama ve Sıralama** — kategori, şehir, durum, anahtar kelime filtreleri
- ✅ **Validation Middleware** — Zorunlu alan, tip, enum ve e-posta doğrulaması
- ✅ **Kapasite Kontrolü** — Etkinlik kapasitesi dolduğunda bilet satışının engellenmesi
- ✅ **Raporlama Servisleri** — Satış raporu, doluluk oranı, katılımcı listesi ve genel sistem özeti

## Kazanılan Yetkinlikler

- Node.js temelleri ve çalışma ortamı
- Express.js ile sunucu geliştirme
- REST API tasarımı ve geliştirme
- Middleware kullanımı (logger, validation, error handler)
- Routing yapıları
- CRUD operasyonları
- JSON veri yönetimi ve kalıcılık
- Filtreleme, arama, sayfalama mantığı
- İstatistiksel veri işleme (raporlama)
