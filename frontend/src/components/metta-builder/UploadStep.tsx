"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Upload, FileText, ArrowRight, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { type MeTTaColumn, type MeTTaUploadResponse } from "@/services/metta"

interface UploadStepProps {
  file: File | null
  setFile: (file: File | null) => void
  uploading: boolean
  uploadResult: MeTTaUploadResponse | null
  selectedIdColumn: string
  setSelectedIdColumn: (column: string) => void
  error: string | null
  onUpload: () => void
  onSetIdColumn: () => void
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

export default function UploadStep({
  file,
  setFile,
  uploading,
  uploadResult,
  selectedIdColumn,
  setSelectedIdColumn,
  error,
  onUpload,
  onSetIdColumn
}: UploadStepProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  return (
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
                  onClick={onUpload}
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
              
              {/* Simplified File Stats */}
              <div className="bg-purple-100 border-2 border-purple-500 rounded-lg p-4 mb-6">
                <h4 className="font-black text-purple-800 mb-2">File Stats</h4>
                <p className="text-sm font-semibold text-purple-700">
                  Rows: <span className="font-black">{uploadResult.total_rows}</span>
                </p>
                <p className="text-sm font-semibold text-purple-700">
                  Columns: <span className="font-black">{uploadResult.columns.length}</span>
                </p>
              </div>

              {/* Simplified Columns Preview */}
              <div className="mb-6">
                <h4 className="font-black text-black mb-4">Detected Columns</h4>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {uploadResult.columns.map((column, index) => (
                    <div key={index} className="bg-gray-100 border-2 border-gray-400 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm bg-blue-200 text-blue-800 px-2 py-1 rounded border border-blue-500 font-bold">
                          {getColumnTypeIcon(column.type)}
                        </span>
                        <span className="font-black text-gray-800">{column.name}</span>
                        <span className="text-xs bg-gray-300 px-2 py-1 rounded border border-gray-500">
                          {column.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ID Column Selection */}
              <div className="mb-6">
                <h4 className="font-black text-black mb-4">Select ID Column</h4>
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
                    onClick={onSetIdColumn}
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
  )
}
