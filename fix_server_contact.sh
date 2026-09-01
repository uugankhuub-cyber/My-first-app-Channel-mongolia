sed -i '/app.all('\''\/api\/upload'\'', wrapHandler(uploadHandler));/a \
  app.post('\''/api/contact'\'', (req, res) => {\
    const { name, email, message } = req.body;\
    if (!name || !email || !message) return res.status(400).json({ error: '\''Missing fields'\'' });\
    console.log('\''New contact message:'\'', { name, email, message });\
    res.json({ success: true });\
  });' server.ts
