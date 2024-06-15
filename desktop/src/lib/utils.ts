import { invoke } from "@tauri-apps/api/core";
import { Command } from "@tauri-apps/plugin-shell";
import { Dispatch, SetStateAction } from "react";

export type ModifyState<T> = Dispatch<SetStateAction<T>>;

export async function getThumbnail(url: string) {
  const command = Command.sidecar("yt-dlp", ["-J", url]);
  const output = await command.execute();
  const data = JSON.parse(output.stdout);
  const thumbNailURL = data?.thumbnails?.slice(-1)?.[0]?.url || data?.thumbnail;
  return thumbNailURL as string;
}

export async function openPath(path: string) {
  await invoke("open_path", { path });
}

export function cx(...cns: (boolean | string | undefined)[]): string {
  return cns.filter(Boolean).join(" ");
}
