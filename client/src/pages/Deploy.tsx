import { Rocket, Globe, Server, ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function DeployPage() {
  const [deploying, setDeploying] = useState<string | null>(null);
  const [deployLogs, setDeployLogs] = useState("");

  const handleDeploy = async (provider: string) => {
    setDeployLogs("");
    setDeploying(provider);

    try {
      toast.loading(`Preparing deployment instructions for ${provider}...`);

      const response = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: provider }),
      });

      toast.dismiss();

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error || "Failed to deploy");
      }

      const data = await response.json();
      setDeployLogs(data.logs);
      toast.success(`Deployment info ready for ${provider}! 🚀`);
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.message || "Failed to fetch deploy info");
    } finally {
      setDeploying(null);
    }
  };

  return (
    <div className="glass-card p-8 h-full overflow-auto animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
        <Rocket className="w-6 h-6 text-purple-400" /> Deployment Center
      </h2>
      <p className="text-gray-400 mb-8">
        Deploy your project seamlessly using popular cloud platforms.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Vercel */}
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-full bg-black border border-white/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" viewBox="0 0 1155 1000" fill="currentColor">
                <path d="M577.344 0L1154.69 1000H0L577.344 0Z" />
              </svg>
            </div>
            <a
              href="https://vercel.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-500 hover:text-lime-400 flex items-center gap-1"
            >
              Docs <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Vercel</h3>
          <p className="text-sm text-gray-500 mb-4">Best for Next.js & frontend frameworks.</p>

          <button
            onClick={() => handleDeploy("vercel")}
            disabled={deploying === "vercel"}
            className="w-full py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {deploying === "vercel" ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Deploy to Vercel
          </button>
        </div>

        {/* Render */}
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-full bg-black border border-white/10 flex items-center justify-center">
              <Server className="w-6 h-6 text-white" />
            </div>
            <a
              href="https://render.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-500 hover:text-lime-400 flex items-center gap-1"
            >
              Docs <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Render</h3>
          <p className="text-sm text-gray-500 mb-4">Great for fullstack apps.</p>

          <button
            onClick={() => handleDeploy("render")}
            disabled={deploying === "render"}
            className="w-full py-2 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {deploying === "render" ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Deploy to Render
          </button>
        </div>

        {/* Railway */}
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-full bg-black border border-white/10 flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <a
              href="https://docs.railway.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-500 hover:text-lime-400 flex items-center gap-1"
            >
              Docs <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Railway</h3>
          <p className="text-sm text-gray-500 mb-4">Simple setup. Fast deployment.</p>

          <button
            onClick={() => handleDeploy("railway")}
            disabled={deploying === "railway"}
            className="w-full py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {deploying === "railway" ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Deploy to Railway
          </button>
        </div>
      </div>

      {/* Deployment Output */}
      {deployLogs && (
        <div className="mt-8 p-4 rounded-lg bg-black/30 border border-white/10 font-mono text-sm text-gray-300 overflow-auto max-h-56">
          <pre>{deployLogs}</pre>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 p-6 rounded-xl bg-lime-400/5 border border-lime-400/20">
        <h3 className="text-lg font-bold text-white mb-2">Manual Deployment</h3>
        <p className="text-sm text-gray-400 mb-4">Or deploy manually:</p>
        <div className="bg-black/40 rounded-lg p-4 font-mono text-sm text-gray-300 space-y-1">
          <div><span className="text-lime-400">$</span> npm run build</div>
          <div><span className="text-lime-400">$</span> npm run start</div>
        </div>
        <p className="text-xs text-gray-600 mt-3">
          Ensure your hosting provider has the <code>DATABASE_URL</code> and <code>OPENAI_API_KEY</code> set.
        </p>
      </div>
    </div>
  );
}
