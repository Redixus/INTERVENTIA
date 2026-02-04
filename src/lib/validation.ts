/**
 * Belgian-focused validation utilities for Interventia onboarding
 * Includes phone normalization, postal code validation, and anti-spam checks
 */

// ============================================
// BELGIAN PHONE VALIDATION & NORMALIZATION
// ============================================

/**
 * Normalizes a Belgian phone number to E.164 format (+32...)
 * Accepts: 04xxxxxxxx, +324xxxxxxxx, 00324xxxxxxxx, 0470 12 34 56
 * Returns: { valid: boolean, normalized: string, display: string }
 */
export function normalizeBelgianPhone(input: string): { 
  valid: boolean; 
  normalized: string; 
  display: string;
  error?: string;
} {
  // Remove all non-digit characters except leading +
  const hasPlus = input.startsWith('+');
  let digits = input.replace(/\D/g, '');
  
  // Handle different formats
  if (hasPlus && digits.startsWith('32')) {
    // International format: +32...
    digits = digits.slice(2);
  } else if (digits.startsWith('0032')) {
    // Alternative international: 0032...
    digits = digits.slice(4);
  } else if (digits.startsWith('32') && digits.length >= 11) {
    // Missing + but has country code
    digits = digits.slice(2);
  } else if (digits.startsWith('0')) {
    // Local format: 0...
    digits = digits.slice(1);
  }
  
  // Belgian mobile numbers start with 4 (after removing leading 0 or +32)
  // Landlines can start with other digits
  const isMobile = digits.startsWith('4');
  
  // Validate length (9 digits for Belgian numbers without country code)
  if (digits.length !== 9) {
    return {
      valid: false,
      normalized: '',
      display: input,
      error: digits.length < 9 ? 'too_short' : 'too_long'
    };
  }
  
  // Validate mobile prefix (46, 47, 48, 49 are common Belgian mobile prefixes)
  if (isMobile) {
    const mobilePrefix = digits.slice(0, 2);
    const validMobilePrefixes = ['45', '46', '47', '48', '49'];
    if (!validMobilePrefixes.includes(mobilePrefix)) {
      return {
        valid: false,
        normalized: '',
        display: input,
        error: 'invalid_mobile_prefix'
      };
    }
  }
  
  // Format for display: 0470 12 34 56
  const displayNumber = `0${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`;
  
  return {
    valid: true,
    normalized: `+32${digits}`,
    display: displayNumber
  };
}

/**
 * Quick check if phone looks valid (for real-time feedback)
 */
export function isPhoneLikelyValid(input: string): boolean {
  const digits = input.replace(/\D/g, '');
  return digits.length >= 9 && digits.length <= 12;
}

// ============================================
// BELGIAN POSTAL CODE VALIDATION
// ============================================

/**
 * Validates Belgian postal code (1000-9999)
 */
export function validateBelgianPostalCode(input: string): {
  valid: boolean;
  value: string;
  error?: string;
} {
  const digits = input.replace(/\D/g, '').slice(0, 4);
  
  if (digits.length !== 4) {
    return { valid: false, value: digits, error: 'incomplete' };
  }
  
  const num = parseInt(digits, 10);
  if (num < 1000 || num > 9999) {
    return { valid: false, value: digits, error: 'out_of_range' };
  }
  
  return { valid: true, value: digits };
}

// ============================================
// ANTI-SPAM PROTECTION
// ============================================

export interface SpamCheckResult {
  isSpam: boolean;
  score: number; // 0-100, higher = more suspicious
  reasons: string[];
}

/**
 * Client-side spam detection heuristics
 */
export function checkForSpam(data: {
  description: string;
  name: string;
  phone: string;
  startTime: number; // timestamp when form was started
  honeypot?: string; // hidden field value
}): SpamCheckResult {
  const reasons: string[] = [];
  let score = 0;
  
  // 1. Honeypot check (hidden field should be empty)
  if (data.honeypot && data.honeypot.trim().length > 0) {
    reasons.push('honeypot_filled');
    score += 50;
  }
  
  // 2. Timing check (form completed too fast = likely bot)
  const elapsedSeconds = (Date.now() - data.startTime) / 1000;
  if (elapsedSeconds < 6) {
    reasons.push('too_fast');
    score += 40;
  } else if (elapsedSeconds < 15) {
    reasons.push('suspiciously_fast');
    score += 15;
  }
  
  // 3. Description content checks
  const desc = data.description.toLowerCase();
  
  // Block URLs in description
  if (/https?:\/\/|www\./i.test(desc)) {
    reasons.push('contains_url');
    score += 30;
  }
  
  // Block common spam patterns
  const spamPatterns = [
    /(.)\1{5,}/,  // Repeated characters (aaaaaa)
    /\b(bitcoin|crypto|casino|viagra|lottery|winner|congratulations)\b/i,
    /\b(click here|free money|make money|work from home)\b/i,
    /[а-яА-Я]/, // Cyrillic characters (common in spam)
  ];
  
  for (const pattern of spamPatterns) {
    if (pattern.test(desc)) {
      reasons.push('spam_pattern');
      score += 25;
      break;
    }
  }
  
  // 4. Name validation
  if (data.name.length < 2) {
    reasons.push('name_too_short');
    score += 10;
  }
  
  // Check for gibberish names (mostly consonants or vowels)
  const nameLetters = data.name.toLowerCase().replace(/[^a-z]/g, '');
  if (nameLetters.length > 3) {
    const vowels = (nameLetters.match(/[aeiou]/g) || []).length;
    const vowelRatio = vowels / nameLetters.length;
    if (vowelRatio < 0.1 || vowelRatio > 0.8) {
      reasons.push('suspicious_name');
      score += 15;
    }
  }
  
  // 5. Phone validation (already handled by normalizeBelgianPhone)
  const phoneDigits = data.phone.replace(/\D/g, '');
  if (phoneDigits.length < 9) {
    reasons.push('invalid_phone');
    score += 10;
  }
  
  return {
    isSpam: score >= 50,
    score: Math.min(score, 100),
    reasons
  };
}

// ============================================
// LOCAL STORAGE FOR RESUME LATER
// ============================================

const STORAGE_KEY = 'interventia_onboarding_draft';
const STORAGE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface SavedDraft<T = unknown> {
  data: T;
  step: number;
  savedAt: number;
  language: string;
}

/**
 * Save form progress to localStorage
 */
export function saveDraft<T>(data: T, step: number, language: string): void {
  try {
    const draft: SavedDraft = {
      data,
      step,
      savedAt: Date.now(),
      language
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch (e) {
    console.warn('Failed to save draft:', e);
  }
}

/**
 * Load saved draft from localStorage
 */
export function loadDraft(): SavedDraft | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const draft: SavedDraft = JSON.parse(stored);
    
    // Check if draft has expired
    if (Date.now() - draft.savedAt > STORAGE_EXPIRY_MS) {
      clearDraft();
      return null;
    }
    
    return draft;
  } catch (e) {
    console.warn('Failed to load draft:', e);
    return null;
  }
}

/**
 * Clear saved draft
 */
export function clearDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear draft:', e);
  }
}

/**
 * Check if there's a valid saved draft
 */
export function hasSavedDraft(): boolean {
  return loadDraft() !== null;
}
