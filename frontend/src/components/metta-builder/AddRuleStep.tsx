"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Plus, Trash2, Code, CheckCircle, AlertCircle, Loader2, Eye } from "lucide-react"
import { type MeTTaColumn, type MeTTaRule, type MeTTaSession } from "@/services/metta"

interface AddRuleStepProps {
  columns: MeTTaColumn[]
  currentRule: MeTTaRule
  setCurrentRule: (rule: MeTTaRule) => void
  rules: MeTTaSession['rules']
  addingRule: boolean
  error: string | null
  onAddRule: () => void
  onRemoveRule: (ruleId: string) => void
  onGenerateMeTTa: () => void
  loadingMeTTa: boolean
  ruleValidation: {
    isValid: boolean
    errors: string[]
    warnings: string[]
  } | null
  onRuleChange: (rule: MeTTaRule) => void
  outputFormatBuilder: {
    prefixText: string
    suffixText: string
    valuePrefixText: string
    valueSuffixText: string
  }
  setOutputFormatBuilder: (builder: {
    prefixText: string
    suffixText: string
    valuePrefixText: string
    valueSuffixText: string
  }) => void
  generateOutputFormat: () => string
}

const getColumnTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'string':
      return 'T'
    case 'number':
      return 'N'
    case 'date':
      return 'D'
    default:
      return '?'
  }
}

const ruleTemplates = [
  {
    id: 'find-detail',
    name: 'Find Detail by ID',
    description: 'Get all details for a specific user ID',
    icon: 'ID',
    rule: {
      rule_type: 'findDetail' as const,
      function_name: 'findDetail',
      output_format: '("user" $c "is" , $x)'
    }
  },
  {
    id: 'find-by-condition',
    name: 'Find IDs by Condition',
    description: 'Find IDs where column value meets condition',
    icon: 'SEARCH',
    rule: {
      rule_type: 'findByCondition' as const,
      function_name: 'findByCondition',
      column: 'rating',
      operator: '>' as const,
      value: '6'
    }
  },
  {
    id: 'find-by-condition-full',
    name: 'Find IDs by Condition (Full Details)',
    description: 'Find IDs with condition and return full details',
    icon: 'LIST',
    rule: {
      rule_type: 'findByConditionFull' as const,
      function_name: 'findByConditionFull',
      column: 'rating',
      operator: '>' as const,
      value: '6',
      output_format: '("user" $c "is" , $value)'
    }
  },
  {
    id: 'find-user',
    name: 'Find User (Match)',
    description: 'Find users by name or ID using match pattern',
    icon: 'MATCH',
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
    icon: 'AGE',
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
    icon: 'LOC',
    rule: {
      rule_type: 'match' as const,
      function_name: 'findByLocation',
      variable_name: '$x',
      condition: { column: 'city', operator: '==' as const, value: 'New York' },
      true_action: '$x',
      false_action: '()'
    }
  }
]

