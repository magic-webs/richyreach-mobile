export type ServiceOrderStatus = 'pending' | 'active' | 'completed' | 'cancelled' | 'declined';

export interface ServiceOrder {
  id: string;
  serviceId: string;
  serviceName: string;
  price: number;
  deliveryTime?: string | null;
  category?: string | null;
  deliverables?: string | string[] | null;
  notes?: string | null;
  status: ServiceOrderStatus;
  conceptUrl?: string | null;
  videoUrl?: string | null;
  createdAt: string;
  completedAt?: string | null;
  // Present when viewed by the brand (joined influencer info)
  influencer?: {
    userId?: string;
    avatar?: string | null;
    user?: { name?: string | null; image?: string | null };
  };
  // Present when viewed by the influencer (joined brand info)
  brand?: {
    userId?: string;
    logo?: string | null;
    companyName?: string | null;
    user?: { name?: string | null; image?: string | null };
  };
}
