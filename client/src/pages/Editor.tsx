import Editor from "@monaco-editor/react";
import { FilePlus, Save, File, FolderOpen, Loader2, Trash2, PlayCircle, Bot, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Project } from "@shared/schema";
import { toast } from "sonner";

interface ProjectFile {
  path: string;
  content: string;
  language: string;
}

export default function EditorPage() {
  const queryClient = useQueryClient();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [editorContent, setEditorContent] = useState("");

  // ================= FETCH PROJECTS =================
  const { data: projectsData, isLoading: loadingProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json() as Promise<{ projects: Project[] }>;
    },
  });

  const selectedProject = projectsData?.projects.find(p => p.id === selectedProjectId);

  // ================= LOAD PROJECT FILES =================
  useEffect(() => {
    if (selectedProject) {
      const projectFiles = (selectedProject.files as ProjectFile[]) || [];
      if (projectFiles.length === 0) {
        const defaultFile = { path: "main.js", content: "// Start coding here...\n", language: "javascript" };
        setFiles([defaultFile]);
        setEditorContent(defaultFile.content);
      } else {
        setFiles(projectFiles);
        setEditorContent(projectFiles[0]?.content || "");
      }
      setActiveFileIndex(0);
    }
  }, [selectedProject]);

  // ================= SAVE PROJECT =================
  const saveProjectMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProjectId) return;
      const updatedFiles = [...files];
      updatedFiles[activeFileIndex] = { ...updatedFiles[activeFileIndex], content: editorContent };
      
      const res = await fetch(`/api/projects/${selectedProjectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: updatedFiles }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project saved!");
    },
    onError: () => toast.error("Failed to save project"),
  });

  // ================= ADD FILE =================
  const addFile = () => {
    const fileName = prompt("Enter file name (e.g., utils.js):");
    if (!fileName) return;
    const ext = fileName.split('.').pop() || 'js';
    const langMap: Record<string, string> = { js: 'javascript', ts: 'typescript', py: 'python', json: 'json', css: 'css', html: 'html' };
    const newFile: ProjectFile = { path: fileName, content: "", language: langMap[ext] || 'plaintext' };
    setFiles([...files, newFile]);
    setActiveFileIndex(files.length);
    setEditorContent("");
  };

  // ================= DELETE FILE =================
  const deleteFile = (index: number) => {
    if (files.length <= 1) {
      toast.error("Cannot delete the last file");
      return;
    }
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    if (activeFileIndex >= newFiles.length) {
      setActiveFileIndex(newFiles.length - 1);
      setEditorContent(newFiles[newFiles.length - 1]?.content || "");
    } else if (activeFileIndex === index) {
      setEditorContent(newFiles[activeFileIndex]?.content || "");
    }
  };

  // ================= SWITCH FILE =================
  const switchFile = (index: number) => {
    const updatedFiles = [...files];
    updatedFiles[activeFileIndex] = { ...updatedFiles[activeFileIndex], content: editorContent };
    setFiles(updatedFiles);
    setActiveFileIndex(index);
    setEditorContent(files[index]?.content || "");
  };

  // ================= RUN CODE =================
  async function handleRunCode() {
    if (!selectedProjectId) return toast.error("Select a project first");
    await saveProjectMutation.mutateAsync();

    toast.loading("Running in sandbox...");
    const res = await fetch("/api/run-project", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        files,
        language: files[activeFileIndex].language,
      }),
    });
    const result = await res.json();
    toast.dismiss();
    toast.success("Run completed!");
    alert(`🚀 Output:\n${result.stdout || "No output"}\n\n⚠ Errors:\n${result.stderr || "None"}`);
  }

  // ================= AI HELP =================
  async function handleAIHelp() {
    toast.loading("Talking to VipuDevAI...");
    const res = await fetch("/api/assistant/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: `Review and improve this code:\n${editorContent}` }]
      }),
    });
    const { reply } = await res.json();
    toast.dismiss();
    alert("🤖 AI Suggestion:\n\n" + reply);
  }

  // ================= ZIP EXPORT =================
  async function handleZipExport() {
    const res = await fetch("/api/zip-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: editorContent,
        filename: files[activeFileIndex].path
      }),
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vipudevai-project.zip";
    a.click();
    a.remove();
    toast.success("ZIP exported!");
  }

  // ================= UI START =================
  if (!selectedProjectId) {
    return (
      <div className="glass-card p-8 h-full flex flex-col items-center justify-center animate-in fade-in duration-500">
        <FolderOpen className="w-16 h-16 text-lime-400/50 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Select a Project</h2>
        <p className="text-gray-400 text-sm mb-6">Choose a project to start editing</p>

        {loadingProjects ? (
          <Loader2 className="w-6 h-6 animate-spin text-lime-400" />
        ) : projectsData?.projects.length === 0 ? (
          <p className="text-gray-500 text-sm">No projects yet. Create one from the Dashboard.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 max-w-md">
            {projectsData?.projects.map((project) => (
              <button
                key={project.id}
                onClick={() => setSelectedProjectId(project.id)}
                className="p-4 rounded-lg bg-white/5 border border-lime-400/20 hover:border-lime-400/50 hover:bg-white/10 transition-all"
              >
                <div className="font-medium text-white">{project.name}</div>
                <div className="text-xs text-gray-500 mt-1">{(project.files as ProjectFile[]).length} files</div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ================= FULL PAGE =================
  return (
    <div className="glass-card flex flex-col h-full overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between p-4 border-b border-lime-400/10 bg-white/5">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedProjectId(null)} className="text-gray-400 hover:text-white transition">
            <FolderOpen className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-white">{selectedProject?.name}</h2>

          <button onClick={addFile} className="flex items-center gap-2 text-xs bg-lime-400/10 text-lime-400 px-3 py-1.5 rounded hover:bg-lime-400/20 border border-lime-400/20">
            <FilePlus className="w-3 h-3" /> New File
          </button>
        </div>

        <div className="flex gap-2">
          <button onClick={() => saveProjectMutation.mutate()} className="btn-primary">
            {saveProjectMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>

          <button onClick={handleRunCode} className="btn-run">
            <PlayCircle className="w-4 h-4" /> Run
          </button>

          <button onClick={handleAIHelp} className="btn-ai-help">
            <Bot className="w-4 h-4" /> Ask AI
          </button>

          <button onClick={handleZipExport} className="btn-zip">
            <Package className="w-4 h-4" /> ZIP
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-48 bg-black/20 border-r border-lime-400/10">
          <div className="p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Files</div>
          {files.map((file, index) => (
            <div key={file.path} className={`flex items-center justify-between px-4 py-2 text-sm cursor-pointer group ${activeFileIndex === index ? "bg-lime-400/10 text-lime-400 border-r-2 border-lime-400" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}>
              <div onClick={() => switchFile(index)} className="flex items-center gap-2 flex-1">
                <File className="w-4 h-4" />
                <span className="truncate">{file.path}</span>
              </div>
              <button onClick={() => deleteFile(index)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 p-1">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex-1">
          <Editor
            height="100%"
            language={files[activeFileIndex]?.language || "javascript"}
            value={editorContent}
            onChange={(value) => setEditorContent(value || "")}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'Fira Code', monospace",
              padding: { top: 20 },
              smoothScrolling: true,
            }}
          />
        </div>
      </div>
    </div>
  );
}
