export type IssueStatus = 'next_up' | 'in_progress' | 'done';

export interface User {
  _id: string;
  username: string;
  email: string;
}

export interface WorkspaceMember {
  id: string;
  username: string;
}

export interface Organization {
  _id: string;
  title: string;
  description?: string;
  adminId: string;
  members: string[]; // Member IDs
}

export interface Board {
  _id: string;
  title: string;
  orgId: string;
}

export interface Issue {
  _id: string;
  title: string;
  boardId: string;
  status: IssueStatus;
}

// Auth DTOs
export interface SignupRequest {
  username: string;
  email: string;
  password: string;
}

export interface SignupResponse {
  id: string;
  message: string;
}

export interface SigninRequest {
  username: string;
  password: string;
}

export interface SigninResponse {
  message: string;
  data: {
    token: string;
  };
}

// Organization DTOs
export interface CreateOrgRequest {
  title: string;
  description?: string;
}

export interface CreateOrgResponse {
  message: string;
  organizationId: string;
}

export interface AddMemberRequest {
  organizationId: string;
  memberUserUsername: string;
}

export interface DeleteOrgRequest {
  organizationId: string;
}

export interface DeleteMemberRequest {
  organizationId: string;
  memberId: string;
}

// Board DTOs
export interface CreateBoardRequest {
  organizationId: string;
  title: string;
}

export interface CreateBoardResponse {
  message: string;
  boardId: string;
}

// Issue DTOs
export interface CreateIssueRequest {
  organizationId: string;
  boardId: string;
  title: string;
}

export interface UpdateIssueRequest {
  organizationId: string;
  boardId: string;
  issueId: string;
}

export interface DeleteIssueRequest {
  organizationId: string;
  boardId: string;
  issueId: string;
}

export interface ApiResponse<T> {
  message?: string;
  data?: T;
  success?: boolean;
}
