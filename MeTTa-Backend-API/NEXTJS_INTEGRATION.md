# Next.js Integration Guide for MeTTa Rule Builder API

This guide explains how to integrate the MeTTa Rule Builder Backend API with your Next.js frontend application.

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
# Backend (Python)
cd MeTTa-Backend-API
pip install -r requirements.txt

# Frontend (Next.js)
npm install axios
# or
npm install fetch
```

### 2. Start Services

```bash
# Terminal 1: Start Backend API
cd MeTTa-Backend-API
python app.py
# Server runs on http://localhost:5000

# Terminal 2: Start Next.js Frontend
npm run dev
# Frontend runs on http://localhost:3000
```

## 📡 API Integration

### Create API Service

```javascript
// lib/mettaApi.js
class MeTTaAPI {
  constructor(baseURL = 'http://localhost:5000') {
    this.baseURL = baseURL;
  }

  // CSV Upload
  async uploadCSV(file) {
    const formData = new FormData();
    formData.append('csv', file);
    
    const response = await fetch(`${this.baseURL}/api/upload-csv`, {
      method: 'POST',
      body: formData
    });
    
    return response.json();
  }

  // Set ID Column
  async setIdColumn(sessionId, idColumn) {
    const response = await fetch(`${this.baseURL}/api/set-id-column`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, id_column: idColumn })
    });
    
    return response.json();
  }

  // Add Rule
  async addRule(sessionId, rule) {
    const response = await fetch(`${this.baseURL}/api/add-rule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, rule })
    });
    
    return response.json();
  }

  // Get Rules
  async getRules(sessionId) {
    const response = await fetch(`${this.baseURL}/api/rules/${sessionId}`);
    return response.json();
  }

  // Remove Rule
  async removeRule(sessionId, ruleId) {
    const response = await fetch(`${this.baseURL}/api/remove-rule`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, rule_id: ruleId })
    });
    
    return response.json();
  }

  // Generate MeTTa
  async generateMeTTa(sessionId) {
    const response = await fetch(`${this.baseURL}/api/generate-metta`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId })
    });
    
    return response.json();
  }

  // Execute Query
  async executeQuery(sessionId, query) {
    const response = await fetch(`${this.baseURL}/api/execute-query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, query })
    });
    
    return response.json();
  }

  // Download MeTTa File
  downloadMeTTa(sessionId) {
    window.open(`${this.baseURL}/api/download-metta/${sessionId}`);
  }
}

export default new MeTTaAPI();
```

## 🎨 Frontend Components

### 1. CSV Upload Component

```javascript
// components/CSVUpload.js
import { useState } from 'react';
import MeTTaAPI from '../lib/mettaApi';

export default function CSVUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setError(null);
    
    try {
      const result = await MeTTaAPI.uploadCSV(file);
      
      if (result.success) {
        onUploadSuccess(result);
      } else {
        setError(result.error.message);
      }
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-section">
      <h2>Step 1: Upload CSV File</h2>
      
      <div className="file-input">
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files[0])}
        />
      </div>
      
      <button 
        onClick={handleUpload} 
        disabled={!file || uploading}
        className="upload-btn"
      >
        {uploading ? 'Uploading...' : 'Upload CSV'}
      </button>
      
      {error && <div className="error">{error}</div>}
    </div>
  );
}
```

### 2. Column Selection Component

```javascript
// components/ColumnSelector.js
import { useState } from 'react';
import MeTTaAPI from '../lib/mettaApi';

