import { useTranslation } from "react-i18next"
import { Command } from '@tauri-apps/plugin-shell';
import { useState } from "react";

export default function Home() {
    const {t} = useTranslation()
    const [url, setUrl] = useState('')

    async function onClick() {
        const command = Command.sidecar('yt-dlp', ["-J", "https://www.instagram.com/reel/C8J1GRKgm3G/?utm_source=ig_web_copy_link"]);
        const output = await command.execute();
        const data = JSON.parse(output.stdout)
        const thumbNailURL = data?.thumbnails?.slice(-1)?.[0]?.url || data.thumbnail
        setUrl(thumbNailURL)

    }
    return (
        <h1>
            {t('common.home')}
            <button onClick={onClick}>Click</button>
            {url && (
                <img src={url} alt="" />
            )}
        </h1>
    )
}