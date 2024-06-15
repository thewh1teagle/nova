import { $ } from "bun";
import fs from "fs/promises";
import os from "os";
import path from "path";

const rustInfo = await $`rustc -vV`.text();
let targetTriple;
if (process.env?.MATRIX_ARGS?.includes("x86_64-apple-darwin")) {
  targetTriple = "x86_64-apple-darwin";
} else {
  targetTriple = /host: (\S+)/g.exec(rustInfo)[1];
}

const originalCWD = process.cwd();
// Change CWD to src-tauri
process.chdir(path.join(__dirname, "../src-tauri"));
const platform = {
  win32: "windows",
  darwin: "macos",
  linux: "linux",
}[os.platform()];
const cwd = process.cwd();

const config = {
  ffmpegDirName: `ffmpeg`,
  ffmpegRealName:
    platform === "windows"
      ? `ffmpeg-${targetTriple}.exe`
      : `ffmpeg-${targetTriple}`,
  ffprobeRealName:
    platform === "windows"
      ? `ffprobe-${targetTriple}.exe`
      : `ffprobe-${targetTriple}`,
  ytDlpRealName:
    platform === "windows"
      ? `yt-dlp-${targetTriple}.exe`
      : `yt-dlp-${targetTriple}`,
  windows: {
    ffmpegName: "ffmpeg-6.1-windows-desktop-vs2022ltl-default",
    ffmpegUrl:
      "https://master.dl.sourceforge.net/project/avbuild/windows-desktop/ffmpeg-6.1-windows-desktop-vs2022ltl-default.7z?viasf=1",
    ytDlpUrl:
      "https://github.com/yt-dlp/yt-dlp/releases/download/2024.05.27/yt-dlp.exe",
  },
  linux: {
    aptPackages: [
      "ffmpeg",
      "libavdevice-dev", // FFMPEG
    ],
    ytDlpUrl:
      "https://github.com/yt-dlp/yt-dlp/releases/download/2024.05.27/yt-dlp_linux",
  },
  macos: {
    ffmpegName: "ffmpeg-6.1-macOS-default",
    ffmpegUrl:
      "https://master.dl.sourceforge.net/project/avbuild/macOS/ffmpeg-6.1-macOS-default.tar.xz?viasf=1",
    ytDlpUrl:
      "https://github.com/yt-dlp/yt-dlp/releases/download/2024.05.27/yt-dlp_macos",
  },
};
console.log("config => ", config);
// Export for Github actions
const exports = {
  ffmpeg: path.join(cwd, config.ffmpegDirName),
};

/* ########## Linux ########## */
if (platform == "linux") {
  // Install APT packages
  await $`sudo apt-get update`;
  for (const name of config.linux.aptPackages) {
    await $`sudo apt-get install -y ${name}`;
  }
  // Setup yt-dlp
  if (!(await fs.exists(`${config.ytDlpRealName}`))) {
    await $`wget.exe -nc --show-progress ${config.linux.ytDlpUrl} -O ${config.ytDlpRealName}`;
  }
}

/* ########## Windows ########## */
if (platform == "windows") {
  // Setup FFMPEG
  if (!(await fs.exists(config.ffmpegDirName))) {
    await $`C:\\msys64\\usr\\bin\\wget.exe -nc --show-progress ${config.windows.ffmpegUrl} -O ${config.windows.ffmpegName}.7z`;
    await $`'C:\\Program Files\\7-Zip\\7z.exe' x ${config.windows.ffmpegName}.7z`;
    await $`mv ${config.windows.ffmpegName} ${config.ffmpegDirName}`;
    await $`rm -rf ${config.windows.ffmpegName}.7z`;
    await $`mv ${config.ffmpegDirName}/lib/x64/* ${config.ffmpegDirName}/lib/`;
  }
  // Setup yt-dlp
  if (!(await fs.exists(`${config.ytDlpRealName}`))) {
    await $`C:\\msys64\\usr\\bin\\wget.exe -nc --show-progress ${config.windows.ytDlpUrl} -O ${config.ytDlpRealName}`;
  }
  // Setup ffmpeg and ffprobe
  if (!(await fs.exists(config.ffmpegRealName))) {
    await fs.copyFile(
      path.join(cwd, "ffmpeg/bin/x64/ffmpeg.exe"),
      path.join(cwd, config.ffmpegRealName)
    );
    await fs.copyFile(
      path.join(cwd, "ffmpeg/bin/x64/ffprobe.exe"),
      path.join(cwd, config.ffprobeRealName)
    );
  }
}

/* ########## macOS ########## */
if (platform == "macos") {
  // Setup FFMPEG
  if (!(await fs.exists(config.ffmpegDirName))) {
    await $`wget -nc --show-progress ${config.macos.ffmpegUrl} -O ${config.macos.ffmpegName}.tar.xz`;
    await $`tar xf ${config.macos.ffmpegName}.tar.xz`;
    await $`mv ${config.macos.ffmpegName} ${config.ffmpegDirName}`;
    await $`rm ${config.macos.ffmpegName}.tar.xz`;
  }
  // Setup yt-dlp
  if (!(await fs.exists(config.ytDlpRealName))) {
    await $`wget -nc --show-progress ${config.macos.ytDlpUrl} -O ${config.ytDlpRealName}`;
    await $`chmod +x ${config.ytDlpRealName}`;
  }
  // Setup ffmpeg and ffprobe
  if (!(await fs.exists(config.ffmpegRealName))) {
    await fs.copyFile(
      path.join(cwd, "ffmpeg/bin/ffmpeg"),
      path.join(cwd, config.ffmpegRealName)
    );
    await fs.copyFile(
      path.join(cwd, "ffmpeg/bin/ffprobe"),
      path.join(cwd, config.ffprobeRealName)
    );
  }
}

// Config Github ENV
if (process.env.GITHUB_ENV) {
  console.log("Adding ENV");
  if (platform == "macos" || platform == "windows") {
    const ffmpeg = `FFMPEG_DIR=${exports.ffmpeg}\n`;
    console.log("Adding ENV", ffmpeg);
    await fs.appendFile(process.env.GITHUB_ENV, ffmpeg);
  }
}

// --dev or --build
const action = process.argv?.[2];
if (action?.includes("--build" || action.includes("--dev"))) {
  process.chdir(path.join(cwd, ".."));
  process.env["FFMPEG_DIR"] = exports.ffmpeg;
  await $`bun install`;
  await $`bunx tauri ${action.includes("--dev") ? "dev" : "build"}`;
}
