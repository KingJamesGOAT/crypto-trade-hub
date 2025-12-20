import { useState } from "react"
import { learningModules } from "@/data/learning-modules"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BookOpen, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

export function Learning() {
  const [selectedModuleId, setSelectedModuleId] = useState(learningModules[0].id)
  
  const selectedModule = learningModules.find(m => m.id === selectedModuleId) || learningModules[0]

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
                <div className="p-6 prose dark:prose-invert max-w-none">
                   <div dangerouslySetInnerHTML={{ __html: selectedModule.content.replace(/\n/g, '<br/>').replace(/# (.*)/g, '<h1 class="text-2xl font-bold mb-4">$1</h1>').replace(/## (.*)/g, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>').replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>').replace(/- (.*)/g, '<li class="ml-4 list-disc">$1</li>') }} />
                </div>
             </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
