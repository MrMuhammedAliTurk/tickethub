# 🎟️ TicketHub — Etkinlik ve Biletleme Sistemi API

Node.js ve Express.js ile geliştirilmiş, etkinlik ve bilet yönetimini sağlayan bir **REST API** uygulaması.

> Node.js Backend Programlama — Bitirme Projesi · 2026

## Proje Hakkında

TicketHub; etkinliklerin, mekanların, katılımcıların ve biletlerin tek bir panelden yönetilmesini sağlayan bir REST API'dir. Sistem; etkinlik oluşturma, bilet satışı, kapasite kontrolü, filtreleme/arama/sayfalama ve temel raporlama süreçlerini destekler.

## Özellikler

- ✅ Etkinlik (Event), Mekan (Venue), Katılımcı (Attendee) ve Bilet (Ticket) için **tam CRUD** operasyonları
- ✅ **Routing** yapısı (modüler rota dosyaları)
- ✅ **Logger middleware** (her isteği konsola ve log dosyasına kaydeder)
- ✅ **Güçlendirilmiş validation middleware** (zorunlu alan, veri tipi, enum, e-posta ve tarih doğrulaması; tanımsız alanların reddi)
- ✅ **Filtreleme, arama, sıralama ve sayfalama**
- ✅ **Veri bütünlüğü kontrolleri** (mekan/etkinlik/katılımcı ilişkileri, koltuk çakışması ve kapasite kontrolü)
- ✅ **Raporlama servisleri** (satış, doluluk, katılımcı listesi, genel özet)
- ✅ **JSON tabanlı veri yönetimi** (atomik dosya yazımı, bozuk dosya için güvenli hata davranışı ve kopyalanmış okuma sonuçları)

## Teknolojiler

- Node.js
- Express.js
- REST API mimarisi
- Middleware (logger, validation, error handler)
- JSON veri depolama

## Kurulum

### Gereksinimler

- [Node.js](https://nodejs.org) (v18 veya üzeri)
- npm

### Adımlar

```bash
# 1. Proje klasörüne girin
cd tickethub

# 2. Bağımlılıkları kurun
npm install

# 3. Sunucuyu başlatın
npm start
```

Sunucu varsayılan olarak **http://localhost:3000** adresinde çalışır.

> Geliştirme sırasında değişiklikleri otomatik algılayıp sunucuyu yeniden başlatan
> mod için `npm run dev` komutunu kullanabilirsiniz.

### Port Değiştirme

```bash
PORT=4000 npm start
```

## Test

Postman testleri için `postman/TicketHub.postman_collection.json` dosyasını içe aktarabilirsiniz. Otomatik API testlerini çalıştırmak için `npm test` komutunu kullanın. Testler geçici bir JSON veri dosyası kullandığından `src/data/db.json` içindeki başlangıç verilerini değiştirmez. Detaylı test senaryoları [docs/TEST-DOKUMANTASYONU.md](docs/TEST-DOKUMANTASYONU.md) dosyasındadır.

## Klasör Yapısı

```
tickethub/
├── src/
│   ├── server.js             # Uygulama giriş noktası
│   ├── app.js                # Express uygulama kurulumu
│   ├── config/
│   │   └── config.js         # Yapılandırma (port vb.)
│   ├── data/
│   │   ├── db.json           # JSON veri deposu (seed data)
│   │   └── store.js          # Veri katmanı (okuma/yazma)
│   ├── routes/               # Rota tanımları
│   ├── controllers/          # HTTP istek/yanıt adaptörleri
│   ├── services/             # İş kuralları ve uygulama mantığı
│   ├── middleware/           # Logger, validation, error handler
│   ├── validators/           # Validation şemaları
│   └── utils/                # Yardımcı fonksiyonlar
├── docs/                     # Proje dokümantasyonu
├── postman/                  # Postman koleksiyonu
├── tests/                    # Otomatik API ve veri katmanı testleri (node:test)
├── package.json
└── README.md
```

## Dokümantasyon

| Doküman | Açıklama |
| --- | --- |
| [docs/PROJE-TANITIM.md](docs/PROJE-TANITIM.md) | Projenin amacı ve senaryosu |
| [docs/VERI-MODELI.md](docs/VERI-MODELI.md) | Veri modeli tasarımı |
| [docs/API-DOKUMANTASYONU.md](docs/API-DOKUMANTASYONU.md) | Tüm endpoint'lerin açıklaması |
| [docs/TEST-DOKUMANTASYONU.md](docs/TEST-DOKUMANTASYONU.md) | Test senaryoları |

## Lisans

MIT


## Mimari notu (v2)

İş mantığı `src/services/` altındaki servis katmanına taşınmıştır. Controller'lar HTTP parametrelerini servislere aktarır ve servis sonuçlarını HTTP yanıtına dönüştürür. JSON veri deposu güncellemeleri önce geçici dosyaya yazar ve ardından hedef dosyayla değiştirir. Veri dosyası bozuksa uygulama dosyayı sessizce sıfırlamaz; açık bir hata mesajıyla başlamayı durdurur.
