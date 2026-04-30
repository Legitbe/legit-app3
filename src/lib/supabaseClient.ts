import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://shfqmtkhyaokukfqcmuu.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_MlH1WO89JkpdlEUxit8_1A_RMRvhKdY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export type MeasureSlide = {
  url: string;
  order: number;
};

export type MeasureStatus = "actu" | "mesure" | "proposition";

export interface Measure {
  id: string;
  creator_handle: string;
  creator_avatar_url: string | null;
  theme: string;
  status: MeasureStatus;
  slides: MeasureSlide[];
  has_barometer: boolean;
  published: boolean;
  created_at: string;
}