import { useState, useEffect } from "react";
import { learningModules, COURSE_CATEGORIES } from "@/data/learning-modules";
import { QuizInteractive } from "@/components/QuizInteractive";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { BookOpen, CheckCircle2, Circle, ChevronRight, GraduationCap, PlayCircle, Quote, Terminal } from "lucide-react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Learning() {
  // Persistence: Load progress
  const [completedModules, setCompletedModules] = useState<string[]>(() => {
    const saved = localStorage.getItem("cth_learning_progress");
    return saved ? JSON.parse(saved) : [];
  });

  const [activeModuleId, setActiveModuleId] = useState<string>(learningModules[0].id);

  useEffect(() => {
    localStorage.setItem("cth_learning_progress", JSON.stringify(completedModules));
  }, [completedModules]);

  const activeModule = learningModules.find(m => m.id === activeModuleId) || learningModules[0];

  const handleModuleComplete = (id: string) => {
    if (!completedModules.includes(id)) {
      setCompletedModules(prev => [...prev, id]);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-950">
      
      {/* LEFT SIDEBAR: Course Curriculum */}
      <div className="w-80 border-r border-slate-800 bg-slate-950 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-800">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-blue-500" />
                Curriculum
            </h2>
            <p className="text-xs text-slate-500 mt-2">
                {completedModules.length} of {learningModules.length} lessons completed
            </p>
        </div>
        
        <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
                {COURSE_CATEGORIES.map((category) => (
                    <div key={category.id}>
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">
                            {category.name}
                        </h3>
                        <div className="space-y-1">
                            {learningModules
                                .filter(m => m.categoryId === category.id)
                                .map(module => {
                                    const isCompleted = completedModules.includes(module.id);
                                    const isActive = activeModuleId === module.id;
                                    
                                    return (
                                        <button
                                            key={module.id}
                                            onClick={() => setActiveModuleId(module.id)}
                                            className={`
                                                w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left
                                                ${isActive ? "bg-blue-900/20 text-blue-200 border border-blue-900/50" : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"}
                                            `}
                                        >
                                            {isCompleted ? (
                                                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                            ) : (
                                                <Circle className={`h-4 w-4 mt-0.5 shrink-0 ${isActive ? "text-blue-400" : "text-slate-600"}`} />
                                            )}
                                            <span className="line-clamp-2">{module.title}</span>
                                        </button>
                                    )
                                })}
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
      </div>

      {/* MAIN CONTENT: Reader */}
      <div className="flex-1 overflow-y-auto bg-slate-950">
        <div className="max-w-3xl mx-auto p-8 md:p-12">
            
            {/* Mobile Nav Trigger could go here */}
            
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline" className="text-blue-400 border-blue-900 bg-blue-950/30">
                        {COURSE_CATEGORIES.find(c => c.id === activeModule.categoryId)?.name}
                    </Badge>
                    <span className="text-xs text-slate-500 flex items-center">
                        <BookOpen className="h-3 w-3 mr-1" /> {activeModule.readTime} read
                    </span>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    {activeModule.title}
                </h1>
                <p className="text-xl text-slate-400 leading-relaxed">
                    {activeModule.description}
                </p>
            </div>

            <Separator className="bg-slate-800 my-8" />

            {/* Content Body */}
            <div className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-p:text-slate-300 prose-strong:text-blue-200">
                <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                        // Headings
                        h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-white mt-8 mb-4 border-b border-slate-800 pb-2" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-2xl font-semibold text-white mt-8 mb-4" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-xl font-semibold text-blue-200 mt-6 mb-3" {...props} />,
                        // Paragraphs
                        p: ({node, ...props}) => <p className="text-slate-300 leading-7 mb-4" {...props} />,
                        // Lists (with bullets)
                        ul: ({node, ...props}) => <ul className="list-disc list-outside ml-6 space-y-2 mb-4 text-slate-300" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-6 space-y-2 mb-4 text-slate-300" {...props} />,
                        li: ({node, ...props}) => <li className="pl-1 marker:text-blue-500" {...props} />,
                        // Blockquote -> Callout
                        blockquote: ({node, ...props}) => (
                            <div className="my-6 border-l-4 border-blue-500 bg-slate-900/50 p-4 rounded-r-lg flex gap-3">
                                <Quote className="h-6 w-6 text-blue-500 shrink-0 mt-1" />
                                <div className="text-slate-300 italic">
                                    {props.children}
                                </div>
                            </div>
                        ),
                        // Code blocks
                        code: ({inline, className, children, ...props}: any) => {
                            return !inline ? (
                                <div className="my-6 rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                                    <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center gap-2">
                                        <Terminal className="h-4 w-4 text-slate-500" />
                                        <span className="text-xs text-slate-500 font-mono">Code Snippet</span>
                                    </div>
                                    <pre className="p-4 overflow-x-auto text-sm font-mono text-slate-300">
                                        <code className={className} {...props}>
                                            {children}
                                        </code>
                                    </pre>
                                </div>
                            ) : (
                                <code className="bg-slate-800 text-blue-200 px-1.5 py-0.5 rounded text-sm font-mono border border-slate-700" {...props}>
                                    {children}
                                </code>
                            )
                        },
                        // Separator
                        hr: ({node, ...props}) => <Separator className="my-8 bg-slate-800" {...props} />,
                    }}
                >
                    {activeModule.content}
                </ReactMarkdown>
            </div>

            {/* Practical Application (Simulator Link) */}
            {activeModule.mission && (
                <Card className="my-8 border-blue-900/50 bg-blue-950/10">
                    <CardHeader>
                        <CardTitle className="text-lg text-blue-300 flex items-center gap-2">
                            <PlayCircle className="h-5 w-5" />
                            Practical Application
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between gap-4">
                        <p className="text-sm text-slate-400">{activeModule.mission.description}</p>
                        <Button size="sm" variant="secondary" asChild>
                            <Link to={activeModule.mission.actionLink}>
                                Open Simulator <ChevronRight className="ml-1 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            )}

            <Separator className="bg-slate-800 my-8" />

            {/* Knowledge Check */}
            <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Knowledge Check
                </h3>
                
                {completedModules.includes(activeModule.id) ? (
                    <div className="text-green-400 flex items-center gap-2 bg-green-950/20 p-4 rounded-lg border border-green-900/50">
                        <CheckCircle2 className="h-5 w-5" />
                        You have completed this lesson.
                    </div>
                ) : (
                    <QuizInteractive 
                        questions={activeModule.quiz} 
                        onComplete={() => handleModuleComplete(activeModule.id)} 
                    />
                )}
            </div>

            {/* Navigation Footer */}
            <div className="mt-12 flex justify-between">
                <Button variant="ghost" disabled={learningModules.indexOf(activeModule) === 0} onClick={() => {
                    const idx = learningModules.indexOf(activeModule);
                    if(idx > 0) setActiveModuleId(learningModules[idx - 1].id);
                }}>
                    Previous Lesson
                </Button>

                <Button disabled={!completedModules.includes(activeModule.id) || learningModules.indexOf(activeModule) === learningModules.length - 1} onClick={() => {
                    const idx = learningModules.indexOf(activeModule);
                    if(idx < learningModules.length - 1) setActiveModuleId(learningModules[idx + 1].id);
                }}>
                    Next Lesson <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            </div>

        </div>
      </div>
    </div>
  );
}
