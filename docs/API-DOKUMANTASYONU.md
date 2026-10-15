# TicketHub — API Dokümantasyonu

Temel URL: `http://localhost:3000`

Tüm istek ve yanıtlar JSON formatındadır. `POST` ve `PUT` isteklerinde `Content-Type: application/json` başlığı kullanılmalıdır.

## Kaynak Listesi

| Kaynak | Açıklama |
| --- | --- |
| `/events` | Etkinlik yönetimi |
| `/venues` | Mekan yönetimi |
| `/attendees` | Katılımcı yönetimi |
| `/tickets` | Bilet yönetimi |
| `/reports` | Raporlama servisleri |

---

## Events — Etkinlikler

### `GET /events` — Etkinlik listeleme

Desteklenen query parametreleri:

| Parametre | Örnek | Açıklama |
| --- | --- | --- |
| `category` | `?category=konser` | Kategoriye göre filtreleme |
| `city` | `?city=istanbul` | Şehre göre filtreleme |
| `status` | `?status=active` | Duruma göre filtreleme |
| `search` | `?search=caz` | Başlık/açıklamada arama |
| `sort` | `?sort=price:desc` | Alana göre sıralama (`:asc`/`:desc`) |
| `page` | `?page=1` | Sayfa numarası |
| `limit` | `?limit=10` | Sayfa başına kayıt |

**Örnek istek:**

```
GET /events?category=konser&sort=price:desc&page=1&limit=10
```

**Yanıt (200 OK):**

```json
{
  "total": 2,
  "page": 1,
  "limit": 10,
  "totalPages": 1,
  "data": [
    {
      "id": "evt_001",
      "title": "İstanbul Caz Gecesi",
      "description": "Ünlü caz sanatçılarının sahne alacağı unutulmaz bir gece.",
      "category": "konser",
      "city": "İstanbul",
      "venueId": "ven_001",
      "date": "2026-11-20",
      "price": 350,
      "capacity": 2000,
      "status": "active"
    }
  ]
}
```

### `GET /events/:id` — Etkinlik detayı

**Yanıt (200 OK):**

```json
{
  "id": "evt_001",
  "title": "İstanbul Caz Gecesi",
  "category": "konser",
  "status": "active"
}
```

**Yanıt (404):** `{ "error": "Etkinlik bulunamadı: evt_001" }`

### `POST /events` — Etkinlik oluşturma

**İstek gövdesi:**

```json
{
  "title": "İzmir Caz Buluşması",
  "description": "Ege'nin en iyi caz sanatçıları bir arada.",
  "category": "konser",
  "city": "İzmir",
  "venueId": "ven_004",
  "date": "2026-11-15",
  "price": 300,
  "capacity": 800
}
```

**Yanıt (201 Created):** Oluşturulan etkinlik (benzersiz `id` ile birlikte).

**Yanıt (400):** Zorunlu alan eksikse veya girilen `venueId` mevcut değilse hata döner.

### `PUT /events/:id` — Etkinlik güncelleme

Kısmi güncelleme desteklenir (yalnızca değiştirilmek istenen alanlar gönderilir).

**İstek gövdesi:**

```json
{ "price": 275, "status": "cancelled" }
```

### `DELETE /events/:id` — Etkinlik silme

**Yanıt (204 No Content):** Başarılı silme (gövde boş döner).

---

## Venues — Mekanlar

| Method | Endpoint | Açıklama |
| --- | --- | --- |
| GET | `/venues` | Mekan listeleme (`?city=`, `?search=`, sayfalama) |
| GET | `/venues/:id` | Mekan detayı |
| POST | `/venues` | Mekan oluşturma |
| PUT | `/venues/:id` | Mekan güncelleme |
| DELETE | `/venues/:id` | Mekan silme |

**`POST /venues` istek gövdesi:**

```json
{
  "name": "Bostancı Gösteri Merkezi",
  "city": "İstanbul",
  "address": "Kadıköy",
  "capacity": 3000
}
```

---

## Attendees — Katılımcılar

| Method | Endpoint | Açıklama |
| --- | --- | --- |
| GET | `/attendees` | Katılımcı listeleme (`?search=`, sayfalama) |
| GET | `/attendees/:id` | Katılımcı detayı |
| POST | `/attendees` | Katılımcı oluşturma |
| PUT | `/attendees/:id` | Katılımcı güncelleme |
| DELETE | `/attendees/:id` | Katılımcı silme |

**`POST /attendees` istek gövdesi:**

```json
{
  "name": "Zeynep Arslan",
  "email": "zeynep@example.com",
  "phone": "05001112233"
}
```

---

## Tickets — Biletler

| Method | Endpoint | Açıklama |
| --- | --- | --- |
| GET | `/tickets` | Bilet listeleme (`?eventId=`, `?attendeeId=`, `?status=`) |
| GET | `/tickets/:id` | Bilet detayı |
| POST | `/tickets` | Bilet oluşturma (kapasite kontrolü) |
| PUT | `/tickets/:id` | Bilet güncelleme |
| DELETE | `/tickets/:id` | Bilet silme |

### Kapasite Kontrolü

`POST /tickets` çağrısı yapılırken sistem, ilgili etkinliğin kapasitesini kontrol eder. Kapasite doluysa satış engellenir:

**Yanıt (409 Conflict):**

```json
{
  "error": "Bu etkinliğin kapasitesi dolmuştur (2), bilet satışı yapılamaz."
}
```

**`POST /tickets` istek gövdesi:**

```json
{
  "eventId": "evt_001",
  "attendeeId": "att_003",
  "seat": "A5"
}
```

> `seat` belirtilmezse sistem otomatik olarak bir koltuk numarası atar.
> Bilet fiyatı otomatik olarak etkinliğin `price` değerinden alınır.

---

## Reports — Raporlama

### `GET /reports/summary` — Genel sistem özeti

**Yanıt (200 OK):**

```json
{
  "totalEvents": 4,
  "activeEvents": 4,
  "totalVenues": 4,
  "totalAttendees": 3,
  "totalTicketsSold": 3,
  "totalRevenue": 1200
}
```

### `GET /reports/:id/sales` — Etkinlik satış raporu

**Yanıt (200 OK):**

```json
{
  "event": { "id": "evt_001", "title": "İstanbul Caz Gecesi" },
  "sold": 2,
  "capacity": 2000,
  "remaining": 1998,
  "occupancy": "0.1%",
  "revenue": 700
}
```

### `GET /reports/:id/attendees` — Etkinlik katılımcı listesi

**Yanıt (200 OK):**

```json
{
  "event": "İstanbul Caz Gecesi",
  "count": 2,
  "attendees": [
    {
      "ticketId": "tkt_001",
      "seat": "A1",
      "status": "active",
      "attendee": { "id": "att_001", "name": "Musa Yılmaz", "email": "musa@example.com" }
    }
  ]
}
```

---

## Hata Yanıtları

| Durum Kodu | Anlam |
| --- | --- |
| `400` | Doğrulama hatası (eksik/geçersiz veri) |
| `404` | Kaynak veya endpoint bulunamadı |
| `409` | Kapasite dolu (bilet satışı engellendi) |
| `500` | Sunucu hatası |

Validation hatası örneği:

```json
{
  "error": "Doğrulama hatası",
  "details": [
    "\"title\" alanı zorunludur.",
    "\"category\" alanı şunlardan biri olmalıdır: konser, tiyatro, konferans, spor, festival, sinema."
  ]
}
```
