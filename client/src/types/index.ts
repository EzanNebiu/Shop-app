export interface Product {
  _id: string;
  emri: string;
  pershkrimi: string;
  cmimi: number;
  stoku: number;
  foto: string;
  kategoria?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  _id: string;
  emri: string;
  email: string;
  role: 'user' | 'admin';
  createdAt?: string;
  updatedAt?: string;
}

export interface Order {
  _id: string;
  perdoruesi_id: {
    _id: string;
    emri: string;
    email: string;
  };
  produkti_id: {
    _id: string;
    emri: string;
    foto?: string;
  };
  sasia: number;
  cmimi_total: number;
  status: 'pending' | 'completed' | 'cancelled';
  data_e_blerjes: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Analytics {
  summary: {
    totalProducts: number;
    totalUsers: number;
    totalOrders: number;
    totalRevenue: number;
  };
  ordersByStatus: Array<{
    _id: string;
    count: number;
  }>;
  recentOrders: Order[];
  topProducts: Array<{
    _id: string;
    totalSold: number;
    totalRevenue: number;
    product: Product;
  }>;
  salesOverTime: Array<{
    _id: string;
    totalOrders: number;
    totalRevenue: number;
  }>;
  lowStockProducts: Product[];
}

export interface AuthResponse {
  error: boolean;
  user?: User;
  token?: string;
  mesazhi?: string;
}

export interface ApiResponse<T = any> {
  error: boolean;
  mesazhi?: string;
  data?: T;
}
