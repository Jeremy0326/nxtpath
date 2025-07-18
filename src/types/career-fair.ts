import { Company, Job } from './job';

export interface Booth {
    id: string;
    company: Company;
    jobs: Job[];
    label: string;
    booth_number?: string;
    x: number;
    y: number;
    width: number;
    height: number;
    created_at: string;
    updated_at: string;
    fair?: CareerFair;
}

export interface CareerFair {
    id: string;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    location: string;
    website?: string;
    is_registered?: boolean;
    university_name?: string;
    banner_image_url?: string;
    floor_plan_url?: string;
    grid_width: number;
    grid_height: number;
    host_university: {
        id: string;
        name: string;
        logo_url?: string;
    };
    booths: Booth[];
}

export interface PaginatedFairsResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: CareerFair[];
} 