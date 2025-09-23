"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { mettaAPI, type MeTTaColumn, type MeTTaUploadResponse, type MeTTaRule, type MeTTaRuleResponse } from "@/services/metta"
import { mettaSession, type MeTTaSession } from "@/services/mettaSession"
import { UploadStep, AddRuleStep, LoadingStep, PreviewStep } from "@/components/metta-builder"
import { useRouter } from 'next/navigation'

export default function MeTTaBuilderPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [showLoading, setShowLoading] = useState(false)
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
    false_action: '()',
    output_format: '("user" $c "is" , $x)',
    column: '',
    operator: '==',
    value: ''
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
  
  // Output Format Builder state
  const [outputFormatBuilder, setOutputFormatBuilder] = useState<{
    prefixText: string;
    suffixText: string;
    valuePrefixText: string;
    valueSuffixText: string;
  }>({
    prefixText: 'user',
    suffixText: 'is',
    valuePrefixText: '',
    valueSuffixText: ''
  })

  // Navigation handler for stacking
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setShowLoading(false)
      setError(null)
    } else {
      router.push('/innovation')
    }
  }

  // Load session on component mount
  useEffect(() => {
    // Always start from step 1 for a fresh experience
    setCurrentStep(1)
    console.log('Starting fresh MeTTa session from step 1')
  }, [])

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

    // Validate based on rule type
    switch (rule.rule_type) {
      case 'findDetail':
        if (!rule.output_format || rule.output_format.trim() === '') {
          errors.push('Output format is required for findDetail rules')
        }
        break

      case 'findByCondition':
        if (!rule.column) {
          errors.push('Column selection is required')
        }
        if (!rule.operator) {
          errors.push('Operator selection is required')
        }
        if (rule.value === '' || rule.value === undefined) {
          errors.push('Value is required')
        }
        break

      case 'findByConditionFull':
        if (!rule.column) {
          errors.push('Column selection is required')
        }
        if (!rule.operator) {
          errors.push('Operator selection is required')
        }
        if (rule.value === '' || rule.value === undefined) {
          errors.push('Value is required')
        }
        if (!rule.output_format || rule.output_format.trim() === '') {
          errors.push('Output format is required for findByConditionFull rules')
        }
        break

      case 'match':
        if (!rule.variable_name || rule.variable_name.trim() === '') {
          errors.push('Variable name is required for match rules')
        } else if (!rule.variable_name.startsWith('$')) {
          warnings.push('Variable names typically start with $ (e.g., $x, $user)')
        }
        if (!rule.condition?.column) {
          errors.push('Column selection is required')
        }
        if (!rule.condition?.operator) {
          errors.push('Operator selection is required')
        }
        if (rule.condition?.value === '') {
          errors.push('Value is required')
        }
        if (!rule.true_action || rule.true_action.trim() === '') {
          errors.push('True action is required')
        }
        if (!rule.false_action || rule.false_action.trim() === '') {
          errors.push('False action is required')
        }
        break

      case 'flexible':
        if (!rule.condition?.column) {
          errors.push('Column selection is required')
        }
        if (!rule.condition?.operator) {
          errors.push('Operator selection is required')
        }
        if (rule.condition?.value === '') {
          errors.push('Value is required')
        }
        if (!rule.true_action || rule.true_action.trim() === '') {
          errors.push('True action is required')
        }
        if (!rule.false_action || rule.false_action.trim() === '') {
          errors.push('False action is required')
        }
        break

      default:
        errors.push('Unknown rule type')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  // Helper function to format value for API (add quotes for strings)
  const formatValueForAPI = (value: string | number): string => {
    if (typeof value === 'number' || /^\d+$/.test(value.toString())) {
      return value.toString()
    }
    return `"${value}"`
  }

  // Generate output format from builder
  const generateOutputFormat = () => {
    const { prefixText, suffixText, valuePrefixText, valueSuffixText } = outputFormatBuilder
    const valueVariable = currentRule.rule_type === 'findByConditionFull' ? '$value' : '$x'
    return `("${prefixText}" $c "${suffixText}" , ${valuePrefixText ? `"${valuePrefixText}" ` : ''}${valueVariable}${valueSuffixText ? ` "${valueSuffixText}"` : ''})`
  }

  // Update output format when builder changes
  useEffect(() => {
    if (currentRule.rule_type === 'findDetail' || currentRule.rule_type === 'findByConditionFull') {
      const newFormat = generateOutputFormat()
      setCurrentRule(prev => ({ ...prev, output_format: newFormat }))
    }
  }, [outputFormatBuilder, currentRule.rule_type])

  // Phase 2: Rule Builder functions
  const handleAddRule = async () => {
    if (!sessionId) return
    
    // Validate rule before adding
    const validation = validateRule(currentRule)
    if (!validation.isValid) {
      setError(`Rule validation failed: ${validation.errors.join(', ')}`)
      return
    }
    
    setAddingRule(true)
    setError(null)
    
    try {
      // Prepare rule data based on type
      let ruleData: MeTTaRule = { ...currentRule }
      
      // For advanced templates, use the correct field structure
      if (currentRule.rule_type === 'findDetail') {
        ruleData = {
          rule_type: 'findDetail',
          function_name: currentRule.function_name,
          output_format: currentRule.output_format
        }
      } else if (currentRule.rule_type === 'findByCondition') {
        ruleData = {
          rule_type: 'findByCondition',
          function_name: currentRule.function_name,
          column: currentRule.column,
          operator: currentRule.operator,
          value: formatValueForAPI(currentRule.value || '')
        }
      } else if (currentRule.rule_type === 'findByConditionFull') {
        ruleData = {
          rule_type: 'findByConditionFull',
          function_name: currentRule.function_name,
          column: currentRule.column,
          operator: currentRule.operator,
          value: formatValueForAPI(currentRule.value || ''),
          output_format: currentRule.output_format
        }
      } else {
        // For match and flexible rules, use the original structure
        ruleData = {
          ...currentRule,
          condition: {
            ...currentRule.condition!,
            value: formatValueForAPI(currentRule.condition?.value || '')
          }
        }
      }
      
      const result: MeTTaRuleResponse = await mettaAPI.addRule(sessionId, ruleData)
      
      const newRule = {
        id: result.rule_id,
        ...ruleData,
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
        false_action: '()',
        output_format: '("user" $c "is" , $x)',
        column: '',
        operator: '==',
        value: ''
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
    
    setShowLoading(true)
    setError(null)
  }

  const handleLoadingComplete = async () => {
    if (!sessionId) return

    setLoadingMeTTa(true)
    
    try {
      const result = await mettaAPI.generateMeTTa(sessionId)
      setMettaData(result)
      setShowLoading(false)
      setCurrentStep(4) // Now step 4 is the preview
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate MeTTa file')
      setShowLoading(false)
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
      {/* Custom scrollbar styles */}
      <style jsx>{`
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        .scrollbar-thumb-gray-600::-webkit-scrollbar-thumb {
          background-color: #4B5563;
          border-radius: 4px;
        }
        .scrollbar-track-gray-800::-webkit-scrollbar-track {
          background-color: #1F2937;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 8px;
        }
      `}</style>
      <div className="max-w-6xl mx-auto px-4">
        {/* Header with Back Button */}
        <div className="flex items-center mb-8">
          <Button
            onClick={handleBack}
            variant="outline"
            className="mr-4 border-2 border-black shadow-[3px_3px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex-1 text-center">
            <h1 className="text-4xl md:text-5xl font-black text-black mb-4">
              MeTTa Rule Builder
            </h1>
            <p className="text-xl font-bold text-gray-700">
              Transform your data into intelligent recommendations
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        {!showLoading && (
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
              <span className={currentStep >= 2 ? 'text-purple-700' : 'text-gray-500'}>Add Rules</span>
              <span className={currentStep >= 3 ? 'text-purple-700' : 'text-gray-500'}>Generate</span>
              <span className={currentStep >= 4 ? 'text-purple-700' : 'text-gray-500'}>Preview</span>
            </div>
          </div>
        )}

        {/* Step Components */}
        {showLoading && (
          <LoadingStep onComplete={handleLoadingComplete} />
        )}

        {!showLoading && currentStep === 1 && (
          <UploadStep
            file={file}
            setFile={setFile}
            uploading={uploading}
            uploadResult={uploadResult}
            selectedIdColumn={selectedIdColumn}
            setSelectedIdColumn={setSelectedIdColumn}
            error={error}
            onUpload={handleUpload}
            onSetIdColumn={handleSetIdColumn}
          />
        )}

        {!showLoading && currentStep === 2 && (
          <AddRuleStep
            columns={columns}
            currentRule={currentRule}
            setCurrentRule={setCurrentRule}
            rules={rules}
            addingRule={addingRule}
            error={error}
            onAddRule={handleAddRule}
            onRemoveRule={handleRemoveRule}
            onGenerateMeTTa={handleGenerateMeTTa}
            loadingMeTTa={loadingMeTTa}
            ruleValidation={ruleValidation}
            onRuleChange={handleRuleChange}
            outputFormatBuilder={outputFormatBuilder}
            setOutputFormatBuilder={setOutputFormatBuilder}
            generateOutputFormat={generateOutputFormat}
          />
        )}

        {!showLoading && currentStep === 4 && mettaData && (
          <PreviewStep
            mettaData={mettaData}
            query={query}
            setQuery={setQuery}
            queryResult={queryResult}
            executingQuery={executingQuery}
            printingTerminal={printingTerminal}
            error={error}
            onExecuteQuery={handleExecuteQuery}
            onDownloadMeTTa={handleDownloadMeTTa}
            onPrintTerminal={handlePrintTerminal}
          />
        )}

      </div>
    </main>
  )
}