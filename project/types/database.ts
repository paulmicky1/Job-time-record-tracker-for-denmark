export interface Job {
  id: string;
  user_id: string;
  name: string;
  hourly_rate: number;
  start_date: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkHour {
  id: string;
  user_id: string;
  job_id: string;
  date: string;
  hours_worked: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  language: 'da' | 'en';
  created_at: string;
  updated_at: string;
}