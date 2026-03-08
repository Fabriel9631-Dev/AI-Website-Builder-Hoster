/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, Download, LayoutGrid, Loader2, MessageSquare, Smartphone, Tablet, Monitor, Image as ImageIcon, Upload, Globe, Moon, Sun, Undo, Redo, History, BarChart2, Plus, Maximize, Minimize, Key } from 'lucide-react';
import { generateWebsiteCodeCollaborative, generateImage } from './services/geminiService';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

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
  const [hasApiKey, setHasApiKey] = useState(true);
  const [showHostModal, setShowHostModal] = useState(false);
  const [longThinking, setLongThinking] = useState(false);
  const [persona, setPersona] = useState('Professional');
  const [codeStyle, setCodeStyle] = useState('Clean');
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
        setHasApiKey(true);
      } else {
        setHasApiKey(false);
      }
    };
    checkApiKey();
  }, []);

  const handleSelectApiKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const addToHistory = (code: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(code);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleGenerate = async (isRefinement = false) => {
    setLoading(true);
    try {
      const code = await generateWebsiteCodeCollaborative(
        prompt,
        keywords,
        audience,
        longThinking,
        persona,
        codeStyle,
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

  const handleExportProject = () => {
    const projectData = {
      prompt,
      keywords,
      audience,
      persona,
      codeStyle,
      generatedWebsite,
      images,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(projectData)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project.awa';
    a.click();
  };

  const handleImportProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = JSON.parse(e.target?.result as string);
      setPrompt(data.prompt);
      setKeywords(data.keywords);
      setAudience(data.audience);
      setPersona(data.persona);
      setCodeStyle(data.codeStyle);
      setGeneratedWebsite(data.generatedWebsite);
      setImages(data.images);
    };
    reader.readAsText(file);
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
          {!hasApiKey && (
            <button onClick={handleSelectApiKey} className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 flex items-center gap-2">
              <Key className="w-4 h-4" />
              Select API Key
            </button>
          )}
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
          <button onClick={handleExportProject} disabled={!generatedWebsite} className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50">Export Project (.awa)</button>
          <label className="px-4 py-2 bg-zinc-600 text-white rounded-xl hover:bg-zinc-700 cursor-pointer">
            Import Project
            <input type="file" accept=".awa" onChange={handleImportProject} className="hidden" />
          </label>
          <button onClick={() => setShowHostModal(true)} disabled={!generatedWebsite} className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50"><Globe className="w-4 h-4 inline mr-2" />Host</button>
        </div>
      </header>

      <main className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-sm border border-zinc-200 space-y-4">
          <h2 className="text-lg font-semibold">Website Details</h2>
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full h-24 p-4 border border-zinc-300 rounded-xl bg-zinc-50 dark:bg-zinc-700" placeholder="Describe your website..." />
          <input type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)} className="w-full p-4 border border-zinc-300 rounded-xl bg-zinc-50 dark:bg-zinc-700" placeholder="Keywords..." />
          <input type="text" value={audience} onChange={(e) => setAudience(e.target.value)} className="w-full p-4 border border-zinc-300 rounded-xl bg-zinc-50 dark:bg-zinc-700" placeholder="Audience..." />
          <button onClick={() => handleGenerate(false)} disabled={loading || !hasApiKey} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Generate Website
          </button>

          <div className="pt-4 border-t border-zinc-200 space-y-4">
            <h3 className="text-md font-semibold">Refine Website</h3>
            <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} className="w-full h-24 p-4 border border-zinc-300 rounded-xl bg-zinc-50 dark:bg-zinc-700" placeholder="e.g., Make header larger..." />
            <button onClick={() => handleGenerate(true)} disabled={loading || !hasApiKey} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-100 text-indigo-900 rounded-xl hover:bg-indigo-200 disabled:opacity-50">
              <MessageSquare className="w-4 h-4" />
              Refine Website
            </button>
          </div>

          <div className="pt-4 border-t border-zinc-200 space-y-4">
            <h3 className="text-md font-semibold">AI Generation Config</h3>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={longThinking} onChange={(e) => setLongThinking(e.target.checked)} />
              Long Thinking (3x slower, better results)
            </label>
            <select value={persona} onChange={(e) => setPersona(e.target.value)} className="w-full p-2 border border-zinc-300 rounded-lg">
              <option>Professional</option>
              <option>Playful</option>
              <option>Minimalist</option>
            </select>
            <select value={codeStyle} onChange={(e) => setCodeStyle(e.target.value)} className="w-full p-2 border border-zinc-300 rounded-lg">
              <option>Clean</option>
              <option>Commented</option>
              <option>Compact</option>
            </select>
          </div>

          <div className="pt-4 border-t border-zinc-200 space-y-4">
            <h3 className="text-md font-semibold">AI Model Tools</h3>
            <button onClick={async () => {
              const explanation = await generateWebsiteCodeCollaborative("Explain this code: " + generatedWebsite, "", "", false, "Professional", "Clean");
              alert(explanation);
            }} disabled={!generatedWebsite} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-zinc-100 text-zinc-900 rounded-xl hover:bg-zinc-200 disabled:opacity-50">
              <MessageSquare className="w-4 h-4" />
              Explain My Code
            </button>
          </div>

          <div className="pt-4 border-t border-zinc-200 space-y-4">
            <h3 className="text-md font-semibold">Image Manager</h3>
            <input type="file" accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (e) => setImages([...images, e.target?.result as string]);
                reader.readAsDataURL(file);
              }
            }} />
            <div className="grid grid-cols-3 gap-2">
              {images.map((img, i) => (
                <img key={i} src={img} onClick={() => addComponent(`<img src="${img}" />`)} className="w-full h-16 object-cover rounded-lg cursor-pointer" />
              ))}
            </div>
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
      {showHostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Advanced Hosting Configuration</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 border rounded-xl">Custom Domain Setup</div>
              <div className="p-4 border rounded-xl">SSL Certificate Management</div>
              <div className="p-4 border rounded-xl">Performance Analytics</div>
              <div className="p-4 border rounded-xl">Deployment History</div>
              <div className="p-4 border rounded-xl">Environment Variables</div>
              <div className="p-4 border rounded-xl">CDN Caching Config</div>
            </div>
            <p className="mb-4 text-zinc-600 dark:text-zinc-300">
              These advanced features are placeholders. Configure them directly on your hosting provider (e.g., Netlify/Vercel).
            </p>
            <button onClick={() => setShowHostModal(false)} className="w-full px-4 py-2 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
