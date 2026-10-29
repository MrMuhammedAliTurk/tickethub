const fs = require('node:fs');
const path = require('node:path');

const DB_PATH = process.env.TICKETHUB_DB_PATH || path.join(__dirname, 'db.json');
const COLLECTIONS = ['events', 'venues', 'attendees', 'tickets'];
const EMPTY_DB = () => ({ events: [], venues: [], attendees: [], tickets: [] });

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function validateDatabase(parsed) {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Veri dosyasının kök değeri bir JSON nesnesi olmalıdır.');
  }

  const normalized = { ...EMPTY_DB(), ...parsed };
  for (const collection of COLLECTIONS) {
    if (!Array.isArray(normalized[collection])) {
      throw new Error(`Veri dosyasındaki "${collection}" alanı bir dizi olmalıdır.`);
    }
  }
  return normalized;
}

function load() {
  if (!fs.existsSync(DB_PATH)) return EMPTY_DB();

  let raw;
  try {
    raw = fs.readFileSync(DB_PATH, 'utf8');
  } catch (error) {
    throw new Error(`TicketHub veri dosyası okunamadı (${DB_PATH}): ${error.message}`);
  }

  try {
    return validateDatabase(JSON.parse(raw));
  } catch (error) {
    throw new Error(`TicketHub veri dosyası geçersiz (${DB_PATH}). Dosya otomatik olarak sıfırlanmadı; veri kaybını önlemek için içeriği kontrol edin. Ayrıntı: ${error.message}`);
  }
}

let db = load();

/**
 * Veriyi önce aynı klasördeki geçici dosyaya yazar, sonra hedef dosya ile
 * değiştirir. Böylece işlem yarıda kesilirse tamamlanmamış JSON'un ana veri
 * dosyasını bozma riski azaltılır.
 */
function save() {
  const directory = path.dirname(DB_PATH);
  fs.mkdirSync(directory, { recursive: true });
  const temporaryPath = `${DB_PATH}.${process.pid}.${Date.now()}.tmp`;

  try {
    fs.writeFileSync(temporaryPath, JSON.stringify(db, null, 2) + '\n', { encoding: 'utf8', flag: 'wx' });
    fs.renameSync(temporaryPath, DB_PATH);
  } catch (error) {
    try { fs.rmSync(temporaryPath, { force: true }); } catch { /* ignore cleanup failure */ }
    throw new Error(`TicketHub veri dosyası kaydedilemedi (${DB_PATH}): ${error.message}`);
  }
}

/** Geri alma desteği: dosyaya yazma başarısız olursa bellek içi veri de korunur. */
function persistMutation(mutation) {
  const previous = clone(db);
  try {
    mutation();
    save();
  } catch (error) {
    db = previous;
    throw error;
  }
}

function getAll(collection) {
  if (!COLLECTIONS.includes(collection)) throw new Error(`Bilinmeyen veri koleksiyonu: ${collection}`);
  return clone(db[collection]);
}

function getById(collection, id) {
  if (!COLLECTIONS.includes(collection)) throw new Error(`Bilinmeyen veri koleksiyonu: ${collection}`);
  const item = db[collection].find((entry) => entry.id === id);
  return item ? clone(item) : undefined;
}

function insert(collection, item) {
  if (!COLLECTIONS.includes(collection)) throw new Error(`Bilinmeyen veri koleksiyonu: ${collection}`);
  let inserted;
  persistMutation(() => {
    db[collection].push(clone(item));
    inserted = clone(item);
  });
  return inserted;
}

function update(collection, id, updated) {
  if (!COLLECTIONS.includes(collection)) throw new Error(`Bilinmeyen veri koleksiyonu: ${collection}`);
  let saved;
  persistMutation(() => {
    const index = db[collection].findIndex((item) => item.id === id);
    if (index === -1) return;
    db[collection][index] = { ...db[collection][index], ...clone(updated), id: db[collection][index].id };
    saved = clone(db[collection][index]);
  });
  return saved || null;
}

function remove(collection, id) {
  if (!COLLECTIONS.includes(collection)) throw new Error(`Bilinmeyen veri koleksiyonu: ${collection}`);
  let removed = false;
  persistMutation(() => {
    const index = db[collection].findIndex((item) => item.id === id);
    if (index === -1) return;
    db[collection].splice(index, 1);
    removed = true;
  });
  return removed;
}

module.exports = { getAll, getById, insert, update, remove };
