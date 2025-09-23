"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Upload, FileText, ArrowRight, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { mettaAPI, type MeTTaColumn, type MeTTaUploadResponse } from "@/services/metta"

export default function MeTTaBuilderPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<MeTTaUploadResponse | null>(null)
  const [selectedIdColumn, setSelectedIdColumn] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)

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
    if (!sessionId || !selectedIdColumn) return
    
    try {
      await mettaAPI.setIdColumn(sessionId, selectedIdColumn)
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

        {/* Placeholder for other steps */}
        {currentStep > 1 && (
          <div className="text-center py-20">
            <h2 className="text-2xl font-black text-gray-600 mb-4">
              Step {currentStep} - Coming Soon!
            </h2>
            <p className="text-gray-500">
              This step will be implemented in the next phase.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
