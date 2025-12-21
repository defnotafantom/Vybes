#!/usr/bin/env node
/**
 * Script to fix duplicate const declarations in a file
 * Handles multi-line declarations (arrays, objects)
 * Usage: node scripts/fix-duplicate-const.js <file-path>
 */

const fs = require('fs');
const path = require('path');

function findDeclarationEnd(lines, startIndex) {
  let braceCount = 0;
  let bracketCount = 0;
  let parenCount = 0;
  let inString = false;
  let stringChar = null;
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      const prevChar = j > 0 ? line[j - 1] : null;
      
      // Handle strings
      if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
          stringChar = null;
        }
        continue;
      }
      
      if (inString) continue;
      
      // Count brackets/braces/parens
      if (char === '{') braceCount++;
      if (char === '}') braceCount--;
      if (char === '[') bracketCount++;
      if (char === ']') bracketCount--;
      if (char === '(') parenCount++;
      if (char === ')') parenCount--;
    }
    
    // Check for semicolon on same line (end of declaration)
    const trimmed = line.trim();
    if (trimmed.endsWith(';') && braceCount === 0 && bracketCount === 0 && parenCount === 0) {
      return i + 1; // Return line number (1-based)
    }
    
    // Check if all brackets/braces are closed and we're past the first line
    if (i > startIndex && braceCount === 0 && bracketCount === 0 && parenCount === 0) {
      // Look ahead to see if next non-empty line starts a new statement
      for (let k = i + 1; k < lines.length; k++) {
        const nextLine = lines[k].trim();
        if (nextLine === '') continue;
        if (nextLine.startsWith('//') || nextLine.startsWith('*')) continue;
        // If next line starts a new declaration or statement, we're done
        return i + 1;
      }
    }
  }
  
  return lines.length;
}

function getScopeLevel(line) {
  // Count leading spaces/tabs to determine indentation level
  const match = line.match(/^(\s*)/);
  return match ? match[1].length : 0;
}

function fixDuplicateConst(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  // Find all const declarations at module/global scope only (0 indentation)
  const constDeclarations = new Map();
  const declarationsToRemove = [];
  
  lines.forEach((line, index) => {
    // Match const declarations (const name = ...)
    const match = line.match(/^(\s*)const\s+(\w+)\s*=/);
    if (match) {
      const indent = match[1].length;
      const varName = match[2];
      
      // Only process top-level (module scope) declarations (0 or minimal indentation)
      // Allow up to 2 spaces for comments/alignment, but typically 0
      if (indent <= 2) {
        const endLine = findDeclarationEnd(lines, index);
        
        if (!constDeclarations.has(varName)) {
          constDeclarations.set(varName, []);
        }
        constDeclarations.get(varName).push({
          startLine: index + 1,
          endLine: endLine,
          content: lines.slice(index, endLine).join('\n'),
          startIndex: index,
          endIndex: endLine - 1,
          indent: indent
        });
      }
    }
  });
  
  // Find duplicates (keep first occurrence, mark others for removal)
  constDeclarations.forEach((declarations, varName) => {
    if (declarations.length > 1) {
      console.log(`\nFound ${declarations.length} declarations of 'const ${varName}':`);
      declarations.forEach((decl, idx) => {
        const preview = decl.content.split('\n')[0].trim();
        console.log(`  ${idx + 1}. Lines ${decl.startLine}-${decl.endLine}: ${preview}${decl.content.includes('\n') ? '...' : ''}`);
      });
      
      // Keep the first one, remove the rest
      declarations.slice(1).forEach(decl => {
        declarationsToRemove.push(decl);
        console.log(`  ⚠️  Will remove duplicate at lines ${decl.startLine}-${decl.endLine}`);
      });
    }
  });
  
  if (declarationsToRemove.length === 0) {
    console.log('No duplicate const declarations found.');
    return;
  }
  
  // Sort by start index (descending) to remove from end to start
  declarationsToRemove.sort((a, b) => b.startIndex - a.startIndex);
  
  // Remove duplicate declarations
  const newLines = [...lines];
  declarationsToRemove.forEach(decl => {
    const numLines = decl.endIndex - decl.startIndex + 1;
    newLines.splice(decl.startIndex, numLines);
    console.log(`  ✓ Removed ${numLines} line(s) starting at line ${decl.startLine}`);
  });
  
  const newContent = newLines.join('\n');
  
  // Write backup first
  const backupPath = filePath + '.backup';
  fs.writeFileSync(backupPath, content, 'utf-8');
  console.log(`\n✓ Backup created: ${backupPath}`);
  
  // Write fixed content
  fs.writeFileSync(filePath, newContent, 'utf-8');
  console.log(`✓ Fixed file: ${filePath}`);
  console.log(`✓ Removed ${declarationsToRemove.length} duplicate declaration(s)\n`);
}

// Get file path from command line
const filePath = process.argv[2];

if (!filePath) {
  console.error('Usage: node scripts/fix-duplicate-const.js <file-path>');
  console.error('Example: node scripts/fix-duplicate-const.js "c:\\Users\\bucca\\.cursor\\worktrees\\PROJECT\\oia\\scripts\\sanitize-duplicates.cjs"');
  process.exit(1);
}

fixDuplicateConst(path.resolve(filePath));
