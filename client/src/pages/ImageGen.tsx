import { Palette, Sparkles, Image as ImageIcon, Loader2, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ImageGen() {
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setGenerating(true);
    setGeneratedImage(null);

    try {
      toast.loading("Generating image using VipuDevAI... 🧠🎨");

      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      toast.dismiss();

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate image");
      }

      const data = await response.json();
      setGeneratedImage(data.url);
      toast.success("✨ Image generated successfully!");
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message || "Failed to generate image");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="glass-card p-8 h-full flex flex-col animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-500/20 rounded-lg text-pink-400">
            <Palette className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">DALL·E Image Generation</h2>
        </div>
      </div>

      {/* Prompt input + button */}
      <div className="space-y-4 mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to generate..."
            className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-pink-500/50 transition-colors"
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          />

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg shadow-pink-900/20 disabled:opacity-50"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Generate
          </button>
        </div>
      </div>

      {/* Image preview panel */}
      <div className="flex-1 flex items-center justify-center rounded-xl bg-black/20 border border-white/5 overflow-hidden">
        {generating ? (
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-pink-400 mx-auto mb-4" />
            <p className="text-gray-400">Generating your image...</p>
            <p className="text-xs text-gray-600 mt-1">This may take a few seconds</p>
          </div>
        ) : generatedImage ? (
          <img
            src={generatedImage}
            alt="Generated"
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        ) : (
          <div className="text-center text-gray-600">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>Enter a prompt and click Generate</p>
            <p className="text-xs mt-2 text-gray-700">Powered by DALL·E 3 via VipuDevAI backend</p>
          </div>
        )}
      </div>

      {/* Open external */}
      {generatedImage && (
        <div className="mt-4 flex justify-center">
          <a
            href={generatedImage}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-lime-400 hover:text-lime-300 flex items-center gap-2"
          >
            Open Full Size <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
}
