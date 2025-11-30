import { Container, Play, Terminal, Loader2 } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export default function Docker() {
  const [code, setCode] = useState("console.log('Hello from VipuDev.AI!');");
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState<string[]>([]);

  const runCodeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/executions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, output: "", error: "", exitCode: "0" }),
      });
      if (!res.ok) throw new Error("Failed to run code");
      return res.json();
    },
    onSuccess: (data) => {
      setOutput([
        `$ Running ${language} code...`,
        `> Execution logged with ID: ${data.execution.id}`,
        `> Code saved to database`,
        `> To execute code server-side, configure your Docker endpoint in Config`,
      ]);
      toast.success("Code execution logged!");
    },
    onError: () => {
      toast.error("Failed to run code");
    },
  });

  return (
    <div className="glass-card p-6 h-full flex flex-col animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
            <Container className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Code Runner</h2>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-400/50"
            data-testid="select-language"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="typescript">TypeScript</option>
          </select>
          <button
            onClick={() => runCodeMutation.mutate()}
            disabled={runCodeMutation.isPending}
            className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-green-900/20 flex items-center gap-2 disabled:opacity-50"
            data-testid="button-run-code"
          >
            {runCodeMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Run Code
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        <div className="flex-1 flex flex-col">
          <label className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Code Input</label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 bg-black/40 border border-white/10 rounded-xl p-4 font-mono text-sm text-gray-200 resize-none focus:outline-none focus:border-lime-400/30"
            placeholder="Write your code here..."
            data-testid="textarea-code-input"
          />
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <Terminal className="w-3 h-3 text-gray-500" />
            <label className="text-xs text-gray-500 uppercase tracking-wider">Output</label>
          </div>
          <div className="flex-1 bg-black/40 rounded-xl border border-white/10 p-4 font-mono text-sm overflow-auto">
            {output.length === 0 ? (
              <div className="text-gray-600">Run code to see output...</div>
            ) : (
              <div className="space-y-1 text-gray-300">
                {output.map((line, i) => (
                  <div key={i} className={line.startsWith('$') ? 'text-green-400' : line.startsWith('>') ? 'text-blue-400' : ''}>
                    {line}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 rounded-lg bg-lime-400/5 border border-lime-400/20 text-xs text-gray-400">
        <strong className="text-lime-400">Note:</strong> For full Docker execution, add your Docker API endpoint in the Config page.
      </div>
    </div>
  );
}
