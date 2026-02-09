const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const downloadsDir = path.join(__dirname, "downloads");

// создаём папку, если её нет
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir);
  console.log("created folder:", downloadsDir);
}

// простая чистка
function cleanName(name) {
  const base = path.basename(name);
  return base.replace(/[^\w.\-() ]+/g, "_");
}

// multer: сохраняем файл на диск в downloads/
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, downloadsDir),
  filename: (req, file, cb) => cb(null, cleanName(file.originalname || "file")),
});

// лимит 50мб
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

// routes 

app.get("/", (req, res) => {
  res.type("text").send(
`Local File API is running.

POST  /upload            (multipart/form-data, field: file)
GET   /files
GET   /download/:name

Example:
curl -F "file=@test.txt" http://127.0.0.1:${PORT}/upload
`
  );
});

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ ok: false, error: "file is required (field name: file)" });
  }

  console.log("uploaded:", req.file.filename, req.file.size, "bytes");

  res.json({
    ok: true,
    filename: req.file.filename,
    size: req.file.size,
  });
});

app.get("/files", (req, res) => {
  const files = fs
    .readdirSync(downloadsDir, { withFileTypes: true })
    .filter((x) => x.isFile())
    .map((x) => x.name);

  res.json(files);
});

app.get("/download/:name", (req, res) => {
  const name = cleanName(req.params.name);
  const full = path.join(downloadsDir, name);

  if (!fs.existsSync(full)) {
    return res.status(404).json({ ok: false, error: "file not found" });
  }

  res.download(full, name);
});

// обработка ошибок multer 
app.use((err, req, res, next) => {
  if (err && err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ ok: false, error: "file too large" });
  }
  if (err) {
    return res.status(500).json({ ok: false, error: "server error" });
  }
  next();
});

app.listen(PORT, () => {
  console.log(`server: http://127.0.0.1:${PORT}`);
  console.log(`downloads: ${downloadsDir}`);
});
