import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://shfqmtkhyaokukfqcmuu.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_MlH1WO89JkpdlEUxit8_1A_RMRvhKdY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export type MeasureSlide = {
  url: string;
  order: number;
};

export type MeasureStatus = "actu" | "mesure" | "proposition";

export type SimulatorConfig = {
  input: { label: string; unit: string; default: number; min: number; max: number; step: number };
  formula: { type: string; coefficient: number; direction: "negative" | "positive" };
  output: { unit: string; label_negative?: string; label_positive?: string };
  belgique: { budget: string; redistribution: string; angles_morts: string[] };
  confidence: number;
  source: string;
};

export interface Measure {
  id: string;
  creator_handle: string;
  creator_avatar_url: string | null;
  theme: string;
  status: MeasureStatus;
  slides: MeasureSlide[];
  has_barometer: boolean;
  has_simulator?: boolean;
  simulator_config?: SimulatorConfig | null;
  published: boolean;
  created_at: string;
}