export default function AddRuleStep({
  columns,
  currentRule,
  setCurrentRule,
  rules,
  addingRule,
  error,
  onAddRule,
  onRemoveRule,
  onGenerateMeTTa,
  loadingMeTTa,
  ruleValidation,
  onRuleChange,
  outputFormatBuilder,
  setOutputFormatBuilder,
  generateOutputFormat
}: AddRuleStepProps) {
  const [showRuleTemplates, setShowRuleTemplates] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const applyTemplate = (template: typeof ruleTemplates[0]) => {
    setCurrentRule(template.rule)
    setSelectedTemplate(template.id)
  }

  const renderRuleForm = () => {
    switch (currentRule.rule_type) {
      case 'findDetail':
        return (
          <div className="space-y-6">
            {/* Function Name */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Function Name
              </label>
              <Input
                value={currentRule.function_name}
                onChange={(e) => onRuleChange({
                  ...currentRule,
                  function_name: e.target.value
                })}
                placeholder="e.g., findDetail"
                className="border-4 border-black shadow-[4px_4px_0_0_#000] focus:shadow-[6px_6px_0_0_#000]"
              />
            </div>
            
            {/* Output Format Builder */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Output Format Builder
              </label>
              <div className="bg-gray-50 border-4 border-black rounded-lg p-4 shadow-[4px_4px_0_0_#000]">
                <p className="text-sm font-bold text-gray-700 mb-3">
                  Build your output format by adding text around the data:
                </p>
                
                <div className="space-y-4">
                  {/* Column Name Format */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-2">
                      Text around Column Name:
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={outputFormatBuilder.prefixText}
                        onChange={(e) => setOutputFormatBuilder(prev => ({ ...prev, prefixText: e.target.value }))}
                        placeholder="Before column"
                        className="border-2 border-gray-400 shadow-[2px_2px_0_0_#000] text-sm"
                      />
                      <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded border border-blue-500 text-xs font-bold">
                        Column Name
                      </span>
                      <Input
                        value={outputFormatBuilder.suffixText}
                        onChange={(e) => setOutputFormatBuilder(prev => ({ ...prev, suffixText: e.target.value }))}
                        placeholder="After column"
                        className="border-2 border-gray-400 shadow-[2px_2px_0_0_#000] text-sm"
                      />
                    </div>
                  </div>
                  
                  {/* Value Format */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-2">
                      Text around Value:
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={outputFormatBuilder.valuePrefixText}
                        onChange={(e) => setOutputFormatBuilder(prev => ({ ...prev, valuePrefixText: e.target.value }))}
                        placeholder="Before value"
                        className="border-2 border-gray-400 shadow-[2px_2px_0_0_#000] text-sm"
                      />
                      <span className="bg-green-200 text-green-800 px-2 py-1 rounded border border-green-500 text-xs font-bold">
                        Value
                      </span>
                      <Input
                        value={outputFormatBuilder.valueSuffixText}
                        onChange={(e) => setOutputFormatBuilder(prev => ({ ...prev, valueSuffixText: e.target.value }))}
                        placeholder="After value"
                        className="border-2 border-gray-400 shadow-[2px_2px_0_0_#000] text-sm"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Live Preview */}
                <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded border-2 border-purple-200">
                  <p className="text-xs text-purple-600 mb-1 font-bold">Live Preview:</p>
                  <code className="text-gray-800 text-sm font-mono">
                    {generateOutputFormat().split('').map((char, charIndex) => {
                      // Syntax highlighting for live preview
                      if (char === '(' || char === ')') {
                        return <span key={charIndex} className="text-purple-600 font-bold">{char}</span>
                      }
                      if (char === '!' || char === '&' || char === '$') {
                        return <span key={charIndex} className="text-blue-600 font-bold">{char}</span>
                      }
                      if (char === '"') {
                        return <span key={charIndex} className="text-green-600">{char}</span>
                      }
                      if (char === ',' || char === ';') {
                        return <span key={charIndex} className="text-orange-500">{char}</span>
                      }
                      return <span key={charIndex} className="text-gray-700">{char}</span>
                    })}
                  </code>
                </div>
                
                <p className="text-xs text-gray-600 mt-2">
                  This will create outputs like: <strong>"user" Name "is" , "John"</strong>
                </p>
              </div>
            </div>
          </div>
        )

      default:
        // Original match/flexible form and other types
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Function Name */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Function Name
                </label>
                <Input
                  value={currentRule.function_name}
                  onChange={(e) => onRuleChange({
                    ...currentRule,
                    function_name: e.target.value
                  })}
                  placeholder="e.g., findUser"
                  className="border-4 border-black shadow-[4px_4px_0_0_#000] focus:shadow-[6px_6px_0_0_#000]"
                />
              </div>

              {/* Variable Name - only for match rules */}
              {currentRule.rule_type === 'match' && (
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    Variable Name
                  </label>
                  <Input
                    value={currentRule.variable_name || ''}
                    onChange={(e) => onRuleChange({
                      ...currentRule,
                      variable_name: e.target.value
                    })}
                    placeholder="e.g., $x"
                    className="border-4 border-black shadow-[4px_4px_0_0_#000] focus:shadow-[6px_6px_0_0_#000]"
                  />
                </div>
              )}
            </div>

            {/* Column, Operator, Value for condition-based rules */}
            {(currentRule.rule_type === 'findByCondition' || currentRule.rule_type === 'findByConditionFull' || currentRule.rule_type === 'match') && (
              <div className="grid md:grid-cols-3 gap-6">
                {/* Column */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    Column
                  </label>
                  <Select
                    value={currentRule.rule_type === 'match' ? currentRule.condition?.column || '' : currentRule.column || ''}
                    onValueChange={(value) => {
                      if (currentRule.rule_type === 'match') {
                        onRuleChange({
                          ...currentRule,
                          condition: { ...currentRule.condition!, column: value }
                        })
                      } else {
                        onRuleChange({
                          ...currentRule,
                          column: value
                        })
                      }
                    }}
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
                    value={currentRule.rule_type === 'match' ? currentRule.condition?.operator || '==' : currentRule.operator || '>'}
                    onValueChange={(value: any) => {
                      if (currentRule.rule_type === 'match') {
                        onRuleChange({
                          ...currentRule,
                          condition: { ...currentRule.condition!, operator: value }
                        })
                      } else {
                        onRuleChange({
                          ...currentRule,
                          operator: value
                        })
                      }
                    }}
                  >
                    <SelectTrigger className="border-4 border-black shadow-[4px_4px_0_0_#000]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="==">&eq; (equals)</SelectItem>
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
                    value={currentRule.rule_type === 'match' ? currentRule.condition?.value || '' : currentRule.value || ''}
                    onChange={(e) => {
                      let cleanValue = e.target.value
                      if (cleanValue.startsWith('"') && cleanValue.endsWith('"') && cleanValue.length > 2) {
                        cleanValue = cleanValue.slice(1, -1)
                      }
                      if (currentRule.rule_type === 'match') {
                        onRuleChange({
                          ...currentRule,
                          condition: { ...currentRule.condition!, value: cleanValue }
                        })
                      } else {
                        onRuleChange({
                          ...currentRule,
                          value: cleanValue
                        })
                      }
                    }}
                    placeholder="e.g., 6 or John"
                    className="border-4 border-black shadow-[4px_4px_0_0_#000] focus:shadow-[6px_6px_0_0_#000]"
                  />
                </div>
              </div>
            )}

            {/* True/False Actions for match rules */}
            {currentRule.rule_type === 'match' && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* True Action */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    If TRUE, return
                  </label>
                  <Input
                    value={currentRule.true_action || ''}
                    onChange={(e) => onRuleChange({
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
                    value={currentRule.false_action || ''}
                    onChange={(e) => onRuleChange({
                      ...currentRule,
                      false_action: e.target.value
                    })}
                    placeholder="e.g., ()"
                    className="border-4 border-black shadow-[4px_4px_0_0_#000] focus:shadow-[6px_6px_0_0_#000]"
                  />
                </div>
              </div>
            )}
          </div>
        )
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="p-8 border-4 border-black shadow-[12px_12px_0_0_#000] bg-gradient-to-br from-green-50 to-purple-50">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-black mb-4">Step 2: Build Your Rules</h2>
          <p className="text-lg font-bold text-gray-700">
            Create intelligent matching rules using your data columns
          </p>
        </div>

        {/* Rule Templates */}
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
                    <span className="text-sm font-bold bg-blue-200 text-blue-800 px-2 py-1 rounded">{template.icon}</span>
                    <div>
                      <h4 className="font-black text-black">{template.name}</h4>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </div>
                  </div>
                  <div className="text-xs font-mono bg-gradient-to-r from-purple-50 to-blue-50 text-gray-800 p-2 rounded border border-purple-200">
                    <code>
                      {(() => {
                        const templateText = template.rule.rule_type === 'findDetail' 
                          ? `${template.rule.function_name}($id) → ${template.rule.output_format}`
                          : template.rule.rule_type === 'findByCondition'
                          ? `${template.rule.function_name}($x) → ${template.rule.column} ${template.rule.operator} ${template.rule.value}`
                          : template.rule.rule_type === 'findByConditionFull'
                          ? `${template.rule.function_name}($x) → ${template.rule.column} ${template.rule.operator} ${template.rule.value} + details`
                          : `${template.rule.function_name}(${template.rule.variable_name}) → ${template.rule.condition?.column} ${template.rule.condition?.operator} "${template.rule.condition?.value}"`
                        
                        return templateText.split('').map((char, charIndex) => {
                          if (char === '(' || char === ')') {
                            return <span key={charIndex} className="text-purple-600 font-bold">{char}</span>
                          }
                          if (char === '!' || char === '&' || char === '$') {
                            return <span key={charIndex} className="text-blue-600 font-bold">{char}</span>
                          }
                          if (char === '"') {
                            return <span key={charIndex} className="text-green-600">{char}</span>
                          }
                          if (char === ',' || char === ';' || char === '→') {
                            return <span key={charIndex} className="text-orange-500">{char}</span>
                          }
                          return <span key={charIndex} className="text-gray-700">{char}</span>
                        })
                      })()}
                    </code>
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

          {/* Validation Feedback */}
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

          {/* Conditional Form Rendering */}
          {renderRuleForm()}

          <Button
            onClick={onAddRule}
            disabled={addingRule || (ruleValidation !== null && !ruleValidation.isValid)}
            className="w-full mt-5 bg-purple-600 hover:bg-purple-700 text-white font-black py-3 rounded-xl border-4 border-black shadow-[6px_6px_0_0_#000] hover:shadow-[8px_8px_0_0_#000] transition-all"
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
                        <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded border border-blue-500 text-xs font-bold">
                          {rule.rule_type}
                        </span>
                        <span className="text-sm font-semibold text-gray-600">
                          {rule.rule_type === 'findDetail' 
                            ? `Get details by ID`
                            : rule.rule_type === 'findByCondition'
                            ? `${rule.column} ${rule.operator} ${rule.value}`
                            : rule.rule_type === 'findByConditionFull'
                            ? `${rule.column} ${rule.operator} ${rule.value} + details`
                            : `${rule.condition?.column} ${rule.condition?.operator} "${rule.condition?.value}"`
                          }
                        </span>
                      </div>
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-3 font-mono text-sm">
                        <pre className="whitespace-pre-wrap text-gray-800">
                          <code>
                            {rule.preview.split('').map((char, charIndex) => {
                              // Syntax highlighting for rule preview
                              if (char === '(' || char === ')') {
                                return <span key={charIndex} className="text-purple-600 font-bold">{char}</span>
                              }
                              if (char === '!' || char === '&' || char === '$') {
                                return <span key={charIndex} className="text-blue-600 font-bold">{char}</span>
                              }
                              if (char === '"') {
                                return <span key={charIndex} className="text-green-600">{char}</span>
                              }
                              if (char === ',' || char === ';') {
                                return <span key={charIndex} className="text-orange-500">{char}</span>
                              }
                              return <span key={charIndex} className="text-gray-700">{char}</span>
                            })}
                          </code>
                        </pre>
                      </div>
                    </div>
                    <Button
                      onClick={() => onRemoveRule(rule.id)}
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
            onClick={onGenerateMeTTa}
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
  )
}
