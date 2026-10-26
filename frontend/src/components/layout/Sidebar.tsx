import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Building2,
  Layout,
  Plus,
  Users,
  Trash2,
  ChevronRight,
  FolderKanban,
} from 'lucide-react';
import type { Organization, Board } from '../../types/api';
import { Button } from '../ui/Button';

interface SidebarProps {
  className?: string;
  organizations: Organization[];
  activeOrg: Organization | null;
  boards: Board[];
  onSelectOrg: (org: Organization) => void;
  onCreateOrg: () => void;
  onCreateBoard: () => void;
  onManageMembers: () => void;
  onDeleteOrg: (org: Organization) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  className,
  organizations,
  activeOrg,
  boards,
  onSelectOrg,
  onCreateOrg,
  onCreateBoard,
  onManageMembers,
  onDeleteOrg,
}) => {
  const location = useLocation();

  return (
    <aside className={`${className || ''} w-full md:w-64 shrink-0 glass-panel border-b md:border-b-0 md:border-r border-slate-800/80 p-3 md:p-4 flex flex-col h-auto max-h-56 md:max-h-none md:h-[calc(100vh-61px)] overflow-y-auto`}>
      {/* Organizations Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2.5 px-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Workspaces
          </span>
          <button
            onClick={onCreateOrg}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
            title="Create Workspace"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {organizations.length === 0 ? (
          <div className="px-3 py-4 rounded-xl border border-dashed border-slate-800 text-center">
            <Building2 className="w-6 h-6 text-slate-600 mx-auto mb-1.5" />
            <p className="text-xs text-slate-400 font-medium">No workspaces yet</p>
            <Button
              variant="outline"
              size="sm"
              onClick={onCreateOrg}
              className="mt-2 text-xs w-full py-1"
            >
              Create Workspace
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            {organizations.map((org) => {
              const isActive = activeOrg?._id === org._id;
              return (
                <button
                  key={org._id}
                  onClick={() => onSelectOrg(org)}
                  aria-pressed={isActive}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-left transition-colors duration-150 ${
                    isActive
                      ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Building2 className={`w-4 h-4 shrink-0 ${isActive ? 'text-brand-400' : 'text-slate-500'}`} />
                    <span className="truncate">{org.title}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-brand-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Organization Boards & Actions */}
      {activeOrg && (
        <div className="flex-1 flex flex-col border-t border-slate-800/80 pt-5">
          <div className="px-2 mb-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Boards
              </span>
              <button
                onClick={onCreateBoard}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                title="Create Board"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Boards List */}
          <div className="space-y-1 flex-1 overflow-y-auto mb-4">
            {boards.length === 0 ? (
              <div className="px-3 py-4 rounded-xl border border-dashed border-slate-800 text-center">
                <Layout className="w-6 h-6 text-slate-600 mx-auto mb-1.5" />
                <p className="text-xs text-slate-400">No boards created</p>
                <button
                  onClick={onCreateBoard}
                  className="text-xs text-brand-400 hover:underline mt-1 font-medium"
                >
                  + Add first board
                </button>
              </div>
            ) : (
              boards.map((board) => {
                const isCurrentBoard = location.pathname.includes(`/board/${board._id}`);
                return (
                  <Link
                    key={board._id}
                    to={`/org/${activeOrg._id}/board/${board._id}`}
                    aria-current={isCurrentBoard ? 'page' : undefined}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isCurrentBoard
                        ? 'bg-slate-800 text-white font-semibold border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <FolderKanban className={`w-4 h-4 shrink-0 ${isCurrentBoard ? 'text-brand-400' : 'text-slate-500'}`} />
                    <span className="truncate">{board.title}</span>
                  </Link>
                );
              })
            )}
          </div>

          {/* Workspace Settings / Management Footer */}
          <div className="border-t border-slate-800/80 pt-3 space-y-1">
            <button
              onClick={onManageMembers}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
            >
              <Users className="w-4 h-4 text-slate-500" />
              <span>Workspace Members</span>
            </button>
            <button
              onClick={() => onDeleteOrg(activeOrg)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-red-400/80 hover:text-red-300 hover:bg-red-950/30 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-400/80" />
              <span>Delete Workspace</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
