// =============================================================================
// FreelanceTracker :: Global Type Definitions
// =============================================================================

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id: string;
  user_id: string;
  client_name: string;
  amount: number;
  due_date: string; // ISO date string "YYYY-MM-DD"
  status: InvoiceStatus;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code?: string;
  status: number;
}

// API Response wrappers — discriminated unions for type-safe consumption
export type ApiSuccess<T> = { success: true; data: T };
export type ApiFailure = { success: false; error: ApiError };
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
