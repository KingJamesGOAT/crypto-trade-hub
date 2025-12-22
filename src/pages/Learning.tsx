
import { useState, useEffect, useMemo } from "react"
import { learningModules, COURSE_CATEGORIES, type LearningModule } from "@/data/learning-modules"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { BookOpen, Clock, Lock, CheckCircle2, Trophy, ChevronRight, PlayCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { QuizInteractive } from "@/components/QuizInteractive"
import { Link } from "react-router-dom"

export function Learning() {
  const { toast } = useToast()
  
  // -- PERSISTENCE --
  const [completedModules, setCompletedModules] = useState<string[]>(() => {
    const saved = localStorage.getItem("learning_completed")
    return saved ? JSON.parse(saved) : []
  })
  
  const [userXP, setUserXP] = useState<number>(() => {
    const saved = localStorage.getItem("learning_xp")
    return saved ? parseInt(saved) : 0
  })

  // -- STATE --
  const [selectedModuleId, setSelectedModuleId] = useState(learningModules[0].id)
  const [quizPassedInSession, setQuizPassedInSession] = useState(false)

  // -- CALCULATIONS --
  const selectedModule: LearningModule = useMemo(() => 
    learningModules.find(m => m.id === selectedModuleId) || learningModules[0], 
  [selectedModuleId]);

  const userLevel = Math.floor(userXP / 500) + 1;
  const nextLevelXP = userLevel * 500;
  const progressToNextLevel = ((userXP - ((userLevel - 1) * 500)) / 500) * 100;

  // -- EFFECTS --
  useEffect(() => {
    localStorage.setItem("learning_completed", JSON.stringify(completedModules))
  }, [completedModules])

  useEffect(() => {
    localStorage.setItem("learning_xp", userXP.toString())
  }, [userXP])

  // Reset session state when module changes
  useEffect(() => {
    setQuizPassedInSession(false);
  }, [selectedModuleId]);

  // -- HANDLERS --
  const handleQuizComplete = (passed: boolean) => {
      if (passed && !completedModules.includes(selectedModuleId)) {
        // First time completion
        setCompletedModules(prev => [...prev, selectedModuleId]);
        setUserXP(prev => prev + selectedModule.xpReward);
        setQuizPassedInSession(true);
        
        toast({
            title: "🎉 Module Complete!",
            description: `You earned +${selectedModule.xpReward} XP. Keep it up!`,
            className: "bg-green-500 text-white border-green-600"
        });
      } else if (passed) {
          // Replay
          setQuizPassedInSession(true);
          toast({
              title: "Quiz Passed",
              description: "Good refresh! No XP awarded for replays."
          });
      }
  };
  
  const isModuleLocked = (modIndex: number) => {
      if (modIndex === 0) return false;
      const prevModuleId = learningModules[modIndex - 1].id;
      return !completedModules.includes(prevModuleId);
  };

  const currentModuleIndex = learningModules.findIndex(m => m.id === selectedModuleId);
  const nextModule = learningModules[currentModuleIndex + 1];

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-6 p-1">
        
       {/* LEFT SIDEBAR: COURSE MAP */}
       <Card className="w-full md:w-80 flex-shrink-0 flex flex-col border-r h-full bg-card/50 backdrop-blur-sm">
           <CardHeader className="pb-4 border-b">
               <div className="flex items-center justify-between mb-2">
                   <h2 className="text-xl font-bold tracking-tight">C.T.H. Academy</h2>
                   <Badge variant="outline" className="font-mono text-yellow-500 border-yellow-500/30 bg-yellow-500/10">
                       Lvl {userLevel}
                   </Badge>
               </div>
               
               {/* XP Bar */}
               <div className="space-y-1">
                   <div className="flex justify-between text-xs text-muted-foreground">
                       <span>{userXP} XP</span>
                       <span>{nextLevelXP} XP</span>
                   </div>
                   <Progress value={progressToNextLevel} className="h-2" />
               </div>
           </CardHeader>
           
           <CardContent className="flex-1 p-0 overflow-hidden">
               <ScrollArea className="h-full">
                   <div className="p-4 space-y-6">
                       {COURSE_CATEGORIES.map((category) => {
                           const categoryModules = learningModules.filter(m => m.categoryId === category.id);
                           if (categoryModules.length === 0) return null;

                           return (
                               <div key={category.id} className="space-y-2">
                                   <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                                       {category.name}
                                   </div>
                                   <div className="space-y-1">
                                       {categoryModules.map((module) => {
                                           const globalIndex = learningModules.findIndex(m => m.id === module.id);
                                           const locked = isModuleLocked(globalIndex);
                                           const completed = completedModules.includes(module.id);
                                           const active = selectedModuleId === module.id;

                                           return (
                                               <Button
                                                  key={module.id}
                                                  variant={active ? "secondary" : "ghost"}
                                                  disabled={locked}
                                                  onClick={() => setSelectedModuleId(module.id)}
                                                  className={cn(
                                                      "w-full justify-between h-auto py-2.5 px-3 text-sm font-normal",
                                                      active && "bg-secondary font-medium",
                                                      locked && "opacity-50 cursor-not-allowed"
                                                  )}
                                               >
                                                   <span className="truncate flex-1 text-left mr-2">
                                                       {module.title}
                                                   </span>
                                                   
                                                   {completed ? (
                                                       <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                                                   ) : locked ? (
                                                       <Lock className="h-3 w-3 text-muted-foreground shrink-0" />
                                                   ) : (
                                                       <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                                                   )}
                                               </Button>
                                           )
                                       })}
                                   </div>
                               </div>
                           )
                       })}
                   </div>
               </ScrollArea>
           </CardContent>
       </Card>

       {/* MAIN CONTENT AREA */}
       <Card className="flex-1 flex flex-col h-full overflow-hidden border-none shadow-none bg-transparent">
           <ScrollArea className="h-full pr-4">
              <div className="space-y-8 pb-20">
                  
                  {/* HERO HEADER */}
                  <div className="space-y-4">
                      <div className="flex items-center gap-2">
                          <Badge variant="outline" className="uppercase tracking-widest text-[10px]">
                              {COURSE_CATEGORIES.find(c => c.id === selectedModule.categoryId)?.name}
                          </Badge>
                          
                          {completedModules.includes(selectedModuleId) && (
                              <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">
                                  Completed
                              </Badge>
                          )}
                      </div>
                      
                      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                          {selectedModule.title}
                      </h1>
                      
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              {selectedModule.readTimeMinutes} min read
                          </div>
                          <div className="flex items-center gap-1.5">
                              <Trophy className="w-4 h-4 text-yellow-500" />
                              {selectedModule.xpReward} XP Reward
                          </div>
                          <div className="flex items-center gap-1.5">
                              <BookOpen className="w-4 h-4" />
                              {selectedModule.difficulty}
                          </div>
                      </div>
                  </div>

                  <Separator />

                  {/* CONTENT BODY */}
                  <div className="prose prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-code:text-primary prose-code:bg-secondary/50 prose-code:px-1 prose-code:rounded">
                       <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                              blockquote: ({node, ...props}: any) => (
                                  <div className="border-l-4 border-primary pl-6 py-2 my-6 bg-primary/5 rounded-r-lg italic" {...props} />
                              ),
                              table: ({node, ...props}: any) => (
                                <div className="my-6 w-full overflow-y-auto border rounded-lg">
                                    <table className="w-full text-sm" {...props} />
                                </div>
                              ),
                              th: ({node, ...props}: any) => <th className="border-b px-4 py-3 text-left bg-muted/50 font-semibold" {...props} />,
                              td: ({node, ...props}: any) => <td className="border-b px-4 py-3" {...props} />,
                          }}
                       >
                           {selectedModule.content}
                       </ReactMarkdown>
                  </div>

                  {/* INTERACTIVE ACTIONS */}
                  <div className="mt-12 space-y-8">
                      {/* 1. MISSION CARD (If exists) */}
                      {selectedModule.mission && (
                          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-4 opacity-10">
                                  <PlayCircle className="w-32 h-32" />
                              </div>
                              <h3 className="text-lg font-bold text-blue-400 mb-2 flex items-center gap-2">
                                  <Trophy className="w-5 h-5" />
                                  Live Mission
                              </h3>
                              <p className="text-muted-foreground mb-4 max-w-xl">
                                  {selectedModule.mission.task}
                              </p>
                              <Button asChild className="relative z-10">
                                  <Link to={selectedModule.mission.actionLink}>Launch Simulator</Link>
                              </Button>
                          </div>
                      )}

                      {/* 2. QUIZ */}
                      {selectedModule.quiz && (
                          <div className="bg-secondary/20 border rounded-xl p-6 md:p-8">
                              <QuizInteractive 
                                  questions={selectedModule.quiz} 
                                  onComplete={handleQuizComplete} 
                              />
                          </div>
                      )}

                      {/* 3. NEXT LESSON PROMPT */}
                      {(completedModules.includes(selectedModuleId) || quizPassedInSession) && nextModule && (
                          <div className="flex flex-col items-center justify-center py-8 animate-in fade-in slide-in-from-bottom-4">
                              <p className="text-muted-foreground mb-4">You've mastered this topic.</p>
                              <Button 
                                  size="lg" 
                                  className="gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0"
                                  onClick={() => {
                                      window.scrollTo({ top: 0, behavior: 'smooth' });
                                      setSelectedModuleId(nextModule.id);
                                  }}
                              >
                                  Start Next Lesson: {nextModule.title} 
                                  <ChevronRight className="w-4 h-4" />
                              </Button>
                          </div>
                      )}
                  </div>

              </div>
           </ScrollArea>
       </Card>
       
    </div>
  )
}
