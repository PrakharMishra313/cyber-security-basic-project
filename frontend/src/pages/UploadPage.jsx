import { useState } from "react";
import Upload from "../components/Upload";
import FileList from "../components/FileList";

export default function UploadPage() {
  const [vaultRefresh, setVaultRefresh] = useState(0);

  return (
    <div className="fade-in-up grid min-h-0 w-full flex-1 grid-cols-1 gap-7 md:gap-8 xl:grid-cols-2 xl:items-stretch xl:gap-10 2xl:gap-12">
      <Upload refreshFiles={() => setVaultRefresh((n) => n + 1)} />
      <FileList refreshTrigger={vaultRefresh} />
    </div>
  );
}
