# TicketHub — Test Dokümantasyonu

Bu doküman, API'nin doğruluğunu kanıtlamak için uygulanan test senaryolarını açıklar. Postman koleksiyonu `postman/TicketHub.postman_collection.json` dosyasındadır. Otomatik entegrasyon testleri Node.js'in yerleşik `node:test` aracıyla çalıştırılır: `npm test`. Otomatik testler başlangıç veri dosyasının bir kopyasını kullanır; proje verisini değiştirmez.

## Test Senaryoları

### 1. Etkinlik Modülü (CRUD)

| # | Senaryo | İstek | Beklenen Sonuç |
| --- | --- | --- | --- |
| 1.1 | Yeni etkinlik oluşturma | `POST /events` | `201 Created`, dönen yanıtta benzersiz `id` var |
| 1.2 | Tüm etkinlikleri listeleme | `GET /events` | `200 OK`, `data` dizisi dolu |
| 1.3 | Etkinlik detayı | `GET /events/evt_001` | `200 OK`, ilgili etkinlik |
| 1.4 | Etkinlik güncelleme | `PUT /events/evt_001` | `200 OK`, alan güncellendi |
| 1.5 | Etkinlik silme | `DELETE /events/evt_001` | `204 No Content` |
| 1.6 | Olmayan etkinlik detayı | `GET /events/yok` | `404` |

### 2. Mekan Modülü (CRUD)

| # | Senaryo | İstek | Beklenen Sonuç |
| --- | --- | --- | --- |
| 2.1 | Yeni mekan oluşturma | `POST /venues` | `201 Created` |
| 2.2 | Mekan listeleme | `GET /venues` | `200 OK` |
| 2.3 | Mekan güncelleme | `PUT /venues/ven_001` | `200 OK` |
| 2.4 | Mekan silme | `DELETE /venues/ven_001` | `204 No Content` |

### 3. Katılımcı Modülü (CRUD)

| # | Senaryo | İstek | Beklenen Sonuç |
| --- | --- | --- | --- |
| 3.1 | Yeni katılımcı oluşturma | `POST /attendees` | `201 Created` |
| 3.2 | Katılımcı listeleme | `GET /attendees` | `200 OK` |
| 3.3 | Katılımcı güncelleme | `PUT /attendees/att_001` | `200 OK` |
| 3.4 | Katılımcı silme | `DELETE /attendees/att_001` | `204 No Content` |

### 4. Bilet Modülü (CRUD + Kapasite)

| # | Senaryo | İstek | Beklenen Sonuç |
| --- | --- | --- | --- |
| 4.1 | Bilet oluşturma | `POST /tickets` | `201 Created` |
| 4.2 | Bilet listeleme | `GET /tickets` | `200 OK` |
| 4.3 | Bilet güncelleme | `PUT /tickets/tkt_001` | `200 OK` |
| 4.4 | Bilet silme | `DELETE /tickets/tkt_001` | `204 No Content` |
| 4.5 | **Kapasite dolunca satış engeli** | `POST /tickets` (kapasitesi dolu etkinliğe) | `409 Conflict` |

### 5. Validation Middleware

| # | Senaryo | İstek | Beklenen Sonuç |
| --- | --- | --- | --- |
| 5.1 | Eksik zorunlu alan | `POST /events` (boş gövde) | `400` + açıklayıcı hata mesajları |
| 5.2 | Geçersiz kategori | `POST /events` (category: `"bilinmeyen"`) | `400` + enum hatası |
| 5.3 | Geçersiz e-posta | `POST /attendees` (email: `"abc"`) | `400` + e-posta hatası |

### 6. Gelişmiş Filtreleme / Arama / Sayfalama

