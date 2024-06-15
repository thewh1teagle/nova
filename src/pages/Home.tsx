import { useTranslation } from "react-i18next"
import { Command } from '@tauri-apps/plugin-shell';
import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export default function Home() {
    const {t} = useTranslation()
    const [url, setUrl] = useState('')

    async function onClick() {
        const command = Command.sidecar('yt-dlp', ["-J", "https://www.youtube.com/watch?v=XzilCu9PcZk&pp=ygUFcGVkcm8%3D"]);
        const output = await command.execute();
        const data = JSON.parse(output.stdout)
        const thumbNailURL = data?.thumbnails?.slice(-1)?.[0]?.url || data.thumbnail
        setUrl(thumbNailURL)

    }
    async function download() {
        const downloadID = await invoke<string>("yt_dlp_command", {args: ["https://www.youtube.com/watch?v=XzilCu9PcZk&pp=ygUFcGVkcm8%3D"]})
        await listen(downloadID, (event) => {
            console.log('event => ', event.payload)
        })
    }
    return (
        <h1>
            {t('common.home')}
            <button className="btn btn-primary" onClick={onClick}>Click</button>
            <button className="btn btn-primary" onClick={download}>Download</button>
            {url && (
                <img src={url} alt="" />
            )}
        </h1>
    )
}