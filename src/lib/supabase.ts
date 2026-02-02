import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function trackLead(data: {
  language: string;
  pestType: string | null;
  contactMethod: 'phone' | 'whatsapp' | 'form';
}) {
  try {
    const { error } = await supabase.from('leads').insert({
      language: data.language,
      pest_type: data.pestType,
      contact_method: data.contactMethod,
      user_agent: navigator.userAgent
    });

    if (error) {
      console.error('Error tracking lead:', error);
    }
  } catch (err) {
    console.error('Error tracking lead:', err);
  }
}
