#!/usr/bin/env tsx
/**
 * Script per rimuovere duplicati di codice nei file TypeScript/JavaScript
 * 
 * Rileva e rimuove:
 * - Import duplicati
 * - Export duplicati (dynamic, const, function)
 * - Funzioni duplicate
 * - Blocchi di codice duplicati
 * 
 * Usage:
 *   npm run sanitize:duplicates          # Dry run (mostra solo)
 *   npm run sanitize:duplicates --fix    # Applica correzioni
 */

import * as fs from 'fs/promises'
import * as path from 'path'
import { readdir } from 'fs/promises'

interface DuplicateIssue {
  file: string
  type: 'import' | 'export' | 'function' | 'block'
  line: number
  content: string
  duplicateOf?: number
}

interface FileAnalysis {
  file: string
  issues: DuplicateIssue[]
  fixed: boolean
  originalContent: string
  fixedContent: string
}

interface SanitizeOperation {
  name: string
  description: string
  enabled: boolean
  detect: (content: string, filePath: string) => DuplicateIssue[]
  fix: (content: string, issues: DuplicateIssue[]) => string
}

// Operazioni di sanitizzazione configurabili
const operations: SanitizeOperation[] = [
  {
    name: 'duplicate-imports',
    description: 'Rileva e rimuove import duplicati',
    enabled: true,
    detect: (content: string, filePath: string) => {
      const issues: DuplicateIssue[] = []
      const lines = content.split('\n')
      const imports = new Map<string, number[]>()
      
      lines.forEach((line, index) => {
        const trimmed = line.trim()
        if (trimmed.startsWith('import ')) {
          const key = trimmed.replace(/\s+/g, ' ')
          if (!imports.has(key)) {
            imports.set(key, [])
          }
          imports.get(key)!.push(index + 1)
        }
      })
      
      imports.forEach((lineNumbers, importStmt) => {
        if (lineNumbers.length > 1) {
          lineNumbers.slice(1).forEach((line) => {
            issues.push({
              file: filePath,
              type: 'import',
              line,
              content: importStmt,
              duplicateOf: lineNumbers[0],
            })
          })
        }
      })
      
      return issues
    },
    fix: (content: string, issues: DuplicateIssue[]) => {
      const importIssues = issues.filter(i => i.type === 'import')
      if (importIssues.length === 0) return content
      
      const lines = content.split('\n')
      const removedLines = new Set(importIssues.map(i => i.line))
      const sorted = Array.from(removedLines).sort((a, b) => b - a)
      
      sorted.forEach(lineNum => {
        lines.splice(lineNum - 1, 1)
      })
      
      return lines.join('\n')
    },
  },
  {
    name: 'duplicate-exports',
    description: 'Rileva e rimuove export duplicati',
    enabled: true,
    detect: (content: string, filePath: string) => {
      const issues: DuplicateIssue[] = []
      const lines = content.split('\n')
      const exports = new Map<string, number[]>()
      
      lines.forEach((line, index) => {
        const trimmed = line.trim()
        if (trimmed.startsWith('export ')) {
          const normalized = trimmed
            .replace(/\s+/g, ' ')
            .replace(/=\s*['"][^'"]+['"]/g, "= '...'")
          
          if (!exports.has(normalized)) {
            exports.set(normalized, [])
          }
          exports.get(normalized)!.push(index + 1)
        }
      })
      
      exports.forEach((lineNumbers, exportStmt) => {
        if (lineNumbers.length > 1) {
          lineNumbers.slice(1).forEach((line) => {
            issues.push({
              file: filePath,
              type: 'export',
              line,
              content: exportStmt,
              duplicateOf: lineNumbers[0],
            })
          })
        }
      })
      
      return issues
    },
    fix: (content: string, issues: DuplicateIssue[]) => {
      const exportIssues = issues.filter(i => i.type === 'export')
      if (exportIssues.length === 0) return content
      
      const lines = content.split('\n')
      const removedLines = new Set(exportIssues.map(i => i.line))
      const sorted = Array.from(removedLines).sort((a, b) => b - a)
      
      sorted.forEach(lineNum => {
        lines.splice(lineNum - 1, 1)
      })
      
      return lines.join('\n')
    },
  },
  {
    name: 'duplicate-functions',
    description: 'Rileva e rimuove funzioni duplicate',
    enabled: true,
    detect: (content: string, filePath: string) => {
      const issues: DuplicateIssue[] = []
      const lines = content.split('\n')
      const functions = new Map<string, number[]>()
      
      lines.forEach((line, index) => {
        const funcMatch = line.match(/^(export\s+)?(async\s+)?function\s+(\w+)/)
        if (funcMatch) {
          const funcName = funcMatch[3]
          if (!functions.has(funcName)) {
            functions.set(funcName, [])
          }
          functions.get(funcName)!.push(index + 1)
        }
      })
      
      functions.forEach((lineNumbers, funcName) => {
        if (lineNumbers.length > 1) {
          lineNumbers.slice(1).forEach((line) => {
            issues.push({
              file: filePath,
              type: 'function',
              line,
              content: `function ${funcName}`,
              duplicateOf: lineNumbers[0],
            })
          })
        }
      })
      
      return issues
    },
    fix: (content: string, issues: DuplicateIssue[]) => {
      const functionIssues = issues.filter(i => i.type === 'function')
      if (functionIssues.length === 0) return content
      
      const lines = content.split('\n')
      const removedLines = new Set<number>()
      
      // Ordina per riga decrescente
      const sorted = [...functionIssues].sort((a, b) => b.line - a.line)
      
      sorted.forEach(issue => {
        if (removedLines.has(issue.line)) return
        
        // Trova l'inizio e la fine della funzione
        let start = issue.line - 1
        let braceCount = 0
        
        // Trova l'inizio
        for (let i = start; i >= 0; i--) {
          if (lines[i].includes('function')) {
            start = i
            break
          }
        }
        
        // Trova la fine
        let end = start
        for (let i = start; i < lines.length; i++) {
          braceCount += (lines[i].match(/{/g) || []).length
          braceCount -= (lines[i].match(/}/g) || []).length
          
          if (braceCount === 0 && i > start) {
            end = i + 1
            break
          }
        }
        
        // Rimuovi la funzione
        lines.splice(start, end - start)
        for (let i = start; i < end; i++) {
          removedLines.add(i + 1)
        }
      })
      
      return lines.join('\n')
    },
  },
]

