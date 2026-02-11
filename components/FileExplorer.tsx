import React from 'react';
import { FileNode } from '../types';

interface FileExplorerProps {
  nodes: FileNode[];
  selectedFileId: string | null;
  onSelect: (node: FileNode) => void;
  onToggleFolder: (node: FileNode) => void;
  level?: number;
}

const FileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
  </svg>
);

const FolderIcon = ({ isOpen }: { isOpen?: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 ${isOpen ? 'text-blue-400' : 'text-blue-500'}`} viewBox="0 0 20 20" fill="currentColor">
    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
  </svg>
);

export const FileExplorer: React.FC<FileExplorerProps> = ({ nodes, selectedFileId, onSelect, onToggleFolder, level = 0 }) => {
  return (
    <div className="select-none">
      {nodes.map((node) => (
        <div key={node.id}>
          <div
            className={`flex items-center px-4 py-1 cursor-pointer hover:bg-gray-800 transition-colors ${
              selectedFileId === node.id ? 'bg-gray-700 text-white' : 'text-gray-300'
            }`}
            style={{ paddingLeft: `${level * 1.5 + 1}rem` }}
            onClick={() => node.type === 'folder' ? onToggleFolder(node) : onSelect(node)}
          >
            {node.type === 'folder' ? (
              <FolderIcon isOpen={node.isOpen} />
            ) : (
              <FileIcon />
            )}
            <span className="text-sm truncate">{node.name}</span>
          </div>
          {node.type === 'folder' && node.isOpen && node.children && (
            <FileExplorer
              nodes={node.children}
              selectedFileId={selectedFileId}
              onSelect={onSelect}
              onToggleFolder={onToggleFolder}
              level={level + 1}
            />
          )}
        </div>
      ))}
    </div>
  );
};
