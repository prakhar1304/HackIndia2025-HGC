"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Upload, FileText, ArrowRight, CheckCircle, AlertCircle, Loader2, Plus, Trash2, Code, Eye } from "lucide-react"
import { mettaAPI, type MeTTaColumn, type MeTTaUploadResponse, type MeTTaRule, type MeTTaRuleResponse } from "@/services/metta"
import { mettaSession, type MeTTaSession } from "@/services/mettaSession"

export default function MeTTaBuilderPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<MeTTaUploadResponse | null>(null)
  const [selectedIdColumn, setSelectedIdColumn] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [columns, setColumns] = useState<MeTTaColumn[]>([])
  const [session, setSession] = useState<MeTTaSession | null>(null)
  
  // Phase 2: Rule Builder state
  const [currentRule, setCurrentRule] = useState<MeTTaRule>({
    rule_type: 'match',
    function_name: 'findUser',
    variable_name: '$x',
    condition: { column: '', operator: '==', value: '' },
    true_action: '$x',
    false_action: '()'
  })
  const [rules, setRules] = useState<MeTTaSession['rules']>([])
  const [addingRule, setAddingRule] = useState(false)
  
  // Phase 3: MeTTa Preview state
  const [mettaData, setMettaData] = useState<{
    metta_content: string;
    file_size: number;
    lines_count: number;
    facts_count: number;
    rules_count: number;
    download_url: string;
  } | null>(null)
  const [loadingMeTTa, setLoadingMeTTa] = useState(false)
  const [query, setQuery] = useState('!(findUser $x)')
  const [queryResult, setQueryResult] = useState<{
    query: string;
    results: string[];
    execution_time: string;
    message: string;
  } | null>(null)
  const [executingQuery, setExecutingQuery] = useState(false)
  const [printingTerminal, setPrintingTerminal] = useState(false)
  
  // Phase 4: Advanced Features state
  const [showRuleTemplates, setShowRuleTemplates] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [ruleValidation, setRuleValidation] = useState<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } | null>(null)

  // Load session on component mount
  useEffect(() => {
    // Always start from step 1 for a fresh experience
    setCurrentStep(1)
    console.log('🆕 Starting fresh MeTTa session from step 1')
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return
    
    setUploading(true)
    setError(null)
    
    try {
      const result = await mettaAPI.uploadCSV(file)
      setUploadResult(result)
      setSessionId(result.session_id)
      setColumns(result.columns)
      
      // Auto-select ID column if present
      const idColumns = result.columns.filter(col => 
        col.name.toLowerCase().includes('id') || 
        col.name.toLowerCase().includes('key') ||
        col.name.toLowerCase().includes('index')
      )
      if (idColumns.length > 0) {
        setSelectedIdColumn(idColumns[0].name)
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleSetIdColumn = async () => {
    if (!sessionId || !selectedIdColumn || !uploadResult) return
    
    try {
      await mettaAPI.setIdColumn(sessionId, selectedIdColumn)
      
      // Save session to localStorage
      const newSession: MeTTaSession = {
        sessionId,
        columns: uploadResult.columns,
        idColumn: selectedIdColumn,
        rules: [],
        timestamp: Date.now()
      }
      mettaSession.save(newSession)
      setSession(newSession)
      setCurrentStep(2)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set ID column')
    }
  }

  const getColumnTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'string':
        return '📝'
      case 'number':
        return '🔢'
      case 'date':
        return '📅'
      default:
        return '📊'
    }
  }

  // Phase 4: Rule Templates
  const ruleTemplates = [
    {
      id: 'find-user',
      name: 'Find User',
      description: 'Find users by name or ID',
      icon: '👤',
      rule: {
        rule_type: 'match' as const,
        function_name: 'findUser',
        variable_name: '$x',
        condition: { column: 'name', operator: '==' as const, value: 'John' },
        true_action: '$x',
        false_action: '()'
      }
    },
    {
      id: 'filter-age',
      name: 'Age Filter',
      description: 'Filter users by age range',
      icon: '🎂',
      rule: {
        rule_type: 'match' as const,
        function_name: 'findAdults',
        variable_name: '$x',
        condition: { column: 'age', operator: '>=' as const, value: '18' },
        true_action: '$x',
        false_action: '()'
      }
    },
    {
      id: 'location-based',
      name: 'Location Based',
      description: 'Find users by city or country',
      icon: '🌍',
      rule: {
        rule_type: 'match' as const,
        function_name: 'findByLocation',
        variable_name: '$x',
        condition: { column: 'city', operator: '==' as const, value: 'New York' },
        true_action: '$x',
        false_action: '()'
      }
    },
    {
      id: 'role-check',
      name: 'Role Check',
      description: 'Check user roles or permissions',
      icon: '🔐',
      rule: {
        rule_type: 'match' as const,
        function_name: 'hasRole',
        variable_name: '$x',
        condition: { column: 'role', operator: '==' as const, value: 'admin' },
        true_action: '$x',
        false_action: '()'
      }
    },
    {
      id: 'recommendation',
      name: 'Recommendation',
      description: 'Create recommendation rules',
      icon: '⭐',
      rule: {
        rule_type: 'flexible' as const,
        function_name: 'recommend',
        parameter: 'genre',
        condition: { column: 'genre', operator: '==' as const, value: 'Action' },
        true_action: 'recommend($x)',
        false_action: '()'
      }
    },
    {
      id: 'conditional-logic',
      name: 'Conditional Logic',
      description: 'Complex conditional statements',
      icon: '🧠',
      rule: {
        rule_type: 'match' as const,
        function_name: 'conditionalCheck',
        variable_name: '$x',
        condition: { column: 'score', operator: '>' as const, value: '80' },
        true_action: 'highScore($x)',
        false_action: 'lowScore($x)'
      }
    }
  ]

  // Phase 4: Rule validation
  const validateRule = (rule: MeTTaRule) => {
    const errors: string[] = []
    const warnings: string[] = []

    // Check function name
    if (!rule.function_name || rule.function_name.trim() === '') {
      errors.push('Function name is required')
    } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(rule.function_name)) {
      errors.push('Function name must start with letter or underscore and contain only alphanumeric characters')
    }

    // Check variable name for match rules
    if (rule.rule_type === 'match' && (!rule.variable_name || rule.variable_name.trim() === '')) {
      errors.push('Variable name is required for match rules')
    } else if (rule.variable_name && !rule.variable_name.startsWith('$')) {
      warnings.push('Variable names typically start with $ (e.g., $x, $user)')
    }

    // Check condition
    if (!rule.condition.column) {
      errors.push('Column selection is required')
    }
    if (!rule.condition.operator) {
      errors.push('Operator selection is required')
    }
    if (rule.condition.value === '') {
      errors.push('Value is required')
    }

    // Check actions
    if (!rule.true_action || rule.true_action.trim() === '') {
      errors.push('True action is required')
    }
    if (!rule.false_action || rule.false_action.trim() === '') {
      errors.push('False action is required')
    }

    // Check for common patterns - no longer warning about quotes since we handle clean values

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  // Phase 4: Apply template
  const applyTemplate = (template: typeof ruleTemplates[0]) => {
    setCurrentRule(template.rule)
    setSelectedTemplate(template.id)
    setRuleValidation(validateRule(template.rule))
  }

  // Helper function to format value for API (add quotes for strings)
  const formatValueForAPI = (value: string | number): string => {
    if (typeof value === 'number' || /^\d+$/.test(value.toString())) {
      return value.toString()
    }
    return `"${value}"`
  }

  // Phase 2: Rule Builder functions
  const handleAddRule = async () => {
    if (!sessionId || !currentRule.condition.column) return
    
    // Validate rule before adding
    const validation = validateRule(currentRule)
    if (!validation.isValid) {
      setError(`Rule validation failed: ${validation.errors.join(', ')}`)
      return
    }
    
    setAddingRule(true)
    setError(null)
    
    try {
      const result: MeTTaRuleResponse = await mettaAPI.addRule(sessionId, currentRule)
      
      const newRule = {
        id: result.rule_id,
        ...currentRule,
        preview: result.preview
      }
      
      const updatedRules = [...rules, newRule]
      setRules(updatedRules)
      
      // Update session in localStorage
      const updatedSession = mettaSession.update({ rules: updatedRules })
      if (updatedSession) setSession(updatedSession)
      
      // Reset current rule
      setCurrentRule({
        rule_type: 'match',
        function_name: 'findUser',
        variable_name: '$x',
        condition: { column: '', operator: '==', value: '' },
        true_action: '$x',
        false_action: '()'
      })
      setSelectedTemplate(null)
      setRuleValidation(null)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add rule')
    } finally {
      setAddingRule(false)
    }
  }

  // Phase 4: Real-time validation
  const handleRuleChange = (updatedRule: MeTTaRule) => {
    setCurrentRule(updatedRule)
    const validation = validateRule(updatedRule)
    setRuleValidation(validation)
  }

  const handleRemoveRule = async (ruleId: string) => {
    if (!sessionId) return
    
    try {
      await mettaAPI.removeRule(sessionId, ruleId)
      
      const updatedRules = rules.filter(rule => rule.id !== ruleId)
      setRules(updatedRules)
      
      // Update session in localStorage
      const updatedSession = mettaSession.update({ rules: updatedRules })
      if (updatedSession) setSession(updatedSession)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove rule')
    }
  }

  const handleGenerateMeTTa = async () => {
    if (!sessionId) return
    
    setLoadingMeTTa(true)
    setError(null)
    
    try {
      const result = await mettaAPI.generateMeTTa(sessionId)
      setMettaData(result)
      setCurrentStep(3)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate MeTTa file')
    } finally {
      setLoadingMeTTa(false)
    }
  }

  // Phase 3: MeTTa Preview functions
  const handleExecuteQuery = async () => {
    if (!sessionId || !query.trim()) return
    
    setExecutingQuery(true)
    setError(null)
    
    try {
      const result = await mettaAPI.executeQuery(sessionId, query)
      setQueryResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Query execution failed')
    } finally {
      setExecutingQuery(false)
    }
  }

  const handleDownloadMeTTa = () => {
    if (sessionId) {
      mettaAPI.downloadMeTTa(sessionId)
    }
  }

  const handlePrintTerminal = async () => {
    if (!sessionId) return
    
    setPrintingTerminal(true)
    setError(null)
    
    try {
      await mettaAPI.printTerminal(sessionId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to print to terminal')
    } finally {
      setPrintingTerminal(false)
    }
  }

  return (
    <main className="min-h-screen bg-white py-10">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-black mb-4">
            MeTTa Rule Builder
          </h1>
          <p className="text-xl font-bold text-gray-700">
            Transform your data into intelligent recommendations
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-12 h-12 rounded-full border-4 border-black shadow-[6px_6px_0_0_#000] flex items-center justify-center font-black text-lg
                  ${currentStep >= step 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-white text-gray-500'
                  }
                `}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-16 h-1 mx-2 ${currentStep > step ? 'bg-purple-500' : 'bg-gray-300'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-16 mt-4 text-sm font-bold">
            <span className={currentStep >= 1 ? 'text-purple-700' : 'text-gray-500'}>Upload CSV</span>
            <span className={currentStep >= 2 ? 'text-purple-700' : 'text-gray-500'}>Configure</span>
            <span className={currentStep >= 3 ? 'text-purple-700' : 'text-gray-500'}>Build Rules</span>
            <span className={currentStep >= 4 ? 'text-purple-700' : 'text-gray-500'}>Generate</span>
          </div>
        </div>

        {/* Step 1: CSV Upload */}
        {currentStep === 1 && (
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 border-4 border-black shadow-[12px_12px_0_0_#000] bg-gradient-to-br from-blue-50 to-purple-50">
              <div className="text-center">
                <h2 className="text-3xl font-black text-black mb-6">Step 1: Upload Your CSV</h2>
                
                {/* File Upload Area */}
                <div className="mb-8">
                  <div className="border-4 border-dashed border-black rounded-2xl p-12 bg-white shadow-[8px_8px_0_0_#000] hover:shadow-[12px_12px_0_0_#000] transition-all">
                    <div className="text-center">
                      <Upload className="w-16 h-16 mx-auto mb-4 text-purple-600" />
                      <h3 className="text-xl font-black text-black mb-2">Choose your CSV file</h3>
                      <p className="text-gray-600 mb-6">Drag and drop or click to browse</p>
                      
                      <Input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="mb-4"
                      />
                      
                      {file && (
                        <div className="bg-green-100 border-2 border-green-500 rounded-lg p-4 mb-4">
                          <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-green-700" />
                            <span className="font-bold text-green-800">{file.name}</span>
                            <span className="text-sm text-green-600">
                              ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <Button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-black px-8 py-3 rounded-xl border-4 border-black shadow-[8px_8px_0_0_#000] hover:shadow-[12px_12px_0_0_#000] transition-all"
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 w-5 h-5" />
                            Upload CSV
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Upload Results */}
                {uploadResult && (
                  <div className="bg-white rounded-2xl border-4 border-black shadow-[8px_8px_0_0_#000] p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <h3 className="text-xl font-black text-green-800">Upload Successful!</h3>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-purple-100 border-2 border-purple-500 rounded-lg p-4">
                        <h4 className="font-black text-purple-800 mb-2">📊 File Stats</h4>
                        <p className="text-sm font-semibold text-purple-700">
                          Rows: <span className="font-black">{uploadResult.total_rows}</span>
                        </p>
                        <p className="text-sm font-semibold text-purple-700">
                          Columns: <span className="font-black">{uploadResult.columns.length}</span>
                        </p>
                      </div>
                      
                      <div className="bg-green-100 border-2 border-green-500 rounded-lg p-4">
                        <h4 className="font-black text-green-800 mb-2">🔑 Session ID</h4>
                        <p className="text-xs font-mono text-green-700 break-all">
                          {uploadResult.session_id}
                        </p>
                      </div>
                    </div>

                    {/* Columns Preview */}
                    <div className="mb-6">
                      <h4 className="font-black text-black mb-4">📋 Detected Columns</h4>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {uploadResult.columns.map((column, index) => (
                          <div key={index} className="bg-gray-100 border-2 border-gray-400 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">{getColumnTypeIcon(column.type)}</span>
                              <span className="font-black text-gray-800">{column.name}</span>
                              <span className="text-xs bg-gray-300 px-2 py-1 rounded border border-gray-500">
                                {column.type}
                              </span>
                            </div>
                            {column.sample_values.length > 0 && (
                              <p className="text-xs text-gray-600">
                                Sample: {column.sample_values.slice(0, 3).join(', ')}
                                {column.sample_values.length > 3 && '...'}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ID Column Selection */}
                    <div className="mb-6">
                      <h4 className="font-black text-black mb-4">🎯 Select ID Column</h4>
                      <div className="flex gap-4 items-center">
                        <Select value={selectedIdColumn} onValueChange={setSelectedIdColumn}>
                          <SelectTrigger className="flex-1 border-4 border-black shadow-[4px_4px_0_0_#000]">
                            <SelectValue placeholder="Choose your ID column..." />
                          </SelectTrigger>
                          <SelectContent>
                            {uploadResult.columns.map((column, index) => (
                              <SelectItem key={index} value={column.name}>
                                <div className="flex items-center gap-2">
                                  <span>{getColumnTypeIcon(column.type)}</span>
                                  <span className="font-bold">{column.name}</span>
                                  <span className="text-xs text-gray-500">({column.type})</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Button
                          onClick={handleSetIdColumn}
                          disabled={!selectedIdColumn}
                          className="bg-green-600 hover:bg-green-700 text-white font-black px-6 py-3 rounded-xl border-4 border-black shadow-[6px_6px_0_0_#000] hover:shadow-[8px_8px_0_0_#000] transition-all"
                        >
                          <ArrowRight className="mr-2 w-5 h-5" />
                          Next
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <div className="bg-red-100 border-4 border-red-500 rounded-lg p-4 mt-6">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-700" />
                      <span className="font-bold text-red-800">{error}</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Step 2: Rule Builder */}
        {currentStep === 2 && (
          <div className="max-w-6xl mx-auto">
            <Card className="p-8 border-4 border-black shadow-[12px_12px_0_0_#000] bg-gradient-to-br from-green-50 to-purple-50">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-black mb-4">Step 2: Build Your Rules</h2>
                <p className="text-lg font-bold text-gray-700">
                  Create intelligent matching rules using your data columns
                </p>
              </div>

               {/* Phase 4: Rule Templates */}
               <div className="bg-white rounded-2xl border-4 border-black shadow-[8px_8px_0_0_#000] p-6 mb-8">
                 <div className="flex items-center justify-between mb-6">
                   <h3 className="text-xl font-black text-black flex items-center gap-2">
                     <Code className="w-6 h-6" />
                     Rule Templates
                   </h3>
                   <Button
                     onClick={() => setShowRuleTemplates(!showRuleTemplates)}
                     className="bg-blue-600 hover:bg-blue-700 text-white font-black px-4 py-2 rounded-lg border-2 border-black shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] transition-all"
                   >
                     {showRuleTemplates ? 'Hide' : 'Show'} Templates
                   </Button>
                 </div>

                 {showRuleTemplates && (
                   <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                     {ruleTemplates.map((template) => (
                       <div
                         key={template.id}
                         onClick={() => applyTemplate(template)}
                         className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:scale-105 ${
                           selectedTemplate === template.id
                             ? 'border-purple-500 bg-purple-50 shadow-[4px_4px_0_0_#000]'
                             : 'border-gray-400 bg-gray-50 hover:border-black hover:shadow-[2px_2px_0_0_#000]'
                         }`}
                       >
                         <div className="flex items-center gap-3 mb-2">
                           <span className="text-2xl">{template.icon}</span>
                           <div>
                             <h4 className="font-black text-black">{template.name}</h4>
                             <p className="text-sm text-gray-600">{template.description}</p>
                           </div>
                         </div>
                         <div className="text-xs font-mono bg-black text-green-400 p-2 rounded border border-gray-600">
                           {template.rule.function_name}({template.rule.condition.column} {template.rule.condition.operator} "{template.rule.condition.value}")
                         </div>
                       </div>
                     ))}
                   </div>
                 )}
               </div>

               {/* Rule Builder Form */}
               <div className="bg-white rounded-2xl border-4 border-black shadow-[8px_8px_0_0_#000] p-6 mb-8">
                 <h3 className="text-xl font-black text-black mb-6 flex items-center gap-2">
                   <Plus className="w-6 h-6" />
                   Add New Rule
                 </h3>

                 {/* Phase 4: Validation Feedback */}
                 {ruleValidation && (
                   <div className={`mb-6 p-4 rounded-lg border-2 ${
                     ruleValidation.isValid 
                       ? 'bg-green-50 border-green-500' 
                       : 'bg-red-50 border-red-500'
                   }`}>
                     <div className="flex items-center gap-2 mb-2">
                       {ruleValidation.isValid ? (
                         <CheckCircle className="w-5 h-5 text-green-600" />
                       ) : (
                         <AlertCircle className="w-5 h-5 text-red-600" />
                       )}
                       <span className={`font-bold ${
                         ruleValidation.isValid ? 'text-green-800' : 'text-red-800'
                       }`}>
                         {ruleValidation.isValid ? 'Rule is valid' : 'Rule has errors'}
                       </span>
                     </div>
                     {ruleValidation.errors.length > 0 && (
                       <div className="mb-2">
                         <p className="text-sm font-bold text-red-700 mb-1">Errors:</p>
                         <ul className="text-sm text-red-600 list-disc list-inside">
                           {ruleValidation.errors.map((error, index) => (
                             <li key={index}>{error}</li>
                           ))}
                         </ul>
                       </div>
                     )}
                     {ruleValidation.warnings.length > 0 && (
                       <div>
                         <p className="text-sm font-bold text-yellow-700 mb-1">Warnings:</p>
                         <ul className="text-sm text-yellow-600 list-disc list-inside">
                           {ruleValidation.warnings.map((warning, index) => (
                             <li key={index}>{warning}</li>
                           ))}
                         </ul>
                       </div>
                     )}
                   </div>
                 )}

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* Function Name */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                      Function Name
                    </label>
                     <Input
                       value={currentRule.function_name}
                       onChange={(e) => handleRuleChange({
                         ...currentRule,
                         function_name: e.target.value
                       })}
                       placeholder="e.g., findUser"
                       className="border-4 border-black shadow-[4px_4px_0_0_#000] focus:shadow-[6px_6px_0_0_#000]"
                     />
                  </div>

                  {/* Variable Name */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                      Variable Name
                    </label>
                     <Input
                       value={currentRule.variable_name || ''}
                       onChange={(e) => handleRuleChange({
                         ...currentRule,
                         variable_name: e.target.value
                       })}
                       placeholder="e.g., $x"
                       className="border-4 border-black shadow-[4px_4px_0_0_#000] focus:shadow-[6px_6px_0_0_#000]"
                     />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  {/* Column */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                      Column
                    </label>
                     <Select
                       value={currentRule.condition.column}
                       onValueChange={(value) => handleRuleChange({
                         ...currentRule,
                         condition: { ...currentRule.condition, column: value }
                       })}
                     >
                      <SelectTrigger className="border-4 border-black shadow-[4px_4px_0_0_#000]">
                        <SelectValue placeholder="Select column..." />
                      </SelectTrigger>
                      <SelectContent>
                        {columns.map((column, index) => (
                          <SelectItem key={index} value={column.name}>
                            <div className="flex items-center gap-2">
                              <span>{getColumnTypeIcon(column.type)}</span>
                              <span className="font-bold">{column.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Operator */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                      Operator
                    </label>
                     <Select
                       value={currentRule.condition.operator}
                       onValueChange={(value: any) => handleRuleChange({
                         ...currentRule,
                         condition: { ...currentRule.condition, operator: value }
                       })}
                     >
                      <SelectTrigger className="border-4 border-black shadow-[4px_4px_0_0_#000]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="==">== (equals)</SelectItem>
                        <SelectItem value="!=">!= (not equals)</SelectItem>
                        <SelectItem value=">">&gt; (greater than)</SelectItem>
                        <SelectItem value="<">&lt; (less than)</SelectItem>
                        <SelectItem value=">=">&gt;= (greater or equal)</SelectItem>
                        <SelectItem value="<=">&lt;= (less or equal)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Value */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                      Value
                    </label>
                     <Input
                       value={currentRule.condition.value}
                       onChange={(e) => {
                         let cleanValue = e.target.value
                         // Remove extra quotes if they exist
                         if (cleanValue.startsWith('"') && cleanValue.endsWith('"') && cleanValue.length > 2) {
                           cleanValue = cleanValue.slice(1, -1)
                         }
                         handleRuleChange({
                           ...currentRule,
                           condition: { ...currentRule.condition, value: cleanValue }
                         })
                       }}
                       placeholder='e.g., John or 25'
                       className="border-4 border-black shadow-[4px_4px_0_0_#000] focus:shadow-[6px_6px_0_0_#000]"
                     />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* True Action */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                      If TRUE, return
                    </label>
                     <Input
                       value={currentRule.true_action}
                       onChange={(e) => handleRuleChange({
                         ...currentRule,
                         true_action: e.target.value
                       })}
                       placeholder="e.g., $x"
                       className="border-4 border-black shadow-[4px_4px_0_0_#000] focus:shadow-[6px_6px_0_0_#000]"
                     />
                  </div>

                  {/* False Action */}
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">
                      If FALSE, return
                    </label>
                     <Input
                       value={currentRule.false_action}
                       onChange={(e) => handleRuleChange({
                         ...currentRule,
                         false_action: e.target.value
                       })}
                       placeholder="e.g., ()"
                       className="border-4 border-black shadow-[4px_4px_0_0_#000] focus:shadow-[6px_6px_0_0_#000]"
                     />
                  </div>
                </div>

                 <Button
                   onClick={handleAddRule}
                   disabled={addingRule || !currentRule.condition.column || (ruleValidation !== null && !ruleValidation.isValid)}
                   className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-3 rounded-xl border-4 border-black shadow-[6px_6px_0_0_#000] hover:shadow-[8px_8px_0_0_#000] transition-all"
                 >
                  {addingRule ? (
                    <>
                      <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                      Adding Rule...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 w-5 h-5" />
                      Add Rule
                    </>
                  )}
                </Button>
              </div>

              {/* Current Rules */}
              {rules.length > 0 && (
                <div className="bg-white rounded-2xl border-4 border-black shadow-[8px_8px_0_0_#000] p-6 mb-8">
                  <h3 className="text-xl font-black text-black mb-6 flex items-center gap-2">
                    <Code className="w-6 h-6" />
                    Current Rules ({rules.length})
                  </h3>

                  <div className="space-y-4">
                    {rules.map((rule, index) => (
                      <div key={rule.id} className="bg-gray-50 border-2 border-gray-400 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="bg-purple-200 text-purple-800 px-2 py-1 rounded border border-purple-500 text-sm font-bold">
                                {rule.function_name}
                              </span>
                              <span className="text-sm font-semibold text-gray-600">
                                {rule.condition.column} {rule.condition.operator} "{rule.condition.value}"
                              </span>
                            </div>
                            <div className="bg-black text-green-400 p-3 rounded border-2 border-gray-600 font-mono text-sm">
                              <pre className="whitespace-pre-wrap">{rule.preview}</pre>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleRemoveRule(rule.id)}
                            className="ml-4 bg-red-600 hover:bg-red-700 text-white border-2 border-black shadow-[3px_3px_0_0_#000] hover:shadow-[4px_4px_0_0_#000]"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <div className="text-center">
                <Button
                  onClick={handleGenerateMeTTa}
                  disabled={rules.length === 0 || loadingMeTTa}
                  className="bg-green-600 hover:bg-green-700 text-white font-black px-8 py-4 rounded-xl border-4 border-black shadow-[8px_8px_0_0_#000] hover:shadow-[12px_12px_0_0_#000] transition-all transform hover:scale-105"
                >
                  {loadingMeTTa ? (
                    <>
                      <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 w-5 h-5" />
                      Generate MeTTa File
                    </>
                  )}
                </Button>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-100 border-4 border-red-500 rounded-lg p-4 mt-6">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-700" />
                    <span className="font-bold text-red-800">{error}</span>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Step 3: MeTTa Preview & Download */}
        {currentStep === 3 && mettaData && (
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Success Header */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 rounded-full px-6 py-3 border-4 border-green-600 shadow-[6px_6px_0_0_#000] mb-6">
                <CheckCircle className="w-6 h-6" />
                <span className="text-lg font-black">MeTTa File Generated Successfully!</span>
              </div>
              <h2 className="text-3xl font-black text-black mb-4">Step 3: MeTTa Preview & Download</h2>
            </div>

            {/* File Stats */}
            <Card className="p-6 border-4 border-black shadow-[8px_8px_0_0_#000] bg-gradient-to-br from-blue-50 to-purple-50">
              <h3 className="text-xl font-black text-black mb-4 flex items-center gap-2">
                📊 File Statistics
              </h3>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-white border-2 border-gray-400 rounded-lg p-4 text-center">
                  <div className="text-2xl font-black text-purple-700">{mettaData.lines_count}</div>
                  <div className="text-sm font-bold text-gray-600">Lines</div>
                </div>
                <div className="bg-white border-2 border-gray-400 rounded-lg p-4 text-center">
                  <div className="text-2xl font-black text-green-700">{mettaData.facts_count}</div>
                  <div className="text-sm font-bold text-gray-600">Facts</div>
                </div>
                <div className="bg-white border-2 border-gray-400 rounded-lg p-4 text-center">
                  <div className="text-2xl font-black text-blue-700">{mettaData.rules_count}</div>
                  <div className="text-sm font-bold text-gray-600">Rules</div>
                </div>
                <div className="bg-white border-2 border-gray-400 rounded-lg p-4 text-center">
                  <div className="text-2xl font-black text-orange-700">{(mettaData.file_size / 1024).toFixed(1)}</div>
                  <div className="text-sm font-bold text-gray-600">KB Size</div>
                </div>
              </div>
            </Card>

            {/* MeTTa Content Preview */}
            <Card className="p-6 border-4 border-black shadow-[8px_8px_0_0_#000] bg-gradient-to-br from-gray-50 to-black">
              <h3 className="text-xl font-black text-black mb-4 flex items-center gap-2">
                <Code className="w-6 h-6" />
                Generated MeTTa File Preview
              </h3>
              <div className="bg-black border-4 border-gray-600 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap leading-relaxed">
                  {mettaData.metta_content}
                </pre>
              </div>
            </Card>

            {/* Query Execution */}
            <Card className="p-6 border-4 border-black shadow-[8px_8px_0_0_#000] bg-gradient-to-br from-yellow-50 to-orange-50">
              <h3 className="text-xl font-black text-black mb-4 flex items-center gap-2">
                🧪 Test Your MeTTa Rules
              </h3>
              
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  MeTTa Query
                </label>
                <div className="flex gap-4">
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter MeTTa query... (e.g., !(findUser $x))"
                    className="flex-1 border-4 border-black shadow-[4px_4px_0_0_#000] focus:shadow-[6px_6px_0_0_#000] font-mono"
                  />
                  <Button
                    onClick={handleExecuteQuery}
                    disabled={executingQuery || !query.trim()}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-black px-6 py-3 rounded-xl border-4 border-black shadow-[6px_6px_0_0_#000] hover:shadow-[8px_8px_0_0_#000] transition-all"
                  >
                    {executingQuery ? (
                      <>
                        <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                        Executing...
                      </>
                    ) : (
                      <>
                        <Code className="mr-2 w-5 h-5" />
                        Execute
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Query Examples */}
              <div className="mb-6">
                <p className="text-sm font-bold text-gray-700 mb-2">💡 Try these example queries:</p>
                <div className="grid md:grid-cols-2 gap-2">
                  {[
                    '!(findUser $x)',
                    '!(match &self (Name $x $y) ($x $y))',
                    '!(canVote Julia)',
                    '!(processNumber 5)'
                  ].map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setQuery(example)}
                      className="text-left p-2 bg-white border-2 border-gray-400 rounded hover:border-black hover:shadow-[2px_2px_0_0_#000] transition-all text-sm font-mono"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              {/* Query Results */}
              {queryResult && (
                <div className="bg-green-100 border-4 border-green-500 rounded-lg p-4">
                  <h4 className="font-black text-green-800 mb-3">🎯 Query Results</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-green-700">Query:</span>
                      <code className="bg-white px-2 py-1 rounded border border-green-400 text-sm font-mono">
                        {queryResult.query}
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-green-700">Results:</span>
                      <span className="text-green-800 font-semibold">
                        {queryResult.results.length > 0 
                          ? queryResult.results.join(', ') 
                          : 'No results found'
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-green-700">Execution Time:</span>
                      <span className="text-green-800 font-semibold">{queryResult.execution_time}</span>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleDownloadMeTTa}
                className="bg-purple-600 hover:bg-purple-700 text-white font-black px-8 py-4 rounded-xl border-4 border-black shadow-[8px_8px_0_0_#000] hover:shadow-[12px_12px_0_0_#000] transition-all transform hover:scale-105"
              >
                <Upload className="mr-2 w-5 h-5" />
                Download .metta File
              </Button>
              
              <Button
                onClick={handlePrintTerminal}
                disabled={printingTerminal}
                className="bg-gray-600 hover:bg-gray-700 text-white font-black px-8 py-4 rounded-xl border-4 border-black shadow-[8px_8px_0_0_#000] hover:shadow-[12px_12px_0_0_#000] transition-all transform hover:scale-105"
              >
                {printingTerminal ? (
                  <>
                    <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                    Printing...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 w-5 h-5" />
                    Print to Terminal
                  </>
                )}
              </Button>
            </div>

            {/* Success Message */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-100 to-blue-100 border-4 border-purple-500 rounded-2xl p-6 shadow-[8px_8px_0_0_#000]">
                <h3 className="text-2xl font-black text-purple-800 mb-2">🎉 Congratulations!</h3>
                <p className="text-lg font-bold text-purple-700">
                  You've successfully created your MeTTa knowledge base with {mettaData.rules_count} rules and {mettaData.facts_count} facts!
                </p>
                <p className="text-purple-600 mt-2">
                  Your file is ready to use in any MeTTa environment.
                </p>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-100 border-4 border-red-500 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-700" />
                  <span className="font-bold text-red-800">{error}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
