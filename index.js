const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve the HTML page
app.get("/", (req, res) => {
    try {
        res.sendFile(__dirname + "/public/index.html");
    } catch (err) {
        res.status(500).send("internal server error occurred");
    }
});

// Serve the poster image and potentially other static files
app.get("/:file_name", (req, res) => {
    try {
        res.sendFile(__dirname + "/" + req.params.file_name);
    } catch (err) {
        res.status(500).send("internal server error occurred");
    }
});

// Stream the video
app.get("/video", (req, res) => {
    const range = req.headers.range;
    if (!range) {
        res.status(400).send("Range must be provided");
        return;
    }

    const videoPath = path.join(__dirname, "public", "video.mp4");
    const videoSize = fs.statSync(videoPath).size;

    const CHUNK_SIZE = 10 ** 6; // 1MB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
    const contentLength = end - start + 1;

    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
    };

    res.writeHead(206, headers);

    const videoStream = fs.createReadStream(videoPath, { start, end });
    videoStream.pipe(res);
});

app.listen(PORT, () => {
    console.log("SERVER STARTED AT PORT: " + PORT);
});
