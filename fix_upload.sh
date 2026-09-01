#!/bin/bash
cat << 'INNER_EOF' > api/admin-handlers.ts.patch
--- api/admin-handlers.ts
+++ api/admin-handlers.ts
@@ -1,5 +1,7 @@
 import { GoogleGenAI } from '@google/genai';
 import { adminAuth } from '../lib/firebase-admin.js'; // Note: Only used if real DB is connected
+import fs from 'fs';
+import path from 'path';
 
 export const askAI = async (req: any, res: any) => {
   const { action, text } = req.body;
@@ -36,6 +38,20 @@
 };
 
 export const adminUpload = async (req: any, res: any) => {
-  // Mock upload for now
-  res.json({ url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800' });
+  try {
+    const { fileName, fileBase64 } = req.body;
+    if (!fileBase64) return res.status(400).json({ error: 'No file data' });
+    
+    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
+    if (!fs.existsSync(uploadDir)) {
+      fs.mkdirSync(uploadDir, { recursive: true });
+    }
+    
+    const uniqueName = Date.now() + '-' + fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
+    const filePath = path.join(uploadDir, uniqueName);
+    fs.writeFileSync(filePath, Buffer.from(fileBase64, 'base64'));
+    
+    res.json({ url: \`/uploads/\${uniqueName}\` });
+  } catch (error) {
+    console.error('Upload error:', error);
+    res.status(500).json({ error: 'Upload failed' });
+  }
 };
INNER_EOF
patch api/admin-handlers.ts < api/admin-handlers.ts.patch
