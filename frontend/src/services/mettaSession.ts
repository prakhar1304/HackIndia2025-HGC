/**
 * MeTTa Session Management
 * Handles localStorage for session persistence
 */

const SESSION_KEY = 'metta_builder_session';

export interface MeTTaSession {
  sessionId: string;
  columns: Array<{
    name: string;
    type: string;
    sample_values: string[];
  }>;
  idColumn: string;
  rules: Array<{
    id: string;
    rule_type: 'match' | 'flexible';
    function_name: string;
    variable_name?: string;
    parameter?: string;
    condition: {
      column: string;
      operator: '==' | '!=' | '>' | '<' | '>=' | '<=';
      value: string | number;
    };
    true_action: string;
    false_action: string;
    preview: string;
  }>;
  timestamp: number;
}

export const mettaSession = {
  // Save session to localStorage
  save(session: MeTTaSession): void {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      console.log('💾 MeTTa session saved:', session.sessionId);
    } catch (error) {
      console.error('Failed to save MeTTa session:', error);
    }
  },

  // Load session from localStorage
  load(): MeTTaSession | null {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (!stored) return null;
      
      const session = JSON.parse(stored) as MeTTaSession;
      console.log('📦 MeTTa session loaded:', session.sessionId);
      return session;
    } catch (error) {
      console.error('Failed to load MeTTa session:', error);
      return null;
    }
  },

  // Update session with new data
  update(updates: Partial<MeTTaSession>): MeTTaSession | null {
    const current = this.load();
    if (!current) return null;
    
    const updated = { ...current, ...updates, timestamp: Date.now() };
    this.save(updated);
    return updated;
  },

  // Add rule to session
  addRule(rule: MeTTaSession['rules'][0]): MeTTaSession | null {
    const current = this.load();
    if (!current) return null;
    
    const updated = {
      ...current,
      rules: [...current.rules, rule],
      timestamp: Date.now()
    };
    this.save(updated);
    return updated;
  },

  // Remove rule from session
  removeRule(ruleId: string): MeTTaSession | null {
    const current = this.load();
    if (!current) return null;
    
    const updated = {
      ...current,
      rules: current.rules.filter(rule => rule.id !== ruleId),
      timestamp: Date.now()
    };
    this.save(updated);
    return updated;
  },

  // Clear session
  clear(): void {
    try {
      localStorage.removeItem(SESSION_KEY);
      console.log('🗑️ MeTTa session cleared');
    } catch (error) {
      console.error('Failed to clear MeTTa session:', error);
    }
  },

  // Check if session exists and is recent (within 1 hour)
  isValid(): boolean {
    const session = this.load();
    if (!session) return false;
    
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
    const isRecent = Date.now() - session.timestamp < oneHour;
    
    if (!isRecent) {
      this.clear();
      return false;
    }
    
    return true;
  }
};

export default mettaSession;
