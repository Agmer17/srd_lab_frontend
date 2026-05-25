import type { Order } from "./order";
import type { User } from "./user";

export interface ProjectMember {
    id: string;
    project_id: string;
    user: User;
    role: ProjectRole;
    is_owner: boolean;
    joined_at: string;
    left_at?: string | null;
}

export interface ProjectRole {
    id: string;
    role_name: string;
    created_at: string;
}

export interface ProjectProgress {
    id: string;
    project_id: string;
    member: ProjectMember;
    title: string;
    weight: number;
    is_completed: boolean;
    created_at: string;
}

export interface ProjectRevision {
    id: string;
    project_id: string;
    title: string;
    reason: string;
    status: string;
    created_at: string;
}

export interface Project {
    id: string;
    order_id: string;
    name: string;
    description: string | null;
    status: string;
    allowed_revision_count: number;
    project_members: ProjectMember[];
    progress: ProjectProgress[];
    project_revision?: ProjectRevision[];
    order?: Order | null;
    actual_start_date: string | null;
    end_date: string | null;
    created_at: string;
    updated_at: string;
}