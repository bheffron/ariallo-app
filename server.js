const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
const upload = multer({ dest: "uploads/" });

app.post("/mix", upload.fields([{ name: "voice" }, { name: "music" }]), (req, res) => {
  const voicePath = req.files.voice[0].path;
  const musicPath = req.files.music[0].path;
  const outputPath = `output/${Date.now()}_mixed.mp3`;

  const ffmpegCmd = `ffmpeg -i ${voicePath} -i ${musicPath} -filter_complex "[1:a]volume=0.2[a1];[0:a][a1]amix=inputs=2:duration=first:dropout_transition=2" -c:a libmp3lame -b:a 192k ${outputPath}`;

  exec(ffmpegCmd, (error) => {
    if (error) {
      console.error("FFmpeg error:", error);
      return res.status(500).send("Failed to mix audio.");
    }

    res.download(outputPath, () => {
      // Cleanup
      fs.unlinkSync(voicePath);
      fs.unlinkSync(musicPath);
      fs.unlinkSync(outputPath);
    });
  });
});

app.get("/", (req, res) => res.send("Audio Mixer Server is running."));

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started on port 3000");
});
