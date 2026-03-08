/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Sparkles, Download, LayoutGrid, Loader2, MessageSquare, Smartphone, Tablet, Monitor, Image as ImageIcon, Upload, Globe, Moon, Sun, Undo, Redo, History, BarChart2, Plus, Maximize, Minimize } from 'lucide-react';
import { generateWebsiteCode, generateImage } from './services/geminiService';

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [keywords, setKeywords] = useState('');
  const [audience, setAudience] = useState('');
  const [feedback, setFeedback] = useState('');
  const [generatedWebsite, setGeneratedWebsite] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewSize, setPreviewSize] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [imagePrompt, setImagePrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const addToHistory = (code: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(code);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleGenerate = async (isRefinement = false) => {
    setLoading(true);
    try {
      const code = await generateWebsiteCode(
        prompt,
        keywords,
        audience,
        isRefinement ? feedback : undefined,
        isRefinement ? generatedWebsite || undefined : undefined
      );
      setGeneratedWebsite(code);
      addToHistory(code);
    } catch (error) {
      console.error("Failed to generate website:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setGeneratedWebsite(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setGeneratedWebsite(history[historyIndex + 1]);
    }
  };

  const seoScore = generatedWebsite ? keywords.split(',').filter(k => generatedWebsite.toLowerCase().includes(k.trim().toLowerCase())).length : 0;

  const addComponent = (component: string) => {
    const newCode = (generatedWebsite || '') + component;
    setGeneratedWebsite(newCode);
    addToHistory(newCode);
  };

  const handleGenerateImage = async () => {
    setLoading(true);
    try {
      const imageUrl = await generateImage(imagePrompt);
      setGeneratedImage(imageUrl);
    } catch (error) {
      console.error("Failed to generate image:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (format: 'html' | 'json') => {
    if (!generatedWebsite) return;
    let content = generatedWebsite;
    let type = 'text/html';
    let filename = 'website.html';

    if (format === 'json') {
      content = JSON.stringify({ prompt, keywords, audience, code: generatedWebsite });
      type = 'application/json';
      filename = 'website.json';
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const previewWidth = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px'
  }[previewSize];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-zinc-900 text-white' : 'bg-zinc-50 text-zinc-900'} p-6`}>
      {isFullScreen && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-zinc-900 p-4 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Full Screen Preview</h2>
            <button onClick={() => setIsFullScreen(false)} className="p-2 rounded-lg bg-zinc-200 dark:bg-zinc-700"><Minimize className="w-5 h-5" /></button>
          </div>
          <div className={darkMode ? 'dark' : ''} dangerouslySetInnerHTML={{ __html: generatedWebsite || '' }} />
        </div>
      )}
      <header className="flex items-center justify-between pb-6 border-b border-zinc-200">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <LayoutGrid className="w-8 h-8 text-indigo-600" />
          AI Website Architect
        </h1>
        <div className="flex gap-2">
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-xl bg-zinc-200 dark:bg-zinc-700">{darkMode ? <Sun /> : <Moon />}</button>
          <label className="px-4 py-2 bg-zinc-600 text-white rounded-xl hover:bg-zinc-700 cursor-pointer">
            <Upload className="w-4 h-4 inline mr-2" />
            Import
            <input type="file" accept=".json" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                  const data = JSON.parse(e.target?.result as string);
                  setPrompt(data.prompt);
                  setKeywords(data.keywords);
                  setAudience(data.audience);
                  setGeneratedWebsite(data.code);
                  addToHistory(data.code);
                };
                reader.readAsText(file);
              }
            }} />
          </label>
          <button onClick={() => handleDownload('html')} disabled={!generatedWebsite} className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50">Export HTML</button>
          <button onClick={() => handleDownload('json')} disabled={!generatedWebsite} className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50">Export Project</button>
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"><Globe className="w-4 h-4 inline mr-2" />Host</button>
        </div>
      </header>

      <main className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm border border-zinc-200 space-y-4">
          <h2 className="text-lg font-semibold">Website Details</h2>
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full h-24 p-4 border border-zinc-300 rounded-xl bg-zinc-50 dark:bg-zinc-700" placeholder="Describe your website..." />
          <input type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)} className="w-full p-4 border border-zinc-300 rounded-xl bg-zinc-50 dark:bg-zinc-700" placeholder="Keywords..." />
          <input type="text" value={audience} onChange={(e) => setAudience(e.target.value)} className="w-full p-4 border border-zinc-300 rounded-xl bg-zinc-50 dark:bg-zinc-700" placeholder="Audience..." />
          <button onClick={() => handleGenerate(false)} disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Generate Website
          </button>

          <div className="pt-4 border-t border-zinc-200 space-y-4">
            <h3 className="text-md font-semibold">Refine Website</h3>
            <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} className="w-full h-24 p-4 border border-zinc-300 rounded-xl bg-zinc-50 dark:bg-zinc-700" placeholder="e.g., Make header larger..." />
            <button onClick={() => handleGenerate(true)} disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-100 text-indigo-900 rounded-xl hover:bg-indigo-200 disabled:opacity-50">
              <MessageSquare className="w-4 h-4" />
              Refine Website
            </button>
          </div>

          <div className="pt-4 border-t border-zinc-200 space-y-4">
            <h3 className="text-md font-semibold">Component Library</h3>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => addComponent('<section class="p-10"><h2>New Section</h2></section>')} className="p-2 bg-zinc-100 rounded-lg text-sm flex items-center gap-1"><Plus className="w-4 h-4" /> Section</button>
              <button onClick={() => addComponent('<button class="px-4 py-2 bg-blue-500 text-white rounded">Button</button>')} className="p-2 bg-zinc-100 rounded-lg text-sm flex items-center gap-1"><Plus className="w-4 h-4" /> Button</button>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-200 space-y-4">
            <h3 className="text-md font-semibold">AI Image Generator</h3>
            <input type="text" value={imagePrompt} onChange={(e) => setImagePrompt(e.target.value)} className="w-full p-4 border border-zinc-300 rounded-xl bg-zinc-50 dark:bg-zinc-700" placeholder="Image prompt..." />
            <button onClick={handleGenerateImage} disabled={loading} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-100 text-emerald-900 rounded-xl hover:bg-emerald-200 disabled:opacity-50">
              <ImageIcon className="w-4 h-4" />
              Generate Image
            </button>
            {generatedImage && <img src={generatedImage} alt="Generated" className="w-full rounded-xl" />}
          </div>
        </div>

        <div className="lg:col-span-3 bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm border border-zinc-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Preview</h2>
            <div className="flex gap-2">
              <button onClick={handleUndo} className="p-2 rounded-lg bg-zinc-100"><Undo className="w-5 h-5" /></button>
              <button onClick={handleRedo} className="p-2 rounded-lg bg-zinc-100"><Redo className="w-5 h-5" /></button>
              <button onClick={() => setIsFullScreen(true)} className="p-2 rounded-lg bg-zinc-100"><Maximize className="w-5 h-5" /></button>
              <div className="flex gap-2 border-l pl-2">
                <button onClick={() => setPreviewSize('desktop')} className={`p-2 rounded-lg ${previewSize === 'desktop' ? 'bg-zinc-200' : ''}`}><Monitor className="w-5 h-5" /></button>
                <button onClick={() => setPreviewSize('tablet')} className={`p-2 rounded-lg ${previewSize === 'tablet' ? 'bg-zinc-200' : ''}`}><Tablet className="w-5 h-5" /></button>
                <button onClick={() => setPreviewSize('mobile')} className={`p-2 rounded-lg ${previewSize === 'mobile' ? 'bg-zinc-200' : ''}`}><Smartphone className="w-5 h-5" /></button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 mb-4 text-sm text-zinc-500">
            <span className="flex items-center gap-1"><BarChart2 className="w-4 h-4" /> SEO Score: {seoScore}/10</span>
            <span className="flex items-center gap-1"><History className="w-4 h-4" /> Version: {historyIndex + 1}</span>
          </div>
          <div className="border border-zinc-200 rounded-xl p-4 overflow-hidden" style={{ width: previewWidth, margin: '0 auto', transition: 'width 0.3s' }}>
            {generatedWebsite ? (
              <div className={darkMode ? 'dark' : ''} dangerouslySetInnerHTML={{ __html: generatedWebsite }} />
            ) : (
              <div className="flex items-center justify-center h-[600px] text-zinc-500">Your website will appear here after generation.</div>
            )}
          </div>
          <div className="mt-6">
            <h3 className="text-md font-semibold mb-2">Manual Editor (Code)</h3>
            <textarea value={generatedWebsite || ''} onChange={(e) => { setGeneratedWebsite(e.target.value); addToHistory(e.target.value); }} className="w-full h-64 p-4 border border-zinc-300 rounded-xl font-mono text-sm bg-zinc-50 dark:bg-zinc-700" />
          </div>
        </div>
      </main>
    </div>
  );
}
