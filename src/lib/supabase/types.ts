import type { RingConfig } from "@/lib/ring-options";

/** Row shapes mirroring supabase/migrations. Hand-written (small surface). */

export type LeadStage =
  | "new"
  | "contacted"
  | "qualified"
  | "quoted"
  | "won"
  | "lost";

/** 'atelier' is historical — atelier visitors now arrive as 'craft' promotions. */
export type LeadSource = "atelier" | "inquiry" | "manual" | "craft" | "ai";

export interface Lead {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  phone: string;
  email: string | null;
  source: LeadSource;
  stage: LeadStage;
  sort_index: number;
  config: RingConfig | null;
  estimated_price: number | null;
  note: string | null;
  inquiry_id: string | null;
  craft_request_id: string | null;
  /** Set when the concierge opened this lead from a chat. */
  ai_conversation_id: string | null;
  archived: boolean;
}

export type InquiryStatus = "new" | "read" | "archived";

export interface Inquiry {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  interest: string | null;
  message: string;
  source_piece: string | null;
  status: InquiryStatus;
  promoted_lead_id: string | null;
}

/** Atelier (bespoke design) submissions — the Crafting inbox. */
export type CraftRequestStatus = "new" | "read" | "archived";

export interface CraftRequest {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  phone: string;
  email: string | null;
  config: RingConfig | null;
  estimated_price: number | null;
  status: CraftRequestStatus;
  note: string | null;
  promoted_lead_id: string | null;
  ip_hash: string | null;
  user_agent: string | null;
}

export type NoteColor = "sapphire" | "amber" | "emerald" | "rose" | "slate";

export interface Note {
  id: string;
  created_at: string;
  updated_at: string;
  body: string;
  color: NoteColor;
  pinned: boolean;
  author: string | null;
}

export interface Generation {
  id: string;
  created_at: string;
  lead_id: string | null;
  craft_request_id: string | null;
  config: RingConfig;
  estimated_price: number | null;
  prompt: string | null;
  image_path: string | null;
  image_mime: string | null;
  status: "done" | "failed";
  ip_hash: string | null;
  user_agent: string | null;
}

/* ------------------------------------------------------ ai concierge */

export type AiConversationStatus = "new" | "read" | "archived";

/** One visitor session with the AI concierge — the AI Inbox. */
export interface AiConversation {
  id: string;
  created_at: string;
  updated_at: string;
  session_id: string;
  visitor_name: string | null;
  visitor_phone: string | null;
  visitor_email: string | null;
  /** The agent's own one-line reason for capturing them. */
  qualification: string | null;
  lead_id: string | null;
  status: AiConversationStatus;
  message_count: number;
  last_message_at: string | null;
  page_path: string | null;
  ip_hash: string | null;
  user_agent: string | null;
}

export interface AiMessage {
  id: string;
  created_at: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
}

/** A conversation with its transcript, oldest message first. */
export interface AiConversationWithMessages extends AiConversation {
  messages: AiMessage[];
}

/* ------------------------------------------------------------- e-commerce */

export interface ProductCategory {
  id: string;
  created_at: string;
  updated_at: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  sort_index: number;
  active: boolean;
}

export type ProductStatus = "draft" | "active" | "archived";

export interface Product {
  id: string;
  created_at: string;
  updated_at: string;
  slug: string;
  title: string;
  description: string;
  price: number | null;
  currency: string;
  category_id: string | null;
  status: ProductStatus;
  featured: boolean;
  in_stock: boolean;
  sort_index: number;
}

export interface ProductImage {
  id: string;
  created_at: string;
  product_id: string;
  /** Object path inside the public `product-images` bucket. */
  path: string;
  position: number;
  alt: string | null;
}

/** A product joined with its gallery (ordered) and its category. */
export interface ProductWithImages extends Product {
  images: ProductImage[];
  category: Pick<ProductCategory, "id" | "slug" | "name"> | null;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "out_for_delivery"
  | "completed"
  | "cancelled";

export type PaymentStatus = "unpaid" | "paid" | "refunded";

/** One transactional email we sent (or tried to send) about an order. */
export type OrderEmailKind =
  | "placed"
  | "confirmed"
  | "shipped"
  | "out_for_delivery"
  | "completed"
  | "cancelled";

export interface OrderEmail {
  id: string;
  created_at: string;
  order_id: string;
  kind: OrderEmailKind;
  to_email: string;
  subject: string;
  status: "sent" | "failed";
  provider_id: string | null;
  error: string | null;
}

export interface Order {
  id: string;
  created_at: string;
  updated_at: string;
  order_number: string;
  customer_name: string;
  email: string;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  note: string | null;
  admin_note: string | null;
  currency: string;
  subtotal: number;
  total: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  courier: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  ip_hash: string | null;
  user_agent: string | null;
}

export interface OrderItem {
  id: string;
  created_at: string;
  order_id: string;
  product_id: string | null;
  title: string;
  slug: string | null;
  unit_price: number | null;
  quantity: number;
  line_total: number | null;
  image_path: string | null;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
  /** Everything we have told this customer, newest first. */
  emails: OrderEmail[];
}
