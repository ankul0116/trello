import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { orgService } from '../services/orgService';
import { boardService } from '../services/boardService';
import type { Organization, Board, WorkspaceMember } from '../types/api';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import {
  Building2,
  FolderKanban,
  Plus,
  Users,
  AlertTriangle,
  UserPlus,
  Trash2,
  Loader2,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { orgId: routeOrgId } = useParams<{ orgId?: string }>();
  const navigate = useNavigate();

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeOrg, setActiveOrg] = useState<Organization | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBoardsLoading, setIsBoardsLoading] = useState(false);

  // Modals state
  const [isCreateOrgOpen, setIsCreateOrgOpen] = useState(false);
  const [newOrgTitle, setNewOrgTitle] = useState('');
  const [newOrgDesc, setNewOrgDesc] = useState('');
  const [orgError, setOrgError] = useState<string | null>(null);
  const [isOrgSubmitting, setIsOrgSubmitting] = useState(false);

  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [boardError, setBoardError] = useState<string | null>(null);
  const [isBoardSubmitting, setIsBoardSubmitting] = useState(false);

  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [newMemberUsername, setNewMemberUsername] = useState('');
  const [memberError, setMemberError] = useState<string | null>(null);
  const [memberSuccess, setMemberSuccess] = useState<string | null>(null);
  const [isMemberSubmitting, setIsMemberSubmitting] = useState(false);

  const [isDeleteOrgModalOpen, setIsDeleteOrgModalOpen] = useState(false);
  const [isDeletingOrg, setIsDeletingOrg] = useState(false);

  // Load organizations on mount
  const fetchOrganizations = async () => {
    try {
      setIsLoading(true);
      const orgs = await orgService.getOrganizations();
      setOrganizations(orgs);

      if (orgs.length > 0) {
        // Find matching org from route param or default to first
        const matched = routeOrgId ? orgs.find((o) => o._id === routeOrgId) : orgs[0];
        const selected = matched || orgs[0];
        setActiveOrg(selected);
      } else {
        setActiveOrg(null);
        setBoards([]);
      }
    } catch (err: any) {
      console.error('Failed to load organizations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  // Sync activeOrg with route changes
  useEffect(() => {
    if (routeOrgId && organizations.length > 0) {
      const found = organizations.find((o) => o._id === routeOrgId);
      if (found && found._id !== activeOrg?._id) {
        setActiveOrg(found);
      }
    }
  }, [routeOrgId, organizations]);

  // Load boards and members when activeOrg changes
  useEffect(() => {
    if (!activeOrg) {
      setBoards([]);
      setMembers([]);
      return;
    }

    const loadOrgData = async () => {
      setIsBoardsLoading(true);
      try {
        const [boardsData, membersData] = await Promise.all([
          boardService.getBoards(activeOrg._id),
          orgService.getMembers(activeOrg._id).catch(() => []),
        ]);
        setBoards(boardsData);
        setMembers(membersData);
      } catch (err: any) {
        console.error('Failed to load boards/members:', err);
      } finally {
        setIsBoardsLoading(false);
      }
    };

    loadOrgData();
  }, [activeOrg]);

  const handleSelectOrg = (org: Organization) => {
    setActiveOrg(org);
    navigate(`/org/${org._id}`);
  };

  // Handle Create Organization
  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgTitle.trim()) {
      setOrgError('Please enter a workspace title.');
      return;
    }

    setOrgError(null);
    setIsOrgSubmitting(true);
    try {
      const created = await orgService.createOrganization({
        title: newOrgTitle.trim(),
        description: newOrgDesc.trim() || undefined,
      });

      const newOrgObj: Organization = {
        _id: created.organizationId,
        title: newOrgTitle.trim(),
        description: newOrgDesc.trim(),
        adminId: '',
        members: [],
      };

      setOrganizations((prev) => [...prev, newOrgObj]);
      setActiveOrg(newOrgObj);
      setIsCreateOrgOpen(false);
      setNewOrgTitle('');
      setNewOrgDesc('');
      navigate(`/org/${created.organizationId}`);
    } catch (err: any) {
      setOrgError(err.message || 'Failed to create workspace.');
    } finally {
      setIsOrgSubmitting(false);
    }
  };

  // Handle Create Board
  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrg) return;

    if (newBoardTitle.trim().length < 3 || newBoardTitle.trim().length > 50) {
      setBoardError('Board title must be between 3 and 50 characters.');
      return;
    }

    setBoardError(null);
    setIsBoardSubmitting(true);
    try {
      const created = await boardService.createBoard(activeOrg._id, newBoardTitle.trim());
      const newBoardObj: Board = {
        _id: created.boardId,
        title: newBoardTitle.trim(),
        orgId: activeOrg._id,
      };

      setBoards((prev) => [...prev, newBoardObj]);
      setIsCreateBoardOpen(false);
      setNewBoardTitle('');
      navigate(`/org/${activeOrg._id}/board/${created.boardId}`);
    } catch (err: any) {
      setBoardError(err.message || 'Failed to create board.');
    } finally {
      setIsBoardSubmitting(false);
    }
  };

  // Handle Add Member
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrg || !newMemberUsername.trim()) return;

    setMemberError(null);
    setMemberSuccess(null);
    setIsMemberSubmitting(true);

    try {
      await orgService.addMember(activeOrg._id, newMemberUsername.trim());
      setMemberSuccess(`Successfully invited @${newMemberUsername.trim()} to this workspace.`);
      setNewMemberUsername('');
      const updatedMembers = await orgService.getMembers(activeOrg._id);
      setMembers(updatedMembers);
    } catch (err: any) {
      setMemberError(err.message || 'Failed to add member.');
    } finally {
      setIsMemberSubmitting(false);
    }
  };

  // Handle Remove Member
  const handleRemoveMember = async (memberId: string) => {
    if (!activeOrg) return;
    try {
      await orgService.removeMember(activeOrg._id, memberId);
      setMembers((prev) => prev.filter((member) => member.id !== memberId));
    } catch (err: any) {
      alert(err.message || 'Failed to remove member.');
    }
  };

  // Handle Delete Organization
  const handleDeleteOrg = async () => {
    if (!activeOrg) return;
    setIsDeletingOrg(true);
    try {
      await orgService.deleteOrganization(activeOrg._id);
      setIsDeleteOrgModalOpen(false);
      await fetchOrganizations();
    } catch (err: any) {
      alert(err.message || 'Failed to delete workspace.');
    } finally {
      setIsDeletingOrg(false);
    }
  };

  return (
    <div className="trial-ui min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar
        className="trial-navbar"
        organizations={organizations}
        activeOrgId={activeOrg?._id}
        onSelectOrg={(id) => {
          const org = organizations.find((o) => o._id === id);
          if (org) handleSelectOrg(org);
        }}
        onCreateOrgClick={() => setIsCreateOrgOpen(true)}
      />

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <Sidebar
          className="trial-sidebar"
          organizations={organizations}
          activeOrg={activeOrg}
          boards={boards}
          onSelectOrg={handleSelectOrg}
          onCreateOrg={() => setIsCreateOrgOpen(true)}
          onCreateBoard={() => setIsCreateBoardOpen(true)}
          onManageMembers={() => setIsMembersModalOpen(true)}
          onDeleteOrg={() => setIsDeleteOrgModalOpen(true)}
        />

        {/* Main Content Area */}
        <main className="trial-main min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
          <div className="trial-content max-w-6xl mx-auto">
            {isLoading ? (
              <div className="h-96 flex flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
                <p className="text-sm font-medium">Loading workspace...</p>
              </div>
            ) : !activeOrg ? (
              /* Zero Workspaces Empty State */
              <div className="glass-card rounded-2xl p-12 text-center max-w-xl mx-auto my-12 border border-slate-800 animate-slide-up">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600/30 to-indigo-500/30 border border-brand-500/40 flex items-center justify-center mx-auto mb-5">
                  <Building2 className="w-8 h-8 text-brand-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Create your first Workspace</h2>
                <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                  Workspaces house your project boards, sprint workflows, and team collaborators.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => setIsCreateOrgOpen(true)}
                >
                  Create Workspace
                </Button>
              </div>
            ) : (
              /* Active Workspace View */
              <div className="space-y-10 animate-fade-in">
                <section className="trial-hero">
                  <div className="trial-hero-copy">
                    <p className="trial-eyebrow">
                      <Sparkles className="h-3.5 w-3.5" />
                      YOUR PROJECT HQ <span> / </span> 01
                    </p>
                    <h1>
                      Make room
                      <br />
                      for <span>big ideas.</span>
                    </h1>
                    <p className="trial-hero-description">
                      Everything your team is building, together.
                    </p>
                    <div className="trial-workspace-tag">
                      <span className="trial-workspace-monogram">
                        {activeOrg.title.charAt(0).toUpperCase()}
                      </span>
                      <span>{activeOrg.title}</span>
                      <span className="trial-live-dot" />
                    </div>
                    <p className="trial-workspace-description">
                      {activeOrg.description || 'A space for the work that moves you forward.'}
                    </p>
                    <div className="trial-hero-actions">
                      <Button
                        variant="primary"
                        size="md"
                        leftIcon={<Plus className="w-4 h-4" />}
                        onClick={() => setIsCreateBoardOpen(true)}
                      >
                        Create a board
                      </Button>
                      <button
                        type="button"
                        onClick={() => setIsMembersModalOpen(true)}
                        className="trial-team-link"
                      >
                        <Users className="h-4 w-4" />
                        Meet the team
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="trial-orbit-card" aria-label="Workspace overview">
                    <div className="trial-orbit-heading">
                      <span>WORKSPACE SIGNAL</span>
                      <span className="trial-signal"><i /> ACTIVE</span>
                    </div>
                    <div className="trial-orbit-graphic" aria-hidden="true">
                      <span className="trial-orbit-ring trial-orbit-ring-one" />
                      <span className="trial-orbit-ring trial-orbit-ring-two" />
                      <span className="trial-orbit-core"><Sparkles /></span>
                      <span className="trial-orbit-node trial-orbit-node-one"><FolderKanban /></span>
                      <span className="trial-orbit-node trial-orbit-node-two"><Users /></span>
                      <span className="trial-orbit-node trial-orbit-node-three"><ArrowUpRight /></span>
                    </div>
                    <div className="trial-orbit-stats">
                      <div>
                        <span>BOARDS</span>
                        <strong>{boards.length.toString().padStart(2, '0')}</strong>
                      </div>
                      <div>
                        <span>TEAMMATES</span>
                        <strong>{members.length.toString().padStart(2, '0')}</strong>
                      </div>
                    </div>
                    <div className="trial-orbit-footer">
                      <span>Ideas in motion</span>
                      <span>↗</span>
                    </div>
                  </div>
                </section>

                <section className="trial-boards-section">
                  <div className="trial-section-heading">
                    <div>
                      <p className="trial-eyebrow">THE WORK, IN ORBIT</p>
                      <h2>Your boards<span>.</span></h2>
                    </div>
                    <span className="trial-board-count">
                      {boards.length.toString().padStart(2, '0')} <span>BOARDS</span>
                    </span>
                  </div>

                  {isBoardsLoading ? (
                    <div className="h-48 flex items-center justify-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
                    </div>
                  ) : (
                    <div className="trial-board-grid">
                      <button
                        onClick={() => setIsCreateBoardOpen(true)}
                        className="trial-create-card group"
                      >
                        <span className="trial-create-icon"><Plus /></span>
                        <span className="trial-create-copy">
                          <strong>Start something</strong>
                          <small>Make a new board</small>
                        </span>
                        <ArrowUpRight className="trial-create-arrow" />
                      </button>

                      {boards.map((board, index) => (
                        <Link
                          key={board._id}
                          to={`/org/${activeOrg._id}/board/${board._id}`}
                          className={`trial-board-card trial-board-card-${index % 4} group`}
                        >
                          <span className="trial-board-index">
                            BOARD / {String(index + 1).padStart(2, '0')}
                          </span>
                          <span className="trial-board-art" aria-hidden="true">
                            <span /><span /><span />
                          </span>
                          <span className="trial-board-card-bottom">
                            <span>
                              <small>PROJECT SPACE</small>
                              <strong>{board.title}</strong>
                            </span>
                            <span className="trial-board-open">
                              <ArrowUpRight />
                            </span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal: Create Workspace */}
      <Modal
        isOpen={isCreateOrgOpen}
        onClose={() => setIsCreateOrgOpen(false)}
        title="Create New Workspace"
        description="Workspaces let you organize team projects and boards."
      >
        <form onSubmit={handleCreateOrg} className="space-y-4">
          {orgError && (
            <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/30 text-red-300 text-xs">
              {orgError}
            </div>
          )}
          <Input
            label="Workspace Title"
            placeholder="e.g. Acme Product Engineering"
            value={newOrgTitle}
            onChange={(e) => setNewOrgTitle(e.target.value)}
            required
            autoFocus
          />
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-semibold text-slate-300 tracking-wide">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="What is this workspace for?"
              value={newOrgDesc}
              onChange={(e) => setNewOrgDesc(e.target.value)}
              className="w-full bg-slate-900 text-slate-100 text-sm rounded-lg border border-slate-700/80 px-3.5 py-2.5 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 resize-none placeholder:text-slate-500"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsCreateOrgOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isOrgSubmitting}>
              Create Workspace
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Create Board */}
      <Modal
        isOpen={isCreateBoardOpen}
        onClose={() => setIsCreateBoardOpen(false)}
        title="Create New Board"
        description={`Add a new Kanban board to ${activeOrg?.title || 'workspace'}.`}
      >
        <form onSubmit={handleCreateBoard} className="space-y-4">
          {boardError && (
            <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/30 text-red-300 text-xs">
              {boardError}
            </div>
          )}
          <Input
            label="Board Title"
            placeholder="e.g. Q4 Sprint Roadmap"
            value={newBoardTitle}
            onChange={(e) => setNewBoardTitle(e.target.value)}
            helperText="3 to 50 characters"
            required
            autoFocus
          />
          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsCreateBoardOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isBoardSubmitting}>
              Create Board
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Manage Members */}
      <Modal
        isOpen={isMembersModalOpen}
        onClose={() => {
          setIsMembersModalOpen(false);
          setMemberError(null);
          setMemberSuccess(null);
        }}
        title="Workspace Members"
        description={`Manage team access for ${activeOrg?.title}.`}
        maxWidth="lg"
      >
        <div className="space-y-6">
          {/* Invite form */}
          <form onSubmit={handleAddMember} className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Invite by Username
            </h4>
            {memberError && (
              <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/30 text-red-300 text-xs">
                {memberError}
              </div>
            )}
            {memberSuccess && (
              <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs">
                {memberSuccess}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Username (e.g. john_doe)"
                value={newMemberUsername}
                onChange={(e) => setNewMemberUsername(e.target.value)}
                required
              />
              <Button
                type="submit"
                variant="primary"
                isLoading={isMemberSubmitting}
                leftIcon={<UserPlus className="w-4 h-4" />}
                className="w-full sm:w-auto shrink-0"
              >
                Add Member
              </Button>
            </div>
          </form>

          {/* Members list */}
          <div className="border-t border-slate-800 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Existing Members ({members.length})
            </h4>
            {members.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No additional members added yet.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-400 font-bold">
                        {member.username.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-200 truncate max-w-xs">@{member.username}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-950/30 transition-colors"
                      aria-label={`Remove @${member.username}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Modal: Delete Workspace Confirmation */}
      <Modal
        isOpen={isDeleteOrgModalOpen}
        onClose={() => setIsDeleteOrgModalOpen(false)}
        title="Delete Workspace"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs text-red-200">
              <p className="font-semibold">This action cannot be undone.</p>
              <p className="mt-1 text-red-300/80">
                Deleting <strong>{activeOrg?.title}</strong> will permanently remove all associated
                boards, cards, and team permissions.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsDeleteOrgModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              isLoading={isDeletingOrg}
              onClick={handleDeleteOrg}
            >
              Delete Workspace
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
