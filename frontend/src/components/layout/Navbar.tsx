import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Kanban, LogOut, User as UserIcon, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import type { Organization } from '../../types/api';

interface NavbarProps {
  className?: string;
  organizations?: Organization[];
  activeOrgId?: string;
  onSelectOrg?: (orgId: string) => void;
  onCreateOrgClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  className,
  organizations = [],
  activeOrgId,
  onSelectOrg,
  onCreateOrgClick,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={`${className || ''} sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Kanban className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-white font-sans">
                Trello
              </span>
            </div>
          </Link>

          {/* Org Selector Dropdown */}
          {organizations.length > 0 && onSelectOrg && (
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Org:</span>
              <select
                aria-label="Switch workspace"
                value={activeOrgId || ''}
                onChange={(e) => onSelectOrg(e.target.value)}
                className="bg-slate-900 text-xs font-medium text-slate-200 border border-slate-700/80 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-500 transition-colors"
              >
                {organizations.map((org) => (
                  <option key={org._id} value={org._id}>
                    {org.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {onCreateOrgClick && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={onCreateOrgClick}
              className="hidden md:inline-flex"
            >
              New Workspace
            </Button>
          )}

          {/* User Profile info */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 text-xs font-semibold">
              {user?.username ? user.username.slice(0, 2).toUpperCase() : <UserIcon className="w-4 h-4" />}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-200 leading-tight">
                {user?.username || 'User'}
              </span>
              <span className="text-[10px] text-slate-400">Workspace Member</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-400 p-2"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
