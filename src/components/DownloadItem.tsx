import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { join, resolve, downloadDir } from "@tauri-apps/api/path";
import { useEffect, useState } from "react";
import { getThumbnail } from "~/lib/utils";

interface DownloadItemProps {
  url: string;
}
export default function DownloadItem({ url }: DownloadItemProps) {
  const [progress, setProgress] = useState<number | null>(0);
  const [thumbnailURL, setThumbnailURL] = useState<string>();
  const [path, setPath] = useState<string>("");
  const [title, setTitle] = useState("");

  async function download() {
    const path = await join(await downloadDir(), "%(title)s.%(ext)s");
    const downloadID = await invoke<string>("yt_dlp_command", {
      args: [url, "-o", path],
    });

    await listen<string>(downloadID, (event) => {
      const line = event.payload;

      const progressRegex = /\[download\] ([0-9]+)% of/;
      const match = line.match(progressRegex);

      if (match && match.length > 1) {
        const progress = parseFloat(match[1]);
        setProgress(progress);
      }
    });
  }

  async function fetchThumnail() {
    const thumbnail = await getThumbnail(url);
    if (thumbnail) {
      setThumbnailURL(thumbnail);
    }
  }

  useEffect(() => {
    fetchThumnail();
    download();
  }, []);

  return (
    <tr>
      <td>
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="mask mask-squircle w-12 h-12">
              <img src={thumbnailURL} alt="" />
            </div>
          </div>
          <div>
            <div className="font-bold">{title}</div>
            <div className="text-sm opacity-50">{path}</div>
          </div>
        </div>
      </td>
      <td>
        <div
          className="radial-progress text-primary"
          style={{
            // @ts-ignore:next-line
            "--value": progress,
            // @ts-ignore:next-line
            "--size": "2.5rem",
            // @ts-ignore:next-line
            fontSize: "12px",
          }}
          role="progressbar"
        >
          {progress}%
        </div>
      </td>
      <td>size</td>
    </tr>
  );
}
