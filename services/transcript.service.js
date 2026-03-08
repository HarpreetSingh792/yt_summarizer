// import { exec } from "child_process";
// import fs from "fs";

// export const getTranscript = async (videoId) => {
//   return new Promise((resolve, reject) => {

//     const url = `https://www.youtube.com/watch?v=${videoId}`;

//     const command = `yt-dlp \
// --cookies cookies.txt \
// --skip-download \
// --write-auto-sub \
// --sub-langs "en.*" \
// --sub-format vtt \
// --no-playlist \
// --no-check-formats \
// --sleep-requests 3 \
// --retries 5 \
// --fragment-retries 5 \
// --extractor-args "youtube:player_client=android,web_safari,tv;youtube:skip=webpage" \
// -o "temp_%(id)s.%(ext)s" \
// ${url}`;

//     exec(command, (error, stdout, stderr) => {

//       console.log("STDOUT:", stdout);
//       console.log("STDERR:", stderr);

//       // find any subtitle file generated
//       const files = fs.readdirSync(".");
//       const subtitleFile = files.find(
//         f => f.startsWith(`temp_${videoId}`) && f.endsWith(".vtt")
//       );

//       if (!subtitleFile) {
//         return reject(new Error("Subtitle file not found"));
//       }

//       const content = fs.readFileSync(subtitleFile, "utf-8");

//       const text = content
//         .replace(/WEBVTT.*?\n/g, "")
//         .replace(/Kind:.*?\n/g, "")
//         .replace(/Language:.*?\n/g, "")
//         .replace(/\d{2}:\d{2}:\d{2}\.\d{3} --> .*?\n/g, "")
//         .replace(/<[^>]+>/g, "")
//         .replace(/align:start position:0%/g, "")
//         .replace(/\n/g, " ")
//         .replace(/\s+/g, " ")
//         .trim();

//       fs.unlinkSync(subtitleFile);

//       resolve(text);
//     });
//   });
// };


// v2
import axios from "axios";
import { YoutubeTranscript } from "youtube-transcript";
import { exec } from "child_process";
import fs from "fs";

export const getTranscript = async (videoId) => {

  // 1️⃣ Try YouTube timedtext API
  try {
    const url = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en`;

    const res = await axios.get(url);

    if (res.data && res.data.includes("<text")) {
      const text = res.data
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      return text;
    }

  } catch (err) {
    console.log("timedtext failed");
  }

  // 2️⃣ Try youtube-transcript library
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);

    const text = transcript
      .map(t => t.text)
      .join(" ");

    return text;

  } catch (err) {
    console.log("youtube-transcript failed");
  }

  // 3️⃣ Fallback to yt-dlp
  return new Promise((resolve, reject) => {

    const command = `yt-dlp \
--cookies cookies.txt \
--skip-download \
--write-auto-sub \
--sub-langs "en.*" \
--sub-format vtt \
--no-playlist \
--no-check-formats \
--sleep-requests 3 \
-o "temp_%(id)s.%(ext)s" \
https://www.youtube.com/watch?v=${videoId}`;

    exec(command, (error) => {

      const files = fs.readdirSync(".");
      const subtitleFile = files.find(
        f => f.startsWith(`temp_${videoId}`) && f.endsWith(".vtt")
      );

      if (!subtitleFile) {
        return reject(new Error("Transcript not available"));
      }

      const content = fs.readFileSync(subtitleFile, "utf-8");

      const text = content
        .replace(/WEBVTT.*?\n/g, "")
        .replace(/Kind:.*?\n/g, "")
        .replace(/Language:.*?\n/g, "")
        .replace(/\d{2}:\d{2}:\d{2}\.\d{3} --> .*?\n/g, "")
        .replace(/<[^>]+>/g, "")
        .replace(/\n/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      fs.unlinkSync(subtitleFile);

      resolve(text);
    });

  });
};