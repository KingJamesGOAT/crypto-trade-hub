import { useEffect, useState, useRef } from "react"
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react"
import { GLOSSARY_TERMS, type GlossaryTerm } from "@/data/glossary"
import { cn } from "@/lib/utils"

export function GlossaryModal() {
  const [isOpen, setIsOpen] = useState(false)
  
  // Search State
  const [query, setQuery] = useState("")
  const [filteredTerms, setFilteredTerms] = useState<GlossaryTerm[]>([])
  
  // View State
  const [view, setView] = useState<'search' | 'details'>('search')
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(null)
  
  // Navigation State (for keyboard arrow keys)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)

  // Toggle open with Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
      if (e.key === "Escape") {
        if (view === 'details') {
            setView('search') // Go back on Esc if in details
            setTimeout(() => inputRef.current?.focus(), 50)
        } else {
            setIsOpen(false)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [view])

  // Reset and Focus management
  useEffect(() => {
    if (isOpen) {
        setQuery("")
        setView('search')
        setSelectedIndex(0)
        setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Search Logic
  useEffect(() => {
    if (!query) {
        setFilteredTerms([])
        return
    }
    const lower = query.toLowerCase()
    
    // Sort matches: startsWith first, then includes
    const matches = GLOSSARY_TERMS.filter(t => 
        t.term.toLowerCase().includes(lower)
    ).sort((a, b) => {
        const aStarts = a.term.toLowerCase().startsWith(lower)
        const bStarts = b.term.toLowerCase().startsWith(lower)
        if (aStarts && !bStarts) return -1
        if (!aStarts && bStarts) return 1
        return 0
    })

    setFilteredTerms(matches.slice(0, 10)) // Limit to top 10 for cleaner UI
    setSelectedIndex(0) // Reset selection on new query
  }, [query])

  const selectTerm = (term: GlossaryTerm) => {
      setSelectedTerm(term)
      setView('details')
  }

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (filteredTerms.length === 0) return

    if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % filteredTerms.length)
    } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + filteredTerms.length) % filteredTerms.length)
    } else if (e.key === 'Enter') {
        e.preventDefault()
        selectTerm(filteredTerms[selectedIndex])
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/60 backdrop-blur-sm transition-all" 
        onClick={() => setIsOpen(false)}
      />

      {/* Main Modal Container */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border bg-background/80 shadow-2xl backdrop-blur-xl ring-1 ring-white/10 transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* VIEW: SEARCH MODE */}
        {view === 'search' && (
            <div className="flex flex-col h-full">
                {/* Search Header */}
                <div className="flex items-center border-b px-4 py-4 md:px-6">
                    <Search className="mr-3 h-5 w-5 text-muted-foreground" />
                    <input 
                        ref={inputRef}
                        className="flex-1 bg-transparent text-xl font-medium outline-none placeholder:text-muted-foreground/50"
                        placeholder="Search for a term..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleInputKeyDown}
                    />
                    <div className="hidden sm:flex items-center gap-2">
                         <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                            ESC to close
                        </kbd>
                    </div>
                     <button onClick={() => setIsOpen(false)} className="sm:hidden">
                        <X className="h-5 w-5 text-muted-foreground" />
                    </button>
                </div>

                {/* Results List */}
                <div className="max-h-[60vh] overflow-y-auto p-2">
                    {query === "" && (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                            <p className="text-sm font-medium">Type to explore the crypto glossary</p>
                        </div>
                    )}
                    
                    {query !== "" && filteredTerms.length === 0 && (
                         <div className="py-12 text-center text-sm text-muted-foreground">
                            No terms found for "{query}"
                        </div>
                    )}

                    <div className="space-y-1">
                        {filteredTerms.map((term, index) => (
                            <div 
                                key={term.term}
                                onClick={() => selectTerm(term)}
                                className={cn(
                                    "group flex cursor-pointer items-center justify-between rounded-xl px-4 py-3 text-sm transition-all duration-200",
                                    selectedIndex === index 
                                        ? "bg-primary/10 text-primary" 
                                        : "hover:bg-muted/50 text-foreground"
                                )}
                            >
                                <span className={cn(
                                    "font-medium text-lg", 
                                    selectedIndex === index ? "text-primary" : "text-foreground"
                                )}>
                                    {term.term}
                                </span>
                                
                                {selectedIndex === index && (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground animate-in fade-in slide-in-from-left-2 duration-200">
                                        <span>Select</span>
                                        <ChevronRight className="h-3 w-3" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                 
                 {/* Footer Hints */}
                 {filteredTerms.length > 0 && (
                    <div className="hidden md:flex border-t bg-muted/20 px-4 py-2 text-[10px] text-muted-foreground justify-between">
                         <div className="flex gap-4">
                            <span>Use arrows to navigate</span>
                            <span>Enter to select</span>
                         </div>
                    </div>
                 )}
            </div>
        )}

        {/* VIEW: DETAILS MODE */}
        {view === 'details' && selectedTerm && (
            <div className="relative flex flex-col items-center justify-center p-8 md:p-12 text-center animate-in slide-in-from-right-4 fade-in duration-300">
                
                <button 
                    onClick={() => setView('search')}
                    className="absolute left-4 top-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                </button>

                <h2 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent mt-8">
                    {selectedTerm.term}
                </h2>
                
                <div className="h-px w-24 bg-border mb-8" />

                <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
                    {selectedTerm.definition}
                </p>

                <div className="mt-12">
                     <button 
                        onClick={() => setView('search')}
                        className="inline-flex items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 text-primary px-6 py-2 text-sm font-medium transition-colors"
                     >
                        Search another term
                     </button>
                </div>
            </div>
        )}

      </div>
    </div>
  )
}

// Hook remains the same
export function useGlossary() {
    const trigger = () => {
        const event = new KeyboardEvent('keydown', {
            key: 'k',
            ctrlKey: true,
            metaKey: true,
            bubbles: true
        });
        window.dispatchEvent(event);
    }
    return { openGlossary: trigger }
}
