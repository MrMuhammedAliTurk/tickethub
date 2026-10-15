# TicketHub — Veri Modeli Tasarımı

Sistem dört temel varlık (entity) üzerine kuruludur. Tüm veriler JSON formatında `src/data/db.json` dosyasında saklanır.

## Varlıklar ve İlişkiler

```
Venue (Mekan)         1 ──< Event (Etkinlik)        1 ──< Ticket (Bilet) >── 1 Attendee (Katılımcı)
```

- Bir **mekan** birden fazla **etkinliğe** ev sahipliği yapabilir.
- Bir **etkinlik** için birden fazla **bilet** satılabilir.
- Her **bilet** bir **katılımcıya** aittir.

## 1. Venue (Mekan)

| Alan | Tip | Açıklama |
| --- | --- | --- |
| `id` | string | Benzersiz kimlik (`ven_...`) |
| `name` | string | Mekan adı |
| `city` | string | Şehir |
| `address` | string | Adres |
| `capacity` | number | Toplam kapasite |

## 2. Event (Etkinlik)

| Alan | Tip | Açıklama |
| --- | --- | --- |
| `id` | string | Benzersiz kimlik (`evt_...`) |
| `title` | string | Etkinlik başlığı |
| `description` | string | Açıklama |
| `category` | string | Kategori: `konser`, `tiyatro`, `konferans`, `spor`, `festival`, `sinema` |
| `city` | string | Şehir |
| `venueId` | string | Bağlı mekanın id'si (FK) |
| `date` | string | Etkinlik tarihi |
| `price` | number | Bilet fiyatı |
| `capacity` | number | Satılabilecek bilet sayısı |
| `status` | string | Durum: `active`, `cancelled`, `completed` |

## 3. Attendee (Katılımcı)

| Alan | Tip | Açıklama |
| --- | --- | --- |
| `id` | string | Benzersiz kimlik (`att_...`) |
| `name` | string | Ad soyad |
| `email` | string | E-posta adresi |
| `phone` | string | Telefon numarası |

## 4. Ticket (Bilet)

| Alan | Tip | Açıklama |
| --- | --- | --- |
| `id` | string | Benzersiz kimlik (`tkt_...`) |
| `eventId` | string | Bağlı etkinlik id'si (FK) |
| `attendeeId` | string | Bağlı katılımcı id'si (FK) |
| `seat` | string | Koltuk numarası |
| `price` | number | Ödenen ücret (etkinlik fiyatından alınır) |
| `purchaseDate` | string | Satın alma zaman damgası |
| `status` | string | Durum: `active`, `cancelled`, `used` |

## Kimlik (ID) Üretimi

Yeni kayıtlar oluşturulurken benzersiz kimlikler Node.js'in `crypto.randomUUID()` fonksiyonuyla üretilir ve varlık türüne göre önek alır:

- Mekan → `ven_ab12cd34`
- Etkinlik → `evt_ab12cd34`
- Katılımcı → `att_ab12cd34`
- Bilet → `tkt_ab12cd34`
