import { apiClient } from './apiClient';
import type { Issue, IssueStatus } from '../types/api';

export const issueService = {
  async getIssues(organizationId: string, boardId: string): Promise<Issue[]> {
    try {
      const res = await apiClient.get<{ message: string; data: Issue[] }>('/issue', {
        params: { organizationId, boardId },
        data: { organizationId, boardId },
      });
      return res.data?.data || [];
    } catch (error: any) {
      if (error.message?.includes('not found') || error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },

  async createIssue(organizationId: string, boardId: string, title: string): Promise<void> {
    await apiClient.post('/issue', {
      organizationId,
      boardId,
      title,
    });
  },

  async advanceIssueStatus(organizationId: string, boardId: string, issueId: string): Promise<Issue> {
    const res = await apiClient.put<{ message: string; issue: Issue }>('/issue', {
      organizationId,
      boardId,
      issueId,
    });
    return res.data.issue;
  },

  async syncIssueStatus(
    organizationId: string,
    boardId: string,
    issue: Issue,
    targetStatus: IssueStatus
  ): Promise<void> {
    if (issue.status === targetStatus) return;

    // Transition from next_up -> in_progress (1 step)
    if (issue.status === 'next_up' && targetStatus === 'in_progress') {
      await this.advanceIssueStatus(organizationId, boardId, issue._id);
      return;
    }

    // Transition from next_up -> done (2 steps)
    if (issue.status === 'next_up' && targetStatus === 'done') {
      await this.advanceIssueStatus(organizationId, boardId, issue._id);
      await this.advanceIssueStatus(organizationId, boardId, issue._id);
      return;
    }

    // Transition from in_progress -> done (1 step)
    if (issue.status === 'in_progress' && targetStatus === 'done') {
      await this.advanceIssueStatus(organizationId, boardId, issue._id);
      return;
    }

    // Moving backwards (e.g. done -> in_progress, done -> next_up, in_progress -> next_up):
    // Because backend status progression is strictly forward, we recreate and transition to target
    if (
      (issue.status === 'done' && (targetStatus === 'in_progress' || targetStatus === 'next_up')) ||
      (issue.status === 'in_progress' && targetStatus === 'next_up')
    ) {
      // Delete existing and re-create
      await this.deleteIssue(organizationId, boardId, issue._id);
      await this.createIssue(organizationId, boardId, issue.title);
      
      // If target was in_progress, advance the newly created issue (which starts at next_up)
      if (targetStatus === 'in_progress') {
        const issues = await this.getIssues(organizationId, boardId);
        const newlyCreated = issues.find(i => i.title === issue.title && i.status === 'next_up');
        if (newlyCreated) {
          await this.advanceIssueStatus(organizationId, boardId, newlyCreated._id);
        }
      }
    }
  },

  async deleteIssue(organizationId: string, boardId: string, issueId: string): Promise<void> {
    await apiClient.delete('/issue', {
      data: { organizationId, boardId, issueId },
    });
  },
};
