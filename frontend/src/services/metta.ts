/**
 * MeTTa Rule Builder API Service
 * Complete API integration for MeTTa Rule Builder Backend
 */

const BASE_URL = 'http://localhost:5000';

export interface MeTTaColumn {
  name: string;
  type: string;
  sample_values: string[];
}

export interface MeTTaUploadResponse {
  success: boolean;
  session_id: string;
  columns: MeTTaColumn[];
  total_rows: number;
  preview: Record<string, any>[];
}

export interface MeTTaRule {
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
}

export interface MeTTaRuleResponse {
  success: boolean;
  rule_id: string;
  rules_count: number;
  preview: string;
}

export interface MeTTaGenerateResponse {
  success: boolean;
  metta_content: string;
  file_size: number;
  lines_count: number;
  facts_count: number;
  rules_count: number;
  download_url: string;
}

export interface MeTTaQueryResponse {
  success: boolean;
  query: string;
  results: string[];
  execution_time: string;
  message: string;
}

class MeTTaAPI {
  private baseURL: string;

  constructor(baseURL: string = BASE_URL) {
    this.baseURL = baseURL;
  }

  // Health Check
  async healthCheck(): Promise<{ success: boolean; status: string; timestamp: string; version: string }> {
    const response = await fetch(`${this.baseURL}/api/health`);
    return response.json();
  }

  // CSV Upload
  async uploadCSV(file: File): Promise<MeTTaUploadResponse> {
    const formData = new FormData();
    formData.append('csv', file);
    
    const response = await fetch(`${this.baseURL}/api/upload-csv`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Set ID Column
  async setIdColumn(sessionId: string, idColumn: string): Promise<{ success: boolean; id_column: string; message: string }> {
    const response = await fetch(`${this.baseURL}/api/set-id-column`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, id_column: idColumn })
    });
    
    if (!response.ok) {
      throw new Error(`Set ID column failed: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Add Rule
  async addRule(sessionId: string, rule: MeTTaRule): Promise<MeTTaRuleResponse> {
    const response = await fetch(`${this.baseURL}/api/add-rule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, rule })
    });
    
    if (!response.ok) {
      throw new Error(`Add rule failed: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Get All Rules
  async getRules(sessionId: string): Promise<{ success: boolean; rules: any[]; rules_count: number }> {
    const response = await fetch(`${this.baseURL}/api/rules/${sessionId}`);
    
    if (!response.ok) {
      throw new Error(`Get rules failed: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Remove Rule
  async removeRule(sessionId: string, ruleId: string): Promise<{ success: boolean; message: string; rules_count: number }> {
    const response = await fetch(`${this.baseURL}/api/remove-rule`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, rule_id: ruleId })
    });
    
    if (!response.ok) {
      throw new Error(`Remove rule failed: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Generate MeTTa File
  async generateMeTTa(sessionId: string): Promise<MeTTaGenerateResponse> {
    const response = await fetch(`${this.baseURL}/api/generate-metta`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId })
    });
    
    if (!response.ok) {
      throw new Error(`Generate MeTTa failed: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Get MeTTa Preview
  async getMeTTaPreview(sessionId: string): Promise<{ success: boolean; metta_content: string; stats: any }> {
    const response = await fetch(`${this.baseURL}/api/metta-preview/${sessionId}`);
    
    if (!response.ok) {
      throw new Error(`Get MeTTa preview failed: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Execute Query
  async executeQuery(sessionId: string, query: string): Promise<MeTTaQueryResponse> {
    const response = await fetch(`${this.baseURL}/api/execute-query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, query })
    });
    
    if (!response.ok) {
      throw new Error(`Execute query failed: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Download MeTTa File
  downloadMeTTa(sessionId: string): void {
    window.open(`${this.baseURL}/api/download-metta/${sessionId}`);
  }

  // Print to Terminal
  async printTerminal(sessionId: string): Promise<{ success: boolean; message: string; printed_lines: number }> {
    const response = await fetch(`${this.baseURL}/api/print-terminal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId })
    });
    
    if (!response.ok) {
      throw new Error(`Print terminal failed: ${response.statusText}`);
    }
    
    return response.json();
  }
}

// Export singleton instance
export const mettaAPI = new MeTTaAPI();
export default mettaAPI;
