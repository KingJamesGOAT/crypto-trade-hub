import { useState } from "react"
import { learningModules, type LearningModule } from "@/data/learning-modules"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BookOpen, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

import { QuizInteractive } from "@/components/QuizInteractive"

export function Learning() {
  const [selectedModuleId, setSelectedModuleId] = useState(learningModules[0].id)
  
  const selectedModule: LearningModule = learningModules.find(m => m.id === selectedModuleId) || learningModules[0]

  return (
    <div className="h-full flex flex-col space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Learning Center</h2>
        <p className="text-muted-foreground">
          Master cryptocurrency trading from fundamentals to advanced strategies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
        {/* Module List */}
        <Card className="col-span-1 border-r h-full flex flex-col">
          <CardHeader>
            <CardTitle>Modules</CardTitle>
            <CardDescription>Select a topic to begin</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden">
             <ScrollArea className="h-full">
               <div className="space-y-1 p-2">
                  {learningModules.map((module) => (
                    <Button
                      key={module.id}
                      variant={selectedModuleId === module.id ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start h-auto py-4 px-4 text-left",
                        selectedModuleId === module.id && "bg-secondary"
                      )}
                      onClick={() => setSelectedModuleId(module.id)}
                    >
                      <div className="flex flex-col items-start gap-1">
                        <div className="font-semibold">{module.title}</div>
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {module.description}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          {module.readTime}
                        </div>
                      </div>
                    </Button>
                  ))}
               </div>
             </ScrollArea>
          </CardContent>
        </Card>

        {/* Content View */}
        <Card className="col-span-1 md:col-span-2 h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              {selectedModule.title}
            </CardTitle>
            <CardDescription>{selectedModule.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
             <ScrollArea className="h-full">
                   <div className="space-y-6 p-8 max-w-4xl mx-auto">
                     <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({node, ...props}: any) => <h1 className="text-3xl font-bold tracking-tight border-b pb-4 mt-8 mb-4 text-foreground" {...props} />,
                          h2: ({node, ...props}: any) => <h2 className="text-2xl font-semibold tracking-tight mt-8 mb-4 text-foreground" {...props} />,
                          h3: ({node, ...props}: any) => <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground" {...props} />,
                          p: ({node, ...props}: any) => <p className="leading-7 text-muted-foreground [&:not(:first-child)]:mt-4" {...props} />,
                          ul: ({node, ...props}: any) => <ul className="my-6 ml-6 list-disc [&>li]:mt-2 text-muted-foreground" {...props} />,
                          ol: ({node, ...props}: any) => <ol className="my-6 ml-6 list-decimal [&>li]:mt-2 text-muted-foreground" {...props} />,
                          li: ({node, ...props}: any) => <li {...props} />,
                          blockquote: ({node, ...props}: any) => (
                             <blockquote className="mt-6 border-l-4 border-blue-500 pl-6 italic bg-blue-500/10 p-4 rounded-r-lg text-muted-foreground" {...props} />
                          ),
                          code: ({node, ...props}: any) => (
                             <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold" {...props} />
                          ),
                          table: ({node, ...props}: any) => (
                             <div className="my-6 w-full overflow-y-auto">
                               <table className="w-full border-collapse border border-border text-sm" {...props} />
                             </div>
                          ),
                          thead: ({node, ...props}: any) => <thead className="bg-muted" {...props} />,
                          tr: ({node, ...props}: any) => <tr className="border-b border-border m-0 p-0 even:bg-muted/50" {...props} />,
                          th: ({node, ...props}: any) => <th className="border border-border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right" {...props} />,
                          td: ({node, ...props}: any) => <td className="border border-border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right" {...props} />,
                          hr: ({node, ...props}: any) => <hr className="my-8 border-border" {...props} />,
                          strong: ({node, ...props}: any) => <strong className="font-bold text-foreground" {...props} />,
                        }}
                     >
                       {selectedModule.content}
                     </ReactMarkdown>

                     {/* Quiz Section */}
                     {selectedModule.quiz && (
                        <QuizInteractive questions={selectedModule.quiz} />
                     )}
                   </div>
             </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
