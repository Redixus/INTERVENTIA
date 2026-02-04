/**
 * Interventia API - Google Apps Script Integration
 * Handles lead submission to Google Sheets via Apps Script Web App
 */

export interface LeadFormData {
  lang: 'FR' | 'NL';
  source: string;
  utm_source?: string;
  utm_campaign?: string;
  pest_category: string;
  pest_detail?: string;
  urgency: 'IMMEDIATE' | '48H' | 'INSPECTION';
  postal_code: string;
  city: string;
  description: string;
  contact_method: 'WHATSAPP' | 'CALL' | 'ONLINE';
  phone: string;
}

export interface LeadResponse {
  ok: boolean;
  lead_id?: string;
  folder_url?: string;
  priority_score?: number;
  file_urls?: string[];
  error?: string;
}

/**
 * Submit a lead to the Google Apps Script endpoint
 * @param formData - The lead form data to submit
 * @returns Promise with the API response
 */
export async function submitLead(formData: LeadFormData): Promise<LeadResponse> {
  const endpoint = import.meta.env.VITE_INTERVENTIA_ENDPOINT;

  console.log('🚀 submitLead called');
  console.log('📍 Endpoint:', endpoint);
  console.log('📦 Payload:', formData);

  if (!endpoint || endpoint.includes('YOUR_DEPLOYMENT_ID')) {
    throw new Error('VITE_INTERVENTIA_ENDPOINT is not configured. Please set it in your .env file.');
  }

  try {
    console.log('🌐 Sending POST request to Apps Script...');
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8',
      },
      body: JSON.stringify(formData),
    });
    console.log('✅ Fetch response status:', response.status);
    
    const responseText = await response.text();
    console.log('📄 Raw response:', responseText);
    
    let data: LeadResponse;
    try {
      data = JSON.parse(responseText);
      console.log('📦 Parsed response:', data);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.error('Raw response was:', responseText);
      throw new Error('Invalid JSON response from server');
    }

    if (!data.ok) {
      throw new Error(data.error || 'Server returned error');
    }
    
    return data;
  } catch (error) {
    console.error('Lead submission error:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your internet connection.');
    }
    
    throw new Error('Failed to submit lead. Please try again.');
  }
}

/**
 * Alternative implementation with CORS support (if Apps Script is configured for CORS)
 * Use this version if you configure your Apps Script to return proper CORS headers
 */
export async function submitLeadWithCORS(formData: LeadFormData): Promise<LeadResponse> {
  const endpoint = import.meta.env.VITE_INTERVENTIA_ENDPOINT;

  if (!endpoint || endpoint.includes('YOUR_DEPLOYMENT_ID')) {
    throw new Error('VITE_INTERVENTIA_ENDPOINT is not configured. Please set it in your .env file.');
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // Apps Script might return HTML on error
      const text = await response.text();
      console.error('Non-JSON response:', text);
      throw new Error('Invalid response format from server');
    }

    const data: LeadResponse = await response.json();

    if (!data.ok) {
      throw new Error(data.error || 'Submission failed');
    }

    return data;
  } catch (error) {
    console.error('Lead submission error:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your internet connection.');
    }
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Failed to submit lead. Please try again.');
  }
}

/**
 * Map onboarding form data to API format
 */
export function mapOnboardingToLead(data: {
  pest_category: string;
  urgency: string;
  postal_code: string;
  city: string;
  housing_type: string;
  description: string;
  contact_method: string;
  phone: string;
  name: string;
  language: string;
}): LeadFormData {
  // Map urgency values
  const urgencyMap: Record<string, 'IMMEDIATE' | '48H' | 'INSPECTION'> = {
    'immediate': 'IMMEDIATE',
    'today': 'IMMEDIATE',
    '48h': '48H',
    'week': 'INSPECTION',
  };

  // Map contact method
  const contactMap: Record<string, 'WHATSAPP' | 'CALL' | 'ONLINE'> = {
    'whatsapp': 'WHATSAPP',
    'phone': 'CALL',
    'email': 'ONLINE',
  };

  return {
    lang: data.language.toUpperCase() as 'FR' | 'NL',
    source: 'website',
    utm_source: new URLSearchParams(window.location.search).get('utm_source') || '',
    utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign') || '',
    pest_category: data.pest_category,
    pest_detail: data.housing_type,
    urgency: urgencyMap[data.urgency] || 'INSPECTION',
    postal_code: data.postal_code,
    city: data.city,
    description: `${data.description}\n\nNom: ${data.name}`,
    contact_method: contactMap[data.contact_method] || 'WHATSAPP',
    phone: data.phone,
  };
}