async function findFilesRecursive(dir: string, extensions: string[]): Promise<string[]> {
  const files: string[] = []
  
  try {
    const entries = await readdir(dir, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      
      if (entry.name.startsWith('.') || 
          entry.name === 'node_modules' || 
          entry.name === '.next' || 
          entry.name === 'dist') {
        continue
      }
      
      if (entry.isDirectory()) {
        const subFiles = await findFilesRecursive(fullPath, extensions)
        files.push(...subFiles)
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name)
        if (extensions.includes(ext)) {
          files.push(fullPath)
        }
      }
    }
  } catch {
    // Ignora errori di accesso
  }
  
  return files
}

async function findFiles(): Promise<string[]> {
  const directories = ['app', 'components', 'lib', 'hooks', 'scripts']
  const extensions = ['.ts', '.tsx']
  
  const files: string[] = []
  for (const dir of directories) {
    const dirPath = path.join(process.cwd(), dir)
    try {
      const dirFiles = await findFilesRecursive(dirPath, extensions)
      files.push(...dirFiles)
    } catch {
      // Directory non esiste, skip
    }
  }
  
  return Array.from(new Set(files))
}

function detectDuplicates(content: string, filePath: string): DuplicateIssue[] {
  const allIssues: DuplicateIssue[] = []
  
  for (const operation of operations) {
    if (operation.enabled) {
      const issues = operation.detect(content, filePath)
      allIssues.push(...issues)
    }
  }
  
  return allIssues
}

function fixDuplicates(content: string, issues: DuplicateIssue[]): string {
  let fixed = content
  
  // Applica le fix in ordine inverso per evitare problemi con gli indici
  const enabledOps = operations.filter(op => op.enabled).reverse()
  
  for (const operation of enabledOps) {
    const operationIssues = issues.filter(i => {
      if (operation.name === 'duplicate-imports') return i.type === 'import'
      if (operation.name === 'duplicate-exports') return i.type === 'export'
      if (operation.name === 'duplicate-functions') return i.type === 'function'
      return false
    })
    
    if (operationIssues.length > 0) {
      fixed = operation.fix(fixed, operationIssues)
    }
  }
  
  // Rimuovi righe vuote multiple consecutive
  fixed = fixed.replace(/\n{4,}/g, '\n\n\n')
  
  return fixed
}

async function analyzeFile(filePath: string): Promise<FileAnalysis> {
  const content = await fs.readFile(filePath, 'utf-8')
  const issues = detectDuplicates(content, filePath)
  const fixedContent = issues.length > 0 ? fixDuplicates(content, issues) : content
  
  return {
    file: filePath,
    issues,
    fixed: issues.length > 0 && fixedContent !== content,
    originalContent: content,
    fixedContent,
  }
}

async function main() {
  const args = process.argv.slice(2)
  const fix = args.includes('--fix') || args.includes('-f')
  const dryRun = !fix
  
  console.log('🔍 Scanning for duplicate code...\n')
  console.log(`Enabled operations: ${operations.filter(op => op.enabled).map(op => op.name).join(', ')}\n`)
  
  const files = await findFiles()
  console.log(`Found ${files.length} files to analyze\n`)
  
  const analyses: FileAnalysis[] = []
  let totalIssues = 0
  
  for (const file of files) {
    const analysis = await analyzeFile(file)
    if (analysis.issues.length > 0) {
      analyses.push(analysis)
      totalIssues += analysis.issues.length
    }
  }
  
  if (analyses.length === 0) {
    console.log('✅ No duplicates found!')
    return
  }
  
  console.log(`\n⚠️  Found ${totalIssues} duplicate issues in ${analyses.length} files:\n`)
  
  analyses.forEach(analysis => {
    console.log(`📄 ${analysis.file}`)
    const grouped = new Map<string, DuplicateIssue[]>()
    analysis.issues.forEach(issue => {
      if (!grouped.has(issue.type)) {
        grouped.set(issue.type, [])
      }
      grouped.get(issue.type)!.push(issue)
    })
    
    Array.from(grouped.entries()).forEach(([type, issues]) => {
      console.log(`   ${type.toUpperCase()}: ${issues.length} duplicate(s)`)
      issues.slice(0, 3).forEach(issue => {
        console.log(`      Line ${issue.line}: ${issue.content.substring(0, 50)}...`)
      })
      if (issues.length > 3) {
        console.log(`      ... and ${issues.length - 3} more`)
      }
    })
    console.log()
  })
  
  if (dryRun) {
    console.log('💡 Run with --fix to apply corrections')
    console.log('   Example: npm run sanitize:duplicates -- --fix')
  } else {
    console.log('🔧 Applying fixes...\n')
    
    let fixedCount = 0
    for (const analysis of analyses) {
      if (analysis.fixed) {
        await fs.writeFile(analysis.file, analysis.fixedContent, 'utf-8')
        console.log(`✅ Fixed: ${analysis.file} (${analysis.issues.length} issues)`)
        fixedCount++
      }
    }
    
    console.log(`\n✨ Fixed ${fixedCount} files!`)
  }
}

main().catch(console.error)
