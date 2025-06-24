// Custom syntax highlighter for multiple languages
document.addEventListener('DOMContentLoaded', function() {
  // Language configurations
  const languages = {
    al: {
      keywords: /\b(procedure|trigger|var|begin|end|if|then|else|case|of|repeat|until|while|do|for|to|downto|exit|break|with|record|page|table|codeunit|query|report|xmlport|enum|interface|implements|extends|field|value|local|protected|internal|array|list|dictionary|action|area|group|part|keys|key|fieldgroups|fieldgroup|layout|actions|modify|pageextension|tableextension|enumextension|true|false)\b/gi,
      types: /\b(Integer|Decimal|Boolean|Text|Code|Date|Time|DateTime|Duration|BigInteger|Guid|RecordId|RecordRef|FieldRef|Variant|Option|Blob|DateFormula|BigText|Media|MediaSet|Enum)\b/g,
      functions: /\b(Message|Error|Confirm|StrSubstNo|CalcFields|CalcSums|SetRange|SetFilter|FindFirst|FindLast|FindSet|Next|Get|Insert|Modify|Delete|DeleteAll|Reset|Init|Validate|TestField|FieldError|Count|IsEmpty|Copy|TransferFields|SetAutoCalcFields|SetView|GetView|CurrentKey|SetCurrentKey|Ascending|SetAscending|LockTable|Consistent|ReadConsistency|ReadCommitted|ReadUncommitted|UpdatePropagation|Rec|xRec|CurrPage|CurrReport|CurrFieldNo|GuiAllowed|UserId|CompanyName|Today|WorkDate|CurrentDateTime)\b/g,
      strings: /(["'])(?:(?=(\\?))\2.)*?\1/g,
      comments: /\/\/.*$/gm,
      numbers: /\b\d+\.?\d*\b/g,
      operators: /(:=|<>|<=|>=|<|>|\+|-|\*|\/|=|\band\b|\bor\b|\bnot\b|\bxor\b|\bdiv\b|\bmod\b)/gi
    },
    powershell: {
      keywords: /\b(if|else|elseif|switch|foreach|for|while|do|until|break|continue|function|param|return|filter|in|throw|trap|try|catch|finally|class|enum|using|namespace|module|inherits)\b/gi,
      cmdlets: /\b(Get|Set|New|Remove|Add|Clear|Close|Copy|Enter|Exit|Find|Format|Hide|Join|Lock|Move|Out|Pop|Push|Redo|Reset|Resize|Search|Select|Show|Skip|Split|Step|Switch|Undo|Unlock|Watch|Connect|Disconnect|Read|Receive|Send|Write|Where|Sort|Tee|Import|Export|ConvertTo|ConvertFrom|Invoke|Start|Stop|Restart|Suspend|Resume|Wait|Use|Update)(-\w+)+/gi,
      variables: /\$[\w]+/g,
      strings: /(["'])(?:(?=(\\?))\2.)*?\1|@["'][\s\S]*?["']@/g,
      comments: /#.*$/gm,
      numbers: /\b\d+\.?\d*\b/g,
      operators: /(-eq|-ne|-gt|-lt|-le|-ge|-like|-notlike|-match|-notmatch|-replace|-contains|-notcontains|-in|-notin|-band|-bor|-bxor|-bnot|-and|-or|-not|-split|-join|%|\+|-|\*|\/|=)/gi
    },
    json: {
      properties: /"([^"\\]|\\.)*"(?=\s*:)/g, // Keys (property names)
      strings: /:\s*(["'])(?:(?=(\\?))\2.)*?\1/g, // String values after colon
      numbers: /:\s*(-?\d+\.?\d*([eE][+-]?\d+)?)\b/g, // Number values after colon
      keywords: /:\s*(true|false|null)\b/g, // Boolean/null values after colon
      punctuation: /[{}\[\],]/g // Braces, brackets, commas
    },
    python: {
      keywords: /\b(and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield|None|True|False)\b/g,
      builtins: /\b(abs|all|any|ascii|bin|bool|breakpoint|bytearray|bytes|callable|chr|classmethod|compile|complex|delattr|dict|dir|divmod|enumerate|eval|exec|filter|float|format|frozenset|getattr|globals|hasattr|hash|help|hex|id|input|int|isinstance|issubclass|iter|len|list|locals|map|max|memoryview|min|next|object|oct|open|ord|pow|print|property|range|repr|reversed|round|set|setattr|slice|sorted|staticmethod|str|sum|super|tuple|type|vars|zip)\b/g,
      functions: /\b([a-zA-Z_]\w*)\s*(?=\()/g,
      strings: /(["'])(?:(?=(\\?))\2.)*?\1|'''[\s\S]*?'''|"""[\s\S]*?"""/g,
      comments: /#.*$/gm,
      numbers: /\b\d+\.?\d*([eE][+-]?\d+)?\b/g,
      decorators: /@\w+/g
    },
    csharp: {
      keywords: /\b(abstract|as|base|bool|break|byte|case|catch|char|checked|class|const|continue|decimal|default|delegate|do|double|else|enum|event|explicit|extern|false|finally|fixed|float|for|foreach|goto|if|implicit|in|int|interface|internal|is|lock|long|namespace|new|null|object|operator|out|override|params|private|protected|public|readonly|ref|return|sbyte|sealed|short|sizeof|stackalloc|static|string|struct|switch|this|throw|true|try|typeof|uint|ulong|unchecked|unsafe|ushort|using|virtual|void|volatile|while|async|await|dynamic|var|nameof|when|where|yield)\b/g,
      types: /\b(bool|byte|char|decimal|double|float|int|long|object|sbyte|short|string|uint|ulong|ushort|void|var)\b/g,
      functions: /\b([a-zA-Z_]\w*)\s*(?=\()/g,
      strings: /@"[^"]*"|"(?:[^"\\]|\\.)*"/g,
      comments: /\/\/.*$|\/\*[\s\S]*?\*\//gm,
      numbers: /\b\d+\.?\d*[fFdDmM]?\b/g,
      attributes: /\[\w+(?:\([^)]*\))?\]/g
    },
    xml: {
      tags: /<\/?[\w:.-]+|\/>/g,
      attributes: /\s+[\w:.-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'))?/g,
      strings: /(["'])(?:(?=(\\?))\2.)*?\1/g,
      comments: /<!--[\s\S]*?-->/g,
      cdata: /<!\[CDATA\[[\s\S]*?\]\]>/g
    },
    sql: {
      keywords: /\b(select|from|where|join|inner|left|right|full|outer|on|as|order|by|group|having|union|all|insert|into|values|update|set|delete|create|table|alter|drop|index|view|trigger|procedure|function|declare|begin|end|if|then|else|case|when|while|for|return|commit|rollback|transaction|grant|revoke|with|distinct|top|limit|offset|exists|between|in|like|is|null|not|and|or|asc|desc|primary|key|foreign|references|constraint|default|unique|check)\b/gi,
      functions: /\b(count|sum|avg|min|max|round|floor|ceiling|abs|coalesce|nullif|cast|convert|substring|left|right|len|length|trim|ltrim|rtrim|upper|lower|replace|charindex|patindex|dateadd|datediff|getdate|year|month|day)\b/gi,
      strings: /(["'])(?:(?=(\\?))\2.)*?\1/g,
      comments: /--.*$|\/\*[\s\S]*?\*\//gm,
      numbers: /\b\d+\.?\d*\b/g,
      operators: /(=|<>|!=|<|>|<=|>=|\+|-|\*|\/|%)/g
    },
    md: {
      headers: /^#{1,6}\s+.+$/gm,
      bold: /\*\*[^*]+\*\*|__[^_]+__/g,
      italic: /\*[^*]+\*|_[^_]+_/g,
      code: /`[^`]+`/g,
      links: /\[([^\]]+)\]\(([^)]+)\)/g,
      lists: /^[\s]*[-*+]\s+.+$/gm,
      blockquotes: /^>\s+.+$/gm
    },
    css: {
      selectors: /[.#]?[\w-]+(?:\s*,\s*[.#]?[\w-]+)*\s*(?=\{)/g,
      properties: /[\w-]+(?=\s*:)/g,
      values: /:\s*([^;]+);/g,
      keywords: /\b(important|inherit|initial|unset|auto|none)\b/g,
      functions: /\b(rgb|rgba|hsl|hsla|url|calc|var|min|max|clamp|linear-gradient|radial-gradient)\b/g,
      units: /\b\d+(?:px|em|rem|%|vh|vw|vmin|vmax|ch|ex|mm|cm|in|pt|pc|deg|rad|turn|s|ms)\b/g,
      colors: /#[0-9a-fA-F]{3,8}\b/g,
      strings: /(["'])(?:(?=(\\?))\2.)*?\1/g,
      comments: /\/\*[\s\S]*?\*\//g,
      numbers: /\b\d+\.?\d*\b/g
    }
  };

  // Helper function to escape HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Helper function to apply syntax highlighting
  function highlightSyntax(code, language) {
    const config = languages[language];
    if (!config) return escapeHtml(code);

    // Special handling for JSON to properly color keys vs values
    if (language === 'json') {
      return highlightJson(code);
    }

    // Create a unique placeholder system
    const placeholders = new Map();
    let placeholderIndex = 0;
    let processedCode = code;

    // Process patterns in specific order to handle overlaps correctly
    const patternOrder = ['comments', 'properties', 'strings', 'keywords', 'types', 'builtins', 'functions', 'cmdlets', 
                         'numbers', 'operators', 'variables', 'attributes', 'decorators',
                         'tags', 'cdata', 'headers', 'bold', 'italic', 'links', 'lists', 'blockquotes', 'code',
                         'punctuation', 'selectors', 'values', 'units', 'colors'];

    patternOrder.forEach(patternType => {
      if (!config[patternType]) return;
      
      const pattern = config[patternType];
      const className = getSyntaxClass(patternType, language);
      
      processedCode = processedCode.replace(new RegExp(pattern.source, pattern.flags), (match) => {
        const placeholder = `__HIGHLIGHT_${placeholderIndex}__`;
        placeholders.set(placeholder, `<span class="${className}">${escapeHtml(match)}</span>`);
        placeholderIndex++;
        return placeholder;
      });
    });

    // Escape any remaining unprocessed code
    processedCode = processedCode.replace(/(?!__HIGHLIGHT_\d+__)[^_]+|_(?!_HIGHLIGHT_)|__(?!HIGHLIGHT_)/g, (match) => {
      return escapeHtml(match);
    });

    // Replace all placeholders with their highlighted versions
    placeholders.forEach((value, key) => {
      processedCode = processedCode.replace(key, value);
    });

    return processedCode;
  }
  
  // Special JSON highlighter
  function highlightJson(code) {
    // First escape the code
    let result = escapeHtml(code);
    
    // Replace strings with placeholders to handle them properly
    const stringPlaceholders = new Map();
    let stringIndex = 0;
    
    // Extract all strings and replace with placeholders
    result = result.replace(/"([^"\\]|\\.)*"/g, (match) => {
      const placeholder = `__STRING_${stringIndex}__`;
      stringPlaceholders.set(placeholder, match);
      stringIndex++;
      return placeholder;
    });
    
    // Now process the placeholders
    stringPlaceholders.forEach((value, key) => {
      // Check if this string is followed by a colon (making it a property key)
      const regex = new RegExp(key + '\\s*:', 'g');
      if (result.match(regex)) {
        // It's a property key
        result = result.replace(key, `<span class="syntax-property">${value}</span>`);
      } else {
        // It's a string value
        result = result.replace(key, `<span class="syntax-string">${value}</span>`);
      }
    });
    
    // Handle numbers (not inside strings)
    result = result.replace(/\b(-?\d+\.?\d*([eE][+-]?\d+)?)\b/g, (match) => {
      return `<span class="syntax-number">${match}</span>`;
    });
    
    // Handle booleans and null
    result = result.replace(/\b(true|false|null)\b/g, (match) => {
      return `<span class="syntax-keyword">${match}</span>`;
    });
    
    // Handle structural elements
    result = result.replace(/[{}\[\],]/g, (match) => {
      return `<span class="syntax-punctuation">${match}</span>`;
    });
    
    // Handle colons
    result = result.replace(/:/g, '<span class="syntax-punctuation">:</span>');
    
    return result;
  }

  // Get appropriate syntax class based on type
  function getSyntaxClass(type, language) {
    const classMap = {
      keywords: 'syntax-keyword',
      types: 'syntax-type',
      functions: 'syntax-function',
      cmdlets: 'syntax-function',
      builtins: 'syntax-builtin',
      strings: 'syntax-string',
      comments: 'syntax-comment',
      numbers: 'syntax-number',
      operators: 'syntax-operator',
      variables: 'syntax-variable',
      properties: 'syntax-property',
      tags: 'syntax-tag',
      attributes: 'syntax-attribute',
      decorators: 'syntax-decorator',
      headers: 'syntax-keyword',
      bold: 'syntax-keyword',
      italic: 'syntax-variable',
      code: 'syntax-string',
      links: 'syntax-function',
      lists: 'syntax-operator',
      blockquotes: 'syntax-comment',
      cdata: 'syntax-string',
      selectors: 'syntax-type',
      values: 'syntax-string',
      units: 'syntax-number',
      colors: 'syntax-string'
    };
    return classMap[type] || 'syntax-punctuation';
  }

  // Find all code blocks - both new format and Jekyll/Rouge format
  const codeElements = document.querySelectorAll('pre code, .highlight pre code');
  
  codeElements.forEach(function(codeElement) {
    let preElement = codeElement.parentElement;
    if (!preElement || preElement.tagName !== 'PRE') return;
    
    // Check if this is wrapped in Jekyll's highlight div
    let isJekyllHighlight = false;
    let highlightDiv = null;
    if (preElement.parentElement && preElement.parentElement.classList.contains('highlight')) {
      isJekyllHighlight = true;
      highlightDiv = preElement.parentElement;
    }
    
    // Extract language from various sources
    let language = null;
    
    // Try to get from code element classes
    const codeClasses = Array.from(codeElement.classList);
    for (const cls of codeClasses) {
      if (cls.startsWith('language-')) {
        language = cls.replace('language-', '');
        break;
      }
    }
    
    // If not found, try parent divs for Jekyll structure
    if (!language && isJekyllHighlight) {
      const parentDiv = highlightDiv.parentElement;
      if (parentDiv) {
        const parentClasses = Array.from(parentDiv.classList);
        for (const cls of parentClasses) {
          if (cls.startsWith('language-')) {
            language = cls.replace('language-', '');
            break;
          }
        }
      }
    }
    
    // Skip if no language detected
    if (!language) return;
    
    // Map common language variations
    const languageMap = {
      'al': 'al',
      'powershell': 'powershell',
      'ps1': 'powershell',
      'json': 'json',
      'python': 'python',
      'py': 'python',
      'csharp': 'csharp',
      'cs': 'csharp',
      'xml': 'xml',
      'sql': 'sql',
      'md': 'md',
      'markdown': 'md',
      'css': 'css',
      'scss': 'css',
      'sass': 'css'
    };
    
    language = languageMap[language.toLowerCase()] || language;
    
    // Apply syntax highlighting if supported
    if (languages[language]) {
      const originalCode = codeElement.textContent;
      const highlightedCode = highlightSyntax(originalCode, language);
      codeElement.innerHTML = highlightedCode;
    }
    
    // Add language class to code element if missing (for Jekyll blocks)
    if (!codeElement.classList.contains(`language-${language}`)) {
      codeElement.classList.add(`language-${language}`);
    }
    
    // Create wrapper div for proper styling
    const wrapperDiv = document.createElement('div');
    wrapperDiv.className = 'code-block-wrapper';
    
    // Create header div
    const headerDiv = document.createElement('div');
    headerDiv.className = 'code-header';
    
    // Language labels
    const languageLabels = {
      'al': 'AL - Business Central Development',
      'powershell': 'PowerShell - VS Code',
      'json': 'JSON Configuration - VS Code',
      'python': 'Python - VS Code',
      'csharp': 'C# - VS Code',
      'xml': 'XML - VS Code',
      'sql': 'SQL - VS Code',
      'md': 'Markdown - VS Code',
      'css': 'CSS - VS Code'
    };
    
    const languageLabel = document.createElement('span');
    languageLabel.textContent = languageLabels[language] || language.toUpperCase() + ' - VS Code';
    headerDiv.appendChild(languageLabel);
    
    // Create copy button
    const copyButton = document.createElement('button');
    copyButton.className = 'copy-button';
    copyButton.textContent = 'Copy';
    
    // Add click event
    copyButton.addEventListener('click', function() {
      const text = codeElement.textContent || codeElement.innerText;
      
      // Copy to clipboard
      navigator.clipboard.writeText(text).then(function() {
        // Show success
        copyButton.textContent = 'Copied!';
        copyButton.classList.add('copied');
        
        // Reset after 2 seconds
        setTimeout(function() {
          copyButton.textContent = 'Copy';
          copyButton.classList.remove('copied');
        }, 2000);
      }).catch(function(err) {
        console.error('Failed to copy:', err);
        copyButton.textContent = 'Failed';
        setTimeout(function() {
          copyButton.textContent = 'Copy';
        }, 2000);
      });
    });
    
    // Add button to header
    headerDiv.appendChild(copyButton);
    
    // Build the structure
    wrapperDiv.appendChild(headerDiv);
    
    // Handle Jekyll highlight structure
    if (isJekyllHighlight) {
      // Replace the entire Jekyll structure
      const grandParent = highlightDiv.parentElement;
      grandParent.parentNode.insertBefore(wrapperDiv, grandParent);
      wrapperDiv.appendChild(preElement);
      grandParent.remove(); // Remove the old Jekyll wrapper
    } else {
      // Insert wrapper before pre element
      preElement.parentNode.insertBefore(wrapperDiv, preElement);
      wrapperDiv.appendChild(preElement);
    }
  });
  
  // Add PowerShell prompt to PowerShell one-liners
  const psCodeElements = document.querySelectorAll('code.language-powershell');
  psCodeElements.forEach(function(code) {
    if (code.parentElement.tagName !== 'PRE') {
      // This is inline code, skip
      return;
    }
    // Check if the first line looks like a command (not a script)
    const lines = code.textContent.split('\n');
    if (lines.length <= 3 && !lines[0].includes('{') && !lines[0].includes('function')) {
      // Add PS> prompt
      const prompt = document.createElement('span');
      prompt.className = 'ps-prompt';
      prompt.textContent = 'PS> ';
      prompt.style.color = '#ffff00';
      prompt.style.fontWeight = 'bold';
      code.insertBefore(prompt, code.firstChild);
    }
  });
  
  // Smooth scrolling for TOC links
  document.querySelectorAll('.post-toc a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        // Calculate scroll position with offset for fixed headers
        const offset = 80; // Adjust this value based on your header height
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
        
        // Update URL without jumping
        history.pushState(null, null, '#' + targetId);
      }
    });
  });
});