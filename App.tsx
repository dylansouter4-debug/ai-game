import React, { useState, useCallback, useEffect } from 'react';
import { FileExplorer } from './components/FileExplorer';
import { ChatInterface } from './components/ChatInterface';
import { getInitialProjectStructure } from './utils/initialProject';
import { FileNode, ChatMessage, MessageRole } from './types';
import { generateC3Response } from './services/geminiService';

const App: React.FC = () => {
  const [files, setFiles] = useState<FileNode[]>(getInitialProjectStructure());
  const [selectedFileId, setSelectedFileId] = useState<string | null>('file-main-js');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Helper to find file by ID (recursive)
  const findFile = useCallback((nodes: FileNode[], id: string): FileNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findFile(node.children, id);
        if (found) return found;
      }
    }
    return null;
  }, []);

  // Helper to update file content (recursive)
  const updateFileContent = useCallback((nodes: FileNode[], id: string, newContent: string): FileNode[] => {
    return nodes.map(node => {
      if (node.id === id) {
        return { ...node, content: newContent };
      }
      if (node.children) {
        return { ...node, children: updateFileContent(node.children, id, newContent) };
      }
      return node;
    });
  }, []);

  // Helper to toggle folder (recursive)
  const toggleFolderState = useCallback((nodes: FileNode[], id: string): FileNode[] => {
    return nodes.map(node => {
      if (node.id === id) {
        return { ...node, isOpen: !node.isOpen };
      }
      if (node.children) {
        return { ...node, children: toggleFolderState(node.children, id) };
      }
      return node;
    });
  }, []);

  const selectedFile = selectedFileId ? findFile(files, selectedFileId) : null;

  const handleFileSelect = (node: FileNode) => {
    setSelectedFileId(node.id);
  };

  const handleToggleFolder = (node: FileNode) => {
    setFiles(prev => toggleFolderState(prev, node.id));
  };

  const handleSendMessage = async (text: string) => {
    // Add user message
    const userMsg: ChatMessage = { role: MessageRole.USER, text, timestamp: Date.now() };
    setChatMessages(prev => [...prev, userMsg]);
    setIsGenerating(true);

    if (selectedFile && selectedFile.type === 'file' && selectedFile.content) {
      // Send to Gemini with file context
      const aiResponseText = await generateC3Response(text, selectedFile.content, selectedFile.name);
      
      const modelMsg: ChatMessage = { role: MessageRole.MODEL, text: aiResponseText, timestamp: Date.now() };
      setChatMessages(prev => [...prev, modelMsg]);

      // Simple heuristic: If the AI response contains code blocks, we could auto-update.
      // For now, we just let the user copy/paste or we could add an "Apply" button feature later.
      // However, to make it "magical", if the response is PURE code, we might update it.
      // Let's rely on the user reading the chat for now to keep it safe, 
      // but if the prompt was "Replace the file with...", we might want to be bolder.
    } else {
      const modelMsg: ChatMessage = { 
        role: MessageRole.MODEL, 
        text: "Please select a file to edit so I can understand the context.", 
        timestamp: Date.now() 
      };
      setChatMessages(prev => [...prev, modelMsg]);
    }
    
    setIsGenerating(false);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (selectedFileId) {
      setFiles(prev => updateFileContent(prev, selectedFileId, e.target.value));
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-900 text-gray-100 font-sans">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-0'} bg-gray-800 border-r border-gray-700 transition-all duration-300 flex flex-col overflow-hidden`}>
        <div className="p-4 border-b border-gray-700 font-bold text-lg flex justify-between items-center">
          <span>Project Assets</span>
          <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-white md:hidden">
            &times;
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          <FileExplorer
            nodes={files}
            selectedFileId={selectedFileId}
            onSelect={handleFileSelect}
            onToggleFolder={handleToggleFolder}
          />
        </div>
        <div className="p-2 border-t border-gray-700 text-xs text-gray-500 text-center">
          Construct 3 Starter Project
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-14 bg-gray-800 border-b border-gray-700 flex items-center px-4 justify-between">
          <div className="flex items-center">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="mr-4 text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <h1 className="font-semibold text-lg truncate">
              {selectedFile ? selectedFile.name : 'Select a file'}
            </h1>
          </div>
          <div className="flex items-center space-x-3">
             <span className="text-xs text-gray-400 px-2 py-1 bg-gray-900 rounded border border-gray-700 hidden sm:block">
               Top-Down Shooter Template
             </span>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 relative bg-gray-900 overflow-hidden flex">
          {selectedFile && selectedFile.type === 'file' ? (
            <div className="flex-1 flex flex-col h-full relative">
                <div className="absolute top-0 left-0 w-8 h-full bg-gray-800 text-gray-500 text-right pr-2 pt-4 select-none text-sm font-mono leading-6 border-r border-gray-700">
                    {selectedFile.content?.split('\n').map((_, i) => (
                        <div key={i}>{i + 1}</div>
                    ))}
                </div>
                <textarea
                    className="flex-1 bg-gray-900 text-gray-200 p-4 pl-10 font-mono text-sm leading-6 resize-none focus:outline-none w-full h-full"
                    value={selectedFile.content || ''}
                    onChange={handleCodeChange}
                    spellCheck={false}
                />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
               <div className="text-center">
                 <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                 </svg>
                 <p>Select a file to view or edit code</p>
               </div>
            </div>
          )}
          
          {/* Chat Sidebar (Desktop: 30%, Mobile: absolute overlay if needed but using flex for simplicity now) */}
          <div className="w-80 md:w-96 border-l border-gray-700 hidden lg:block">
            <ChatInterface 
              messages={chatMessages} 
              onSendMessage={handleSendMessage} 
              isLoading={isGenerating} 
            />
          </div>
        </div>
      </div>
      
       {/* Mobile Chat Drawer Toggle could go here, for now using simple responsive logic */}
       <div className="lg:hidden absolute bottom-4 right-4 z-10">
         {/* Simple floating button for mobile chat would be here in a full production app */}
       </div>
    </div>
  );
};

export default App;
