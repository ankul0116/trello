import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { orgService } from '../services/orgService';
import { boardService } from '../services/boardService';
import { issueService } from '../services/issueService';
import type { Organization, Board, Issue, IssueStatus } from '../types/api';
import { Navbar } from '../components/layout/Navbar';
import { StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import {
  Plus,
  Trash2,
  ChevronRight,
  CheckCircle2,
  Clock,
  CircleDot,
  Loader2,
  FolderKanban,
  Building2,
} from 'lucide-react';

interface ColumnConfig {
  id: IssueStatus;
  title: string;
  icon: React.ReactNode;
  accentColor: string;
  badgeBg: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    id: 'next_up',
    title: 'Next Up',
    icon: <CircleDot className="w-4 h-4 text-indigo-400" />,
    accentColor: 'border-indigo-500/40',
    badgeBg: 'bg-indigo-950/80 text-indigo-300 border-indigo-500/30',
  },
  {
    id: 'in_progress',
    title: 'In Progress',
    icon: <Clock className="w-4 h-4 text-amber-400" />,
    accentColor: 'border-amber-500/40',
    badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-500/30',
  },
  {
    id: 'done',
    title: 'Done',
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    accentColor: 'border-emerald-500/40',
    badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30',
  },
];

export const BoardPage: React.FC = () => {
  const { orgId, boardId } = useParams<{ orgId: string; boardId: string }>();
  const navigate = useNavigate();

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [board, setBoard] = useState<Board | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [boardFeedback, setBoardFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Quick add card state
  const [quickTitle, setQuickTitle] = useState('');
  const [isQuickAdding, setIsQuickAdding] = useState(false);

  // New issue modal state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [isModalSubmitting, setIsModalSubmitting] = useState(false);
  const [updatingIssueId, setUpdatingIssueId] = useState<string | null>(null);

  // Card detail modal state
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Load board, org, and issues
  const loadData = async () => {
    if (!orgId || !boardId) return;
    try {
      setIsLoading(true);
      setLoadError(null);
      const [orgs, boardsData, issuesData] = await Promise.all([
        orgService.getOrganizations(),
        boardService.getBoards(orgId),
        issueService.getIssues(orgId, boardId),
      ]);

      const foundOrg = orgs.find((o) => o._id === orgId) || null;
      const foundBoard = boardsData.find((b) => b._id === boardId) || null;

      setOrganization(foundOrg);
      setBoard(foundBoard);
      setIssues(issuesData);
    } catch (err: any) {
      console.error('Failed to load board data:', err);
      setLoadError(err.message || 'Unable to load this board. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orgId, boardId]);

  // Group issues by column
  const issuesByStatus = useMemo(() => {
    const grouped: Record<IssueStatus, Issue[]> = {
      next_up: [],
      in_progress: [],
      done: [],
    };
    issues.forEach((issue) => {
      if (grouped[issue.status]) {
        grouped[issue.status].push(issue);
      } else {
        grouped['next_up'].push(issue);
      }
    });
    return grouped;
  }, [issues]);

  // Quick add issue
  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() || !orgId || !boardId) return;

    setBoardFeedback(null);
    setIsQuickAdding(true);
    try {
      await issueService.createIssue(orgId, boardId, quickTitle.trim());
      setQuickTitle('');
      const updated = await issueService.getIssues(orgId, boardId);
      setIssues(updated);
      setBoardFeedback({ type: 'success', message: 'Task created.' });
    } catch (err: any) {
      setBoardFeedback({ type: 'error', message: err.message || 'Failed to create task.' });
    } finally {
      setIsQuickAdding(false);
    }
  };

  // Modal create issue
  const handleModalCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !boardId) return;
    if (!modalTitle.trim()) {
      setModalError('Enter a task title before creating it.');
      return;
    }

    setModalError(null);
    setBoardFeedback(null);
    setIsModalSubmitting(true);
    try {
      await issueService.createIssue(orgId, boardId, modalTitle.trim());
      setIsNewModalOpen(false);
      setModalTitle('');
      const updated = await issueService.getIssues(orgId, boardId);
      setIssues(updated);
      setBoardFeedback({ type: 'success', message: 'Task created.' });
    } catch (err: any) {
      setModalError(err.message || 'Failed to create issue');
    } finally {
      setIsModalSubmitting(false);
    }
  };

  // Delete issue
  const handleDeleteIssue = async (issueId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!orgId || !boardId) return;

    try {
      await issueService.deleteIssue(orgId, boardId, issueId);
      setIssues((prev) => prev.filter((i) => i._id !== issueId));
      setBoardFeedback({ type: 'success', message: 'Task deleted.' });
      if (selectedIssue?._id === issueId) {
        setIsDetailModalOpen(false);
        setSelectedIssue(null);
      }
    } catch (err: any) {
      setBoardFeedback({ type: 'error', message: err.message || 'Failed to delete task.' });
    }
  };

  // Advance status from modal or card action
  const handleAdvanceStatus = async (issue: Issue, targetStatus: IssueStatus) => {
    if (!orgId || !boardId) return;
    setBoardFeedback(null);
    setUpdatingIssueId(issue._id);
    try {
      await issueService.syncIssueStatus(orgId, boardId, issue, targetStatus);
      const updated = await issueService.getIssues(orgId, boardId);
      setIssues(updated);
      if (selectedIssue?._id === issue._id) {
        setSelectedIssue({ ...issue, status: targetStatus });
      }
      setBoardFeedback({ type: 'success', message: 'Task status updated.' });
    } catch (err: any) {
      setBoardFeedback({ type: 'error', message: err.message || 'Failed to update task status.' });
    } finally {
      setUpdatingIssueId(null);
    }
  };

  return (
    <div className="trial-ui min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar className="trial-navbar" />

      {/* Subheader / Breadcrumbs */}
      <div className="trial-subheader glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Breadcrumb path */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <Link
              to="/"
              className="hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{organization?.title || 'Workspaces'}</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
              <FolderKanban className="w-3.5 h-3.5 text-brand-400" />
              <span>{board?.title || 'Board'}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(orgId ? `/org/${orgId}` : '/')}
            >
              Back to Workspace
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsNewModalOpen(true)}
            >
              New Issue
            </Button>
          </div>
        </div>
      </div>

      {/* Kanban Board Container */}
      <main className="trial-board-main flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full min-w-0 overflow-x-auto">
        {boardFeedback && (
          <div
            role={boardFeedback.type === 'error' ? 'alert' : 'status'}
            className={`mb-4 flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${
              boardFeedback.type === 'error'
                ? 'border-red-500/30 bg-red-950/50 text-red-200'
                : 'border-emerald-500/30 bg-emerald-950/40 text-emerald-200'
            }`}
          >
            <span>{boardFeedback.message}</span>
            <button
              type="button"
              onClick={() => setBoardFeedback(null)}
              className="shrink-0 rounded px-2 py-1 text-xs font-semibold hover:bg-white/10"
            >
              Dismiss
            </button>
          </div>
        )}
        {isLoading ? (
          <div className="h-96 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
            <p className="text-sm font-medium">Loading Kanban board...</p>
          </div>
        ) : loadError ? (
          <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-center">
            <p role="alert" className="text-sm text-red-300">{loadError}</p>
            <Button variant="outline" onClick={loadData}>Try again</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {COLUMNS.map((column) => {
              const columnIssues = issuesByStatus[column.id] || [];

              return (
                <div
                  key={column.id}
                  className={`trial-board-column trial-board-column-${column.id} flex flex-col bg-slate-900/60 rounded-xl border border-slate-800 p-3 sm:p-4 min-h-[240px] md:min-h-[600px]`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      {column.icon}
                      <h3 className="font-bold text-sm text-slate-200 tracking-tight">
                        {column.title}
                      </h3>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60">
                      {columnIssues.length}
                    </span>
                  </div>

                  {/* Quick Add for Next Up column */}
                  {column.id === 'next_up' && (
                    <form onSubmit={handleQuickAdd} className="mb-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          aria-label="Add a task to Next Up"
                          placeholder="+ Quick add issue..."
                          value={quickTitle}
                          maxLength={200}
                          onChange={(e) => setQuickTitle(e.target.value)}
                          className="w-full min-w-0 bg-slate-950/80 text-xs text-slate-200 placeholder:text-slate-500 rounded-lg px-3 py-2 border border-slate-700/80 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
                        />
                        <Button
                          type="submit"
                          variant="primary"
                          size="sm"
                          isLoading={isQuickAdding}
                          disabled={!quickTitle.trim()}
                          className="px-2.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </form>
                  )}

                  <div className="flex-1 space-y-3 p-1 rounded-xl min-h-[300px]">
                    {columnIssues.map((issue) => (
                      <div
                        key={issue._id}
                        className="trial-issue-card glass-card p-4 rounded-xl border border-slate-700/60 shadow-md group transition-all hover:border-brand-500/50 hover:bg-slate-800/80"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedIssue(issue);
                              setIsDetailModalOpen(true);
                            }}
                            className="flex min-w-0 items-start gap-1 rounded text-left text-sm font-semibold text-slate-100 leading-snug group-hover:text-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                          >
                            {issue.title}
                          </button>
                          <button
                            onClick={(e) => handleDeleteIssue(issue._id, e)}
                            aria-label={`Delete task: ${issue.title}`}
                            className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 p-1 text-slate-400 hover:text-red-300 hover:bg-red-950/30 rounded transition-opacity shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                          <StatusBadge status={issue.status} size="sm" />
                          <span className="text-[10px] text-slate-500 font-mono">
                            #{issue._id.slice(-4)}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-3">
                          {COLUMNS.filter((target) => target.id !== issue.status).map(
                            (target) => (
                              <Button
                                key={target.id}
                                size="sm"
                                variant="outline"
                                disabled={updatingIssueId === issue._id}
                                className="flex-1"
                                onClick={() => handleAdvanceStatus(issue, target.id)}
                              >
                                Move to {target.title}
                              </Button>
                            )
                          )}
                        </div>
                      </div>
                    ))}

                    {columnIssues.length === 0 && (
                      <div className="h-32 flex flex-col items-center justify-center text-center text-slate-400 border border-dashed border-slate-700 rounded-lg p-4">
                        <p className="text-xs font-medium">No tasks in this column</p>
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          {column.id === 'next_up' ? 'Add a task above to get started.' : 'Move a task here when its status changes.'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal: Create New Issue */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Create New Issue"
        description={`Add a new task card to ${board?.title || 'board'}.`}
      >
        <form onSubmit={handleModalCreate} className="space-y-4">
          {modalError && (
            <div role="alert" className="p-3 rounded-lg bg-red-950/60 border border-red-500/30 text-red-300 text-xs">
              {modalError}
            </div>
          )}
          <div className="flex flex-col gap-1.5 text-left">
            <label htmlFor="new-issue-title" className="text-xs font-semibold text-slate-300 tracking-wide">
              Issue Title / Task Description
            </label>
            <textarea
              id="new-issue-title"
              rows={3}
              placeholder="e.g. Implement user profile avatar upload"
              value={modalTitle}
              maxLength={200}
              onChange={(e) => setModalTitle(e.target.value)}
              className="w-full bg-slate-900 text-slate-100 text-sm rounded-lg border border-slate-700/80 px-3.5 py-2.5 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 resize-none placeholder:text-slate-500"
              required
              autoFocus
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsNewModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isModalSubmitting}>
              Create Issue
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Card Details & Status Management */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedIssue(null);
        }}
        title="Issue Details"
      >
        {selectedIssue && (
          <div className="space-y-5">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                Task Title
              </span>
              <p className="text-base font-semibold text-white mt-1 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                {selectedIssue.title}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[10px] uppercase font-bold text-slate-400">Current Status</span>
                <div className="mt-1.5">
                  <StatusBadge status={selectedIssue.status} size="md" />
                </div>
              </div>
              <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                <span className="text-[10px] uppercase font-bold text-slate-400">Card ID</span>
                <p className="font-mono text-xs text-slate-300 mt-1 truncate">
                  {selectedIssue._id}
                </p>
              </div>
            </div>

            {/* Status Transition Actions */}
            <div className="border-t border-slate-800 pt-4">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block mb-2.5">
                Change Status
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedIssue.status !== 'next_up' && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={updatingIssueId === selectedIssue._id}
                    onClick={() => handleAdvanceStatus(selectedIssue, 'next_up')}
                  >
                    Move to Next Up
                  </Button>
                )}
                {selectedIssue.status !== 'in_progress' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={updatingIssueId === selectedIssue._id}
                    onClick={() => handleAdvanceStatus(selectedIssue, 'in_progress')}
                  >
                    Move to In Progress
                  </Button>
                )}
                {selectedIssue.status !== 'done' && (
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={updatingIssueId === selectedIssue._id}
                    onClick={() => handleAdvanceStatus(selectedIssue, 'done')}
                  >
                    Mark as Done
                  </Button>
                )}
              </div>
            </div>

            {/* Delete button */}
            <div className="border-t border-slate-800 pt-4 flex justify-between items-center">
              <Button
                variant="danger"
                size="sm"
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                onClick={() => handleDeleteIssue(selectedIssue._id)}
              >
                Delete Issue
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDetailModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
