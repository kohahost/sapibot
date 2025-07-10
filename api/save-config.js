import { writeFile } from 'fs/promises';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  try {
    const body = req.body;
    await writeFile('/tmp/config.json', JSON.stringify(body, null, 2));
    res.status(200).send('Konfigurasi disimpan.');
  } catch (err) {
    res.status(500).send('Gagal simpan konfigurasi.');
  }
}
