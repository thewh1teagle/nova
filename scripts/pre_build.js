import { $ } from 'bun'
import fs from 'fs/promises'
import os from 'os'
import path from 'path'

const originalCWD = process.cwd()
// Change CWD to src-tauri
process.chdir(path.join(__dirname, '../src-tauri'))
const platform = {
	win32: 'windows',
	darwin: 'macos',
	linux: 'linux',
}[os.platform()]
const cwd = process.cwd()


const config = {
	ffmpegRealname: 'ffmpeg',
	ytDlpRealName: 'yt-dlp',
	windows: {
		ffmpegName: 'ffmpeg-6.1-windows-desktop-vs2022ltl-default',
		ffmpegUrl: 'https://master.dl.sourceforge.net/project/avbuild/windows-desktop/ffmpeg-6.1-windows-desktop-vs2022ltl-default.7z?viasf=1',
		ytDlpUrl: 'https://github.com/yt-dlp/yt-dlp/releases/download/2024.05.27/yt-dlp.exe'
	},
	linux: {
		aptPackages: [
			'ffmpeg',
			'libavdevice-dev', // FFMPEG
		],
		ytDlpUrl: 'https://github.com/yt-dlp/yt-dlp/releases/download/2024.05.27/yt-dlp_linux'
	},
	macos: {
		ffmpegName: 'ffmpeg-6.1-macOS-default',
		ffmpegUrl: 'https://master.dl.sourceforge.net/project/avbuild/macOS/ffmpeg-6.1-macOS-default.tar.xz?viasf=1',
		ytDlpUrl: 'https://github.com/yt-dlp/yt-dlp/releases/download/2024.05.27/yt-dlp_macos'
	},
}
// Export for Github actions
const exports = {
	ffmpeg: path.join(cwd, config.ffmpegRealname),
}

/* ########## Linux ########## */
if (platform == 'linux') {
	// Install APT packages
	await $`sudo apt-get update`
	for (const name of config.linux.aptPackages) {
		await $`sudo apt-get install -y ${name}`
	}
}

/* ########## Windows ########## */
if (platform == 'windows') {
	// Setup FFMPEG
	if (!(await fs.exists(config.ffmpegRealname))) {
		await $`C:\\msys64\\usr\\bin\\wget.exe -nc --show-progress ${config.windows.ffmpegUrl} -O ${config.windows.ffmpegName}.7z`
		await $`'C:\\Program Files\\7-Zip\\7z.exe' x ${config.windows.ffmpegName}.7z`
		await $`mv ${config.windows.ffmpegName} ${config.ffmpegRealname}`
		await $`rm -rf ${config.windows.ffmpegName}.7z`
		await $`mv ${config.ffmpegRealname}/lib/x64/* ${config.ffmpegRealname}/lib/`
	}
	// Setup yt-dlp
	if (!(await fs.exists(`${config.ytDlpRealName}.exe`))) {
		await $`C:\\msys64\\usr\\bin\\wget.exe -nc --show-progress ${config.windows.ytDlpUrl} -O ${config.ytDlpRealName}.exe`
	}
}

/* ########## macOS ########## */
if (platform == 'macos') {
	// Setup FFMPEG
	if (!(await fs.exists(config.ffmpegRealname))) {
		await $`wget -nc --show-progress ${config.macos.ffmpegUrl} -O ${config.macos.ffmpegName}.tar.xz`
		await $`tar xf ${config.macos.ffmpegName}.tar.xz`
		await $`mv ${config.macos.ffmpegName} ${config.ffmpegRealname}`
		await $`rm ${config.macos.ffmpegName}.tar.xz`
	}
	// Setup yt-dlp
	if (!(await fs.exists(config.ytDlpRealName))) {
		await $`C:\\msys64\\usr\\bin\\wget.exe -nc --show-progress ${config.windows.ytDlpUrl} -O ${config.ytDlpRealName}`
	}
}

// Config Github ENV
if (process.env.GITHUB_ENV) {
	console.log('Adding ENV')
	if (platform == 'macos' || platform == 'windows') {
		const ffmpeg = `FFMPEG_DIR=${exports.ffmpeg}\n`
		console.log('Adding ENV', ffmpeg)
		await fs.appendFile(process.env.GITHUB_ENV, ffmpeg)
	}
}

// --dev or --build
const action = process.argv?.[2]
if (action?.includes('--build' || action.includes('--dev'))) {
	process.chdir(path.join(cwd, '..'))
	process.env['FFMPEG_DIR'] = exports.ffmpeg
	await $`bun install`
	await $`bunx tauri ${action.includes('--dev') ? 'dev' : 'build'}`
}