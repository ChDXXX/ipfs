// api/upload.js
import { IncomingForm } from 'formidable';
import fs from 'fs';
import * as w3up from '@web3-storage/w3up-client';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const form = new IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Form parse error' });

    try {
      const uploaded = files.file;
      const buffer = fs.readFileSync(uploaded.filepath);
      const blob = new Blob([buffer], { type: uploaded.mimetype });
      const file = new File([blob], uploaded.originalFilename, {
        type: uploaded.mimetype,
      });

      const client = await w3up.create();
      await client.login(process.env.W3UP_KEY);
      await client.setCurrentSpace(process.env.W3UP_SPACE);

      const cid = await client.uploadFile(file);
      res.status(200).json({ cid: cid.toString() });
    } catch (e) {
      console.error("❌ Upload failed:", e);
      res.status(500).json({ error: e.message });
    }
  });
}
