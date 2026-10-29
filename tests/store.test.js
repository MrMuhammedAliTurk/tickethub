const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const projectRoot = path.join(__dirname, '..');

test('JSON veri deposu yazılan kayıtları kalıcı olarak saklar ve geçici dosya bırakmaz', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tickethub-store-'));
  const dbPath = path.join(dir, 'nested', 'db.json');
  const script = `
    const store = require('./src/data/store');
    store.insert('venues', { id: 'ven_test', name: 'Test Mekan' });
    store.update('venues', 'ven_test', { name: 'Güncel Mekan' });
    process.stdout.write(JSON.stringify(store.getById('venues', 'ven_test')));
  `;
  try {
    const run = spawnSync(process.execPath, ['-e', script], {
      cwd: projectRoot,
      encoding: 'utf8',
      env: { ...process.env, TICKETHUB_DB_PATH: dbPath }
    });
    assert.equal(run.status, 0, run.stderr);
    assert.deepEqual(JSON.parse(run.stdout), { id: 'ven_test', name: 'Güncel Mekan' });
    const stored = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    assert.deepEqual(stored.venues, [{ id: 'ven_test', name: 'Güncel Mekan' }]);
    assert.deepEqual(fs.readdirSync(path.dirname(dbPath)), ['db.json']);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('bozuk JSON veri dosyası üzerine sessizce yazılmaz; açıklayıcı hata verir', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tickethub-corrupt-'));
  const dbPath = path.join(dir, 'db.json');
  fs.writeFileSync(dbPath, '{not json', 'utf8');
  const script = `require('./src/data/store')`;
  try {
    const run = spawnSync(process.execPath, ['-e', script], {
      cwd: projectRoot,
      encoding: 'utf8',
      env: { ...process.env, TICKETHUB_DB_PATH: dbPath }
    });
    assert.notEqual(run.status, 0);
    assert.match(run.stderr, /veri dosyası geçersiz/i);
    assert.equal(fs.readFileSync(dbPath, 'utf8'), '{not json');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