| # | Senaryo | İstek | Beklenen Sonuç |
| --- | --- | --- | --- |
| 6.1 | Kategori filtreleme | `GET /events?category=konser` | Yalnızca `konser` etkinlikleri |
| 6.2 | Şehir filtreleme | `GET /events?city=istanbul` | Yalnızca İstanbul etkinlikleri |
| 6.3 | Anahtar kelime arama | `GET /events?search=caz` | Başlığında/açıklamasında "caz" geçenler |
| 6.4 | Sıralama | `GET /events?sort=price:desc` | Fiyata göre azalan sırada |
| 6.5 | Sayfalama | `GET /events?page=2&limit=2` | 2. sayfa, 2 kayıt |

### 7. Raporlama Servisleri

| # | Senaryo | İstek | Beklenen Sonuç |
| --- | --- | --- | --- |
| 7.1 | Genel özet | `GET /reports/summary` | Toplam etkinlik/katılımcı/ciro bilgileri |
| 7.2 | Satış raporu | `GET /reports/evt_001/sales` | Satılan bilet, doluluk, ciro |
| 7.3 | Katılımcı listesi | `GET /reports/evt_001/attendees` | Etkinliğin katılımcı listesi |

### 8. Logger Middleware

| # | Senaryo | Doğrulama |
| --- | --- | --- |
| 8.1 | Her istek loglanır | Konsolda ve `logs/api-requests.log` dosyasında method, endpoint, zaman damgası ve durum kodu görünür |

## Beklenen Genel Başarı Kriterleri

- Tüm CRUD endpoint'leri doğru HTTP durum kodu döndürür.
- Validation hatalarında açıklayıcı mesaj ve `400` döner.
- Kapasite dolu olduğunda `409` döner ve satış gerçekleşmez.
- Filtreleme/arama/sayfalama/sıralama doğru çalışır.
- Raporlama servisleri doğru istatistikleri üretir.


### 9. Otomatik API Testleri (`npm test`)

| # | Senaryo | Beklenen Sonuç |
| --- | --- | --- |
| 9.1 | API kök rotası | `200 OK` ve kaynak listesi |
| 9.2 | Filtreleme ve sayfalama | `200 OK` ve sayfalama alanları |
| 9.3 | Geçersiz tarih | `400 Bad Request` |
| 9.4 | İzin verilmeyen gövde alanı (`id`, `price` vb.) | `400 Bad Request` |
| 9.5 | Etkinlik oluşturma/güncelleme | `201 Created` / `200 OK` |
| 9.6 | Etkinlik kapasitesinin mekan kapasitesini aşması | `400 Bad Request` |
| 9.7 | Dolu koltuğa tekrar bilet oluşturma | `409 Conflict` |
| 9.8 | Bilet, etkinlik, mekan ve katılımcı ilişki kontrolleri | Uygun `400` veya `409` yanıtı |
| 9.9 | Genel rapor | `200 OK` ve sistem özeti |
| 9.10 | Tanımsız endpoint | `404 Not Found` |


### 10. Servis katmanı ve veri deposu dayanıklılığı

| # | Senaryo | Beklenen Sonuç |
| --- | --- | --- |
| 10.1 | İş kurallarının servis katmanından çağrılması | Controller katmanı servis sonucunu HTTP yanıtına dönüştürür |
| 10.2 | JSON veri dosyasına kayıt yazma/güncelleme | Geçici dosya aracılığıyla kaydedilir ve sonraki süreçte okunabilir |
| 10.3 | Başarılı yazma sonrası geçici dosyaların temizlenmesi | Veri dizininde yalnızca ana JSON dosyası bulunur |
| 10.4 | Bozuk JSON veri dosyasıyla başlatma | Açıklayıcı hata oluşur; dosya otomatik olarak sıfırlanmaz |
| 10.5 | Veri okuma sonucunun değiştirilmesi | Çağıranın elde ettiği kopya, iç veri deposunu doğrudan değiştirmez |

Bu testler de `npm test` komutunun parçasıdır. Testler geçici dizinler ve ayrı JSON dosyaları kullandığı için projedeki başlangıç verilerine yazmaz.
