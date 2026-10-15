const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db.json');

/**
 * Veri katmanı: tüm veriler JSON dosyasında tutulur.
 * Her CRUD işlemi sonrasında dosya güncellenir (kalıcılık sağlanır).
 */

function load() {
  if (!fs.existsSync(DB_PATH)) {
    return { events: [], venues: [], attendees: [], tickets: [] };
  }
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

const db = load();

function save() {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

function getAll(collection) {
  return db[collection] || [];
}

function getById(collection, id) {
  return (db[collection] || []).find((item) => item.id === id);
}

function insert(collection, item) {
  db[collection] = db[collection] || [];
  db[collection].push(item);
  save();
  return item;
}

function update(collection, id, updated) {
  const list = db[collection] || [];
  const index = list.findIndex((item) => item.id === id);
  if (index === -1) return null;
  list[index] = { ...list[index], ...updated, id: list[index].id };
  save();
  return list[index];
}

function remove(collection, id) {
  const list = db[collection] || [];
  const index = list.findIndex((item) => item.id === id);
  if (index === -1) return false;
  list.splice(index, 1);
  save();
  return true;
}

module.exports = { getAll, getById, insert, update, remove };
