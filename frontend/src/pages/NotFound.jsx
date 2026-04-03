import { Link } from "react-router-dom";
import ToolPage from "../components/ToolPage";

export default function NotFound() {
  return (
    <ToolPage title="404" icon="⎋" description="This path is not part of the toolkit.">
      <div className="flex flex-col gap-6 font-mono text-sm text-[#00ff9f]/70">
        <p>The page you requested does not exist.</p>
        <Link
          to="/"
          className="inline-flex w-fit items-center justify-center rounded-xl border border-[#00ff9f]/40 bg-[#00ff9f]/10 px-5 py-2.5 text-[#b7ffe8] transition hover:border-[#22d3ee]/50 hover:bg-[#00ff9f]/15"
        >
          Back to dashboard
        </Link>
      </div>
    </ToolPage>
  );
}