export default function ColumnSelector({ sessionId, columns, onNext }) {
  const [selectedIdColumn, setSelectedIdColumn] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleNext = async () => {
    if (!selectedIdColumn) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await MeTTaAPI.setIdColumn(sessionId, selectedIdColumn);
      
      if (result.success) {
        onNext();
      } else {
        setError(result.error.message);
      }
    } catch (err) {
      setError('Failed to set ID column. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="column-section">
      <h2>Step 2: Select ID Column</h2>
      
      <div className="columns-preview">
        <h3>Extracted Columns:</h3>
        {columns.map((col, index) => (
          <div key={index} className="column-item">
            <strong>{col.name}</strong> ({col.type})
            {col.sample_values && (
              <div className="sample-values">
                Sample: {col.sample_values.join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="id-column-selector">
        <label>Select ID Column:</label>
        <select 
          value={selectedIdColumn} 
          onChange={(e) => setSelectedIdColumn(e.target.value)}
        >
          <option value="">-- Select ID Column --</option>
          {columns.map((col, index) => (
            <option key={index} value={col.name}>
              {col.name}
            </option>
          ))}
        </select>
      </div>
      
      <button 
        onClick={handleNext} 
        disabled={!selectedIdColumn || loading}
        className="next-btn"
      >
        {loading ? 'Setting...' : 'Next'}
      </button>
      
      {error && <div className="error">{error}</div>}
    </div>
  );
}
```

### 3. Rule Builder Component

```javascript
// components/RuleBuilder.js
import { useState, useEffect } from 'react';
import MeTTaAPI from '../lib/mettaApi';

export default function RuleBuilder({ sessionId, columns, onGenerate }) {
  const [rules, setRules] = useState([]);
  const [currentRule, setCurrentRule] = useState({
    rule_type: 'match',
    function_name: 'findUser',
    variable_name: '$x',
    condition: { column: '', operator: '==', value: '' },
    true_action: '$x',
    false_action: '()'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addRule = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await MeTTaAPI.addRule(sessionId, currentRule);
      
      if (result.success) {
        setRules([...rules, { ...currentRule, id: result.rule_id, preview: result.preview }]);
        setCurrentRule({
          rule_type: 'match',
          function_name: 'findUser',
          variable_name: '$x',
          condition: { column: '', operator: '==', value: '' },
          true_action: '$x',
          false_action: '()'
        });
      } else {
        setError(result.error.message);
      }
    } catch (err) {
      setError('Failed to add rule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeRule = async (ruleId) => {
    try {
      const result = await MeTTaAPI.removeRule(sessionId, ruleId);
      
      if (result.success) {
        setRules(rules.filter(rule => rule.id !== ruleId));
      }
    } catch (err) {
      setError('Failed to remove rule.');
    }
  };

  const generateMeTTa = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await MeTTaAPI.generateMeTTa(sessionId);
      
      if (result.success) {
        onGenerate(result);
      } else {
        setError(result.error.message);
      }
    } catch (err) {
      setError('Failed to generate MeTTa file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rule-builder-section">
      <h2>Step 3: Build Rules</h2>
      
      <div className="rule-form">
        <div className="form-row">
          <div>
            <label>Function Name:</label>
            <input
              value={currentRule.function_name}
              onChange={(e) => setCurrentRule({
                ...currentRule,
                function_name: e.target.value
              })}
              placeholder="e.g., findUser"
            />
          </div>
          
          <div>
            <label>Variable Name:</label>
            <input
              value={currentRule.variable_name}
              onChange={(e) => setCurrentRule({
                ...currentRule,
                variable_name: e.target.value
              })}
              placeholder="e.g., $x"
            />
          </div>
        </div>
        
        <div className="form-row">
          <div>
            <label>Column:</label>
            <select
              value={currentRule.condition.column}
              onChange={(e) => setCurrentRule({
                ...currentRule,
                condition: { ...currentRule.condition, column: e.target.value }
              })}
            >
              <option value="">-- Select Column --</option>
              {columns.map((col, index) => (
                <option key={index} value={col.name}>
                  {col.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label>Operator:</label>
            <select
              value={currentRule.condition.operator}
              onChange={(e) => setCurrentRule({
                ...currentRule,
                condition: { ...currentRule.condition, operator: e.target.value }
              })}
            >
              <option value="==">==</option>
              <option value="!=">!=</option>
              <option value=">">></option>
              <option value="<"><</option>
              <option value=">=">>=</option>
              <option value="<="><=</option>
            </select>
          </div>
        </div>
        
        <div className="form-row">
          <div>
            <label>Value:</label>
            <input
              value={currentRule.condition.value}
              onChange={(e) => setCurrentRule({
                ...currentRule,
                condition: { ...currentRule.condition, value: e.target.value }
              })}
              placeholder='e.g., "George" or 5'
            />
          </div>
        </div>
        
        <div className="form-row">
          <div>
            <label>If TRUE, return:</label>
            <input
              value={currentRule.true_action}
              onChange={(e) => setCurrentRule({
                ...currentRule,
                true_action: e.target.value
              })}
              placeholder="e.g., $x"
            />
          </div>
          
          <div>
            <label>If FALSE, return:</label>
            <input
              value={currentRule.false_action}
              onChange={(e) => setCurrentRule({
                ...currentRule,
                false_action: e.target.value
              })}
              placeholder="e.g., ()"
            />
          </div>
        </div>
        
        <button onClick={addRule} disabled={loading} className="add-rule-btn">
          {loading ? 'Adding...' : 'Add Rule'}
        </button>
      </div>
      
      <div className="rules-list">
        <h3>Current Rules:</h3>
        {rules.map((rule, index) => (
          <div key={rule.id} className="rule-item">
            <div className="rule-preview">
              <pre>{rule.preview}</pre>
            </div>
            <button 
              onClick={() => removeRule(rule.id)}
              className="remove-btn"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      
      <button 
        onClick={generateMeTTa} 
        disabled={rules.length === 0 || loading}
        className="generate-btn"
      >
        {loading ? 'Generating...' : 'Generate MeTTa File'}
      </button>
      
      {error && <div className="error">{error}</div>}
    </div>
  );
}
```

### 4. MeTTa Preview Component

```javascript
// components/MeTTaPreview.js
import { useState } from 'react';
import MeTTaAPI from '../lib/mettaApi';

export default function MeTTaPreview({ sessionId, mettaData }) {
  const [query, setQuery] = useState('!(findUser $x)');
  const [queryResult, setQueryResult] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState(null);

  const executeQuery = async () => {
    if (!query.trim()) return;
    
    setExecuting(true);
    setError(null);
    
    try {
      const result = await MeTTaAPI.executeQuery(sessionId, query);
      
      if (result.success) {
        setQueryResult(result);
      } else {
        setError(result.error.message);
      }
    } catch (err) {
      setError('Query execution failed.');
    } finally {
      setExecuting(false);
    }
  };

  const downloadFile = () => {
    MeTTaAPI.downloadMeTTa(sessionId);
  };

  return (
    <div className="preview-section">
      <h2>Step 4: MeTTa Preview & Download</h2>
      
      <div className="metta-content">
        <h3>Generated MeTTa File:</h3>
        <div className="file-stats">
          <span>Lines: {mettaData.lines_count}</span>
          <span>Facts: {mettaData.facts_count}</span>
          <span>Rules: {mettaData.rules_count}</span>
          <span>Size: {(mettaData.file_size / 1024).toFixed(1)} KB</span>
        </div>
        
        <textarea
          value={mettaData.metta_content}
          readOnly
          className="metta-textarea"
          rows={20}
        />
      </div>
      
      <div className="query-section">
        <h3>Test Query:</h3>
        <div className="query-input">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter MeTTa query..."
            className="query-field"
          />
          <button 
            onClick={executeQuery} 
            disabled={executing || !query.trim()}
            className="execute-btn"
          >
            {executing ? 'Executing...' : 'Execute'}
          </button>
        </div>
        
        {queryResult && (
          <div className="query-result">
            <h4>Query Result:</h4>
            <div className="result-content">
              <strong>Query:</strong> {queryResult.query}<br/>
              <strong>Results:</strong> {queryResult.results.join(', ')}<br/>
              <strong>Execution Time:</strong> {queryResult.execution_time}
            </div>
          </div>
        )}
      </div>
      
      <div className="actions">
        <button onClick={downloadFile} className="download-btn">
          Download .metta File
        </button>
      </div>
      
      {error && <div className="error">{error}</div>}
    </div>
  );
}
```

## 🔄 Complete Page Integration

```javascript
// pages/metta-builder.js
import { useState } from 'react';
import CSVUpload from '../components/CSVUpload';
import ColumnSelector from '../components/ColumnSelector';
import RuleBuilder from '../components/RuleBuilder';
import MeTTaPreview from '../components/MeTTaPreview';

export default function MeTTaBuilder() {
  const [currentStep, setCurrentStep] = useState(1);
  const [sessionId, setSessionId] = useState(null);
  const [columns, setColumns] = useState([]);
  const [mettaData, setMettaData] = useState(null);

  const handleUploadSuccess = (result) => {
    setSessionId(result.session_id);
    setColumns(result.columns);
    setCurrentStep(2);
  };

  const handleColumnNext = () => {
    setCurrentStep(3);
  };

  const handleGenerate = (result) => {
    setMettaData(result);
    setCurrentStep(4);
  };

  return (
    <div className="metta-builder">
      <h1>MeTTa Rule Builder</h1>
      
      <div className="progress">
        <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>1. Upload CSV</div>
        <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>2. Select ID Column</div>
        <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>3. Build Rules</div>
        <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>4. Preview & Download</div>
      </div>
      
      {currentStep === 1 && (
        <CSVUpload onUploadSuccess={handleUploadSuccess} />
      )}
      
      {currentStep === 2 && (
        <ColumnSelector 
          sessionId={sessionId}
          columns={columns}
          onNext={handleColumnNext}
        />
      )}
      
      {currentStep === 3 && (
        <RuleBuilder 
          sessionId={sessionId}
          columns={columns}
          onGenerate={handleGenerate}
        />
      )}
      
      {currentStep === 4 && (
        <MeTTaPreview 
          sessionId={sessionId}
          mettaData={mettaData}
        />
      )}
    </div>
  );
}
```

## 🎨 CSS Styling

```css
/* styles/metta-builder.css */
.metta-builder {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.progress {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.step {
  padding: 10px 20px;
  border-radius: 4px;
  background: #e0e0e0;
  color: #666;
}

.step.active {
  background: #007bff;
  color: white;
}

.upload-section,
.column-section,
.rule-builder-section,
.preview-section {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.form-row > div {
  flex: 1;
}

.form-row label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-row input,
.form-row select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.metta-textarea {
  width: 100%;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
}

.query-input {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.query-field {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.upload-btn,
.next-btn,
.add-rule-btn,
.generate-btn,
.execute-btn,
.download-btn {
  background: #007bff;
  color: white;
}

.button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.remove-btn {
  background: #dc3545;
  color: white;
  padding: 5px 10px;
  font-size: 12px;
}

.error {
  color: #dc3545;
  background: #f8d7da;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
}

.rule-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 10px;
}

.rule-preview pre {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.query-result {
  background: #d4edda;
  padding: 15px;
  border-radius: 4px;
  margin-top: 10px;
}

.result-content {
  font-family: 'Courier New', monospace;
  font-size: 14px;
}
```

## 🚀 Deployment

### Environment Variables

```bash
# .env.local (Next.js)
NEXT_PUBLIC_API_URL=http://localhost:5000

# .env (Backend)
FLASK_ENV=production
FLASK_DEBUG=False
UPLOAD_FOLDER=/tmp/metta-uploads
MAX_CONTENT_LENGTH=16777216
SESSION_TIMEOUT_HOURS=1
```

### Production Considerations

1. **CORS Configuration**: Update CORS origins for production domains
2. **File Storage**: Use cloud storage (AWS S3, Google Cloud) for uploaded files
3. **Session Storage**: Use Redis or database for session persistence
4. **Error Handling**: Implement proper error logging and monitoring
5. **Rate Limiting**: Add rate limiting to prevent abuse
6. **Authentication**: Add user authentication if needed

This integration provides a complete workflow from CSV upload to MeTTa file generation with a clean, step-by-step user interface.
