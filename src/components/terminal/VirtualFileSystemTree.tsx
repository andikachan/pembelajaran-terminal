'use client';

import React, { useState } from 'react';
import { VFSNode } from '@/lib/types';
import { Folder, FolderOpen, FileText, ChevronRight, ChevronDown } from 'lucide-react';

interface FileTreeProps {
  root: VFSNode;
  currentPath: string;
}

export function VirtualFileSystemTree({ root, currentPath }: FileTreeProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-[#0B0D0F] border border-[#1F252C] font-mono text-xs">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-3 py-2 bg-[#101418] border-b border-[#1C2229] cursor-pointer select-none text-[#8B929B] hover:text-[#E6E6E6]"
      >
        <div className="flex items-center gap-2">
          {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-[#7CFF6B]" /> : <ChevronRight className="w-3.5 h-3.5" />}
          <span className="font-semibold text-white tracking-wider text-[11px] uppercase">
            VIRTUAL FILESYSTEM OBSERVER
          </span>
        </div>
        <span className="text-[10px] text-[#555B64] font-mono">
          CWD: {currentPath}
        </span>
      </div>

      {isOpen && (
        <div className="p-2.5 max-h-60 overflow-y-auto font-mono text-[11px] space-y-1">
          <TreeNode node={root} path="/" currentPath={currentPath} depth={0} />
        </div>
      )}
    </div>
  );
}

function TreeNode({
  node,
  path,
  currentPath,
  depth,
}: {
  node: VFSNode;
  path: string;
  currentPath: string;
  depth: number;
}) {
  const [expanded, setExpanded] = useState(depth <= 2);
  const isCurrentDir = currentPath === path || (path === '/' && currentPath === '/');
  const isDir = node.type === 'directory';

  const toggle = () => {
    if (isDir) setExpanded(!expanded);
  };

  const displayName = node.name === '' ? '/' : node.name;

  return (
    <div>
      <div
        onClick={toggle}
        style={{ paddingLeft: `${depth * 12}px` }}
        className={`flex items-center gap-1.5 py-0.5 px-1.5 rounded-sm cursor-pointer select-none transition-colors ${
          isCurrentDir
            ? 'bg-[#18261A] text-[#7CFF6B] font-bold'
            : 'text-[#8A9099] hover:text-white hover:bg-[#13171C]'
        }`}
      >
        {isDir ? (
          expanded ? (
            <FolderOpen className="w-3.5 h-3.5 text-[#FFC857] shrink-0" />
          ) : (
            <Folder className="w-3.5 h-3.5 text-[#FFC857]/70 shrink-0" />
          )
        ) : (
          <FileText className="w-3.5 h-3.5 text-[#73777D] shrink-0" />
        )}
        <span className="truncate">{displayName}</span>
        {isCurrentDir && (
          <span className="text-[9px] text-[#7CFF6B] border border-[#2F5433] px-1 py-0 ml-auto">
            active
          </span>
        )}
      </div>

      {isDir && expanded && node.children && (
        <div>
          {Object.keys(node.children)
            .sort()
            .map((childName) => {
              const childNode = node.children![childName];
              const childPath = path === '/' ? `/${childName}` : `${path}/${childName}`;
              return (
                <TreeNode
                  key={childName}
                  node={childNode}
                  path={childPath}
                  currentPath={currentPath}
                  depth={depth + 1}
                />
              );
            })}
        </div>
      )}
    </div>
  );
}
