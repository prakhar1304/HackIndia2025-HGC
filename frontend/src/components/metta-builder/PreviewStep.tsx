"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { CheckCircle, AlertCircle, Loader2, Code } from "lucide-react"

interface MeTTaData {
  metta_content: string
  file_size: number
  lines_count: number
  facts_count: number
  rules_count: number
  download_url: string
}

interface QueryResult {
  query: string
  results: string[]
  execution_time: string
  message: string
}

interface PreviewStepProps {
  mettaData: MeTTaData
  query: string
  setQuery: (query: string) => void
  queryResult: QueryResult | null
  executingQuery: boolean
  printingTerminal: boolean
  error: string | null
  onExecuteQuery: () => void
  onDownloadMeTTa: () => void
  onPrintTerminal: () => void
}

export default function PreviewStep({
  mettaData,
  query,
  setQuery,
  queryResult,
  executingQuery,
  printingTerminal,
  error,
  onExecuteQuery,
  onDownloadMeTTa,
  onPrintTerminal
}: PreviewStepProps) {
  return (
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
          File Statistics
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
            <div className="text-2xl font-black text-orange-700">{(mettaData.file_size / 1024).toFixed(1)}</div>
            <div className="text-sm font-bold text-gray-600">KB Size</div>
          </div>
        </div>
      </Card>

      {/* Enhanced MeTTa Content Preview */}
      <Card className="p-6 border-4 border-black shadow-[8px_8px_0_0_#000] bg-gradient-to-br from-gray-50 to-purple-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black text-black flex items-center gap-2">
            <Code className="w-6 h-6" />
            Generated MeTTa File Preview
          </h3>
        
        </div>
        
        {/* File Info Bar */}
        <div className="bg-white border-2 border-gray-400 rounded-lg p-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm font-bold text-gray-700">
            <span>File: <span className="text-gray-900">knowledge_base.metta</span></span>
            <span>Lines: <span className="text-gray-900">{mettaData.lines_count}</span></span>
            <span>Size: <span className="text-gray-900">{(mettaData.file_size / 1024).toFixed(1)} KB</span></span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigator.clipboard.writeText(mettaData.metta_content)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded border-2 border-black shadow-[2px_2px_0_0_#000] hover:shadow-[3px_3px_0_0_#000] transition-all text-xs font-bold"
            >
              Copy Code
            </button>
          </div>
        </div>

        {/* Enhanced Code Preview */}
        <div className="relative">
          {/* Code Editor Header */}
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 border-4 border-purple-300 rounded-t-lg px-4 py-3 flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
            <span className="text-purple-800 font-mono text-sm font-bold">knowledge_base.metta</span>
            <div className="flex-1"></div>
            <span className="text-purple-600 text-xs font-bold bg-white px-2 py-1 rounded border border-purple-300">MeTTa Editor</span>
          </div>
          
          {/* Code Content */}
          <div className="bg-gradient-to-br from-gray-50 to-purple-50 border-x-4 border-b-4 border-purple-300 rounded-b-lg">
            <div className="p-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-400 scrollbar-track-purple-100">
              <pre className="text-sm font-mono whitespace-pre-wrap leading-relaxed">
                <code className="text-gray-800">
                  {mettaData.metta_content.split('\n').map((line, index) => (
                    <div key={index} className="flex">
                      <span className="text-purple-400 mr-3 select-none text-xs w-8 text-right">
                        {String(index + 1).padStart(2, ' ')}
                      </span>
                      <span className="flex-1">
                        {line.split('').map((char, charIndex) => {
                          // Basic syntax highlighting for MeTTa
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
                      </span>
                    </div>
                  ))}
                </code>
              </pre>
            </div>
          </div>
          
          {/* Code Stats Footer */}
          <div className="mt-2 flex items-center justify-between text-xs text-purple-600">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                Facts: {mettaData.facts_count}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                Lines: {mettaData.lines_count}
              </span>
            </div>
            <span className="text-purple-500 font-bold">Ready for MeTTa Interpreter</span>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button 
            onClick={() => navigator.clipboard.writeText(mettaData.metta_content)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg border-2 border-black shadow-[3px_3px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] transition-all text-sm font-bold"
          >
            Copy All Code
          </button>
          <button 
            onClick={onDownloadMeTTa}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg border-2 border-black shadow-[3px_3px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] transition-all text-sm font-bold"
          >
            Download File
          </button>
          {/* <button 
            onClick={onPrintTerminal}
            disabled={printingTerminal}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg border-2 border-black shadow-[3px_3px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] transition-all text-sm font-bold disabled:opacity-50"
          >
            {printingTerminal ? 'Printing...' : 'Print to Terminal'}
          </button> */}
        </div>
      </Card>

      {/* Query Execution */}
      <Card className="p-6 border-4 border-black shadow-[8px_8px_0_0_#000] bg-gradient-to-br from-yellow-50 to-orange-50">
        <h3 className="text-xl font-black text-black mb-4 flex items-center gap-2">
          Test Your Own MeTTa Rules
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
              onClick={onExecuteQuery}
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
          <p className="text-sm font-bold text-gray-700 mb-3">Try these example queries:</p>
          
          {/* Advanced Function Examples */}
          <div className="mb-4">
            <p className="text-sm font-bold text-blue-700 mb-2">New Advanced Functions:</p>
            <div className="grid md:grid-cols-3 gap-2">
              {[
                { query: '!(findDetail 1)', desc: 'Get all details for user ID 1' },
                { query: '!(findByCondition Rating)', desc: 'Find IDs where rating > 6' },
                { query: '!(findByConditionFull Rating)', desc: 'Get full details for high ratings' }
              ].map((example, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(example.query)}
                  className="text-left p-3 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 rounded hover:border-blue-500 hover:shadow-[2px_2px_0_0_#000] transition-all text-sm"
                >
                  <div className="font-mono text-gray-800 font-bold mb-1">
                    <code>
                      {example.query.split('').map((char, charIndex) => {
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
                  <div className="text-xs text-blue-600">{example.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Traditional Function Examples */}
          {/* <div>
            <p className="text-sm font-bold text-gray-700 mb-2">Traditional Functions:</p>
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
                        className="text-left p-2 bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-300 rounded hover:border-gray-500 hover:shadow-[2px_2px_0_0_#000] transition-all text-sm font-mono"
                      >
                        <code>
                          {example.split('').map((char, charIndex) => {
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
                      </button>
              ))}
            </div>
          </div> */}
        </div>

        {/* Query Results */}
        {queryResult && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border-4 border-green-300 rounded-lg p-4">
            <h4 className="font-black text-green-800 mb-3">Query Results</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-green-700">Query:</span>
                <code className="bg-white px-2 py-1 rounded border border-green-300 text-sm font-mono">
                  <span>
                    {queryResult.query.split('').map((char, charIndex) => {
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
                  </span>
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
  )
}
