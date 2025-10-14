export interface Ambassador {
  id: string;
  name: string;
  ref_code: string;
  points: number;
  total_clicks: number;
  total_sales: number;
  total_conversions: number;
  commission_earned: number;
  email: string | null;
  instagram_handle: string | null;
  created_at: string;
  last_activity: string;
  is_active: boolean;
}

export interface AmbassadorSale {
  id: string;
  ambassador_id: string;
  sale_type: string;
  amount: number;
  quantity: number;
  event_name: string | null;
  sale_date: string;
  commission: number;
  status: 'pending' | 'confirmed' | 'paid';
}

export interface AmbassadorLink {
  id: string;
  ambassador_id: string;
  link_url: string;
  platform: string;
  created_at: string;
  last_used: string | null;
  total_clicks: number;
  conversions: number;
}
