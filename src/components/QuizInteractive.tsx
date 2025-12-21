import { useState } from "react";
import { CheckCircle2, XCircle, HelpCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { QuizQuestion } from "@/data/learning-modules";

interface QuizInteractiveProps {
  questions: QuizQuestion[];
}

export function QuizInteractive({ questions }: QuizInteractiveProps) {
  // State to track selected option for each question: { [questionIndex]: selectedOptionIndex }
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  
  const handleSelect = (qIndex: number, optionIndex: number) => {
      // Prevent changing answer if already answered
      if (answers[qIndex] !== undefined) return;
      
      setAnswers(prev => ({ ...prev, [qIndex]: optionIndex }));
  };

  if (!questions || questions.length === 0) return null;

  return (
    <div className="space-y-8 mt-12 mb-12">
      <div className="flex items-center gap-2 border-b pb-4">
          <HelpCircle className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Knowledge Check</h2>
      </div>
      
      {questions.map((q, qIndex) => {
        const isAnswered = answers[qIndex] !== undefined;
        const selected = answers[qIndex];
        const isCorrect = selected === q.correctAnswer;

        return (
          <Card key={qIndex} className="border-border/50 bg-secondary/20">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">{qIndex + 1}. {q.question}</h3>
              
              <div className="grid grid-cols-1 gap-3">
                {q.options.map((option, optIndex) => {
                  let variant: "outline" | "default" | "destructive" | "secondary" = "outline";
                  
                  if (isAnswered) {
                      if (optIndex === q.correctAnswer) {
                          variant = "default"; // Correct answer always green/filled
                      } else if (optIndex === selected && !isCorrect) {
                          variant = "destructive"; // Wrong selection
                      } else {
                          variant = "secondary"; // Others greyed out
                      }
                  }

                  return (
                    <Button
                      key={optIndex}
                      variant={!isAnswered ? "outline" : variant}
                      className={`justify-start h-auto py-3 px-4 text-left whitespace-normal ${
                          isAnswered && optIndex === q.correctAnswer ? "bg-green-600 hover:bg-green-700 text-white border-green-600" : ""
                      } ${
                          isAnswered && optIndex !== q.correctAnswer && "opacity-80"
                      }`}
                      onClick={() => handleSelect(qIndex, optIndex)}
                      disabled={isAnswered}
                    >
                      <div className="flex items-center w-full">
                          <span className="flex-1">{option}</span>
                          {isAnswered && optIndex === q.correctAnswer && <CheckCircle2 className="h-5 w-5 ml-2" />}
                          {isAnswered && optIndex === selected && !isCorrect && <XCircle className="h-5 w-5 ml-2" />}
                      </div>
                    </Button>
                  );
                })}
              </div>

              {isAnswered && (
                  <div className={`mt-4 p-4 rounded-lg flex gap-3 ${isCorrect ? "bg-green-500/10 text-green-700 dark:text-green-300" : "bg-red-500/10 text-red-700 dark:text-red-300"}`}>
                      <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                      <div>
                          <p className="font-semibold mb-1">{isCorrect ? "Correct!" : "Incorrect"}</p>
                          <p className="text-sm opacity-90">{q.explanation}</p>
                      </div>
                  </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
