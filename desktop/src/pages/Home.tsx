import { ReactComponent as DownloadIcon } from "~/icons/download.svg";
import { useState } from "react";
import DownloadItem from "~/components/DownloadItem";
import Format from "~/components/Format";

export default function Home() {
  const [urls, _setUrls] = useState([
    "https://www.youtube.com/watch?v=XzilCu9PcZk&pp=ygUFcGVkcm8%3D",
  ]);

  return (
    <div className="max-w-[1200px] m-auto p-5">
      <div className="flex justify-center">
        <label className="input input-bordered flex items-center gap-2 w-[500px]">
          <input
            type="text"
            className="grow"
            placeholder="Paste URL and press enter"
          />
          <DownloadIcon className="w-5 h-5 cursor-pointer fill-primary" />
          <Format />
        </label>
      </div>
      <div className="mt-5 p-5">
        <div className="overflow-x-auto">
          <table className="table">
            {/* head */}
            <thead>
              <tr>
                <th>Name</th>
                <th>Progress</th>
                <th>Size</th>
              </tr>
            </thead>
            <tbody>
              {urls.map((url) => (
                <DownloadItem key={url} url={url} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
