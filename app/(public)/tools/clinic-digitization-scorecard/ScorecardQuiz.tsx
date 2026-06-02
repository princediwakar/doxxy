// Path: app/(public)/tools/clinic-digitization-scorecard/ScorecardQuiz.tsx
"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Send,
  ClipboardCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ScoreGauge from "./ScoreGauge";
import { Input } from "@/components/ui/input";

// --- TYPES ---

interface QuestionOption {
  label: string;
  points: number;
}

interface Question {
  id: number;
  text: string;
  options: QuestionOption[];
}

interface ScoreBand {
  range: [number, number];
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  description: string;
}

// --- DATA ---

const questions: Question[] = [
  {
    id: 1,
    text: "How do new patients register at your clinic?",
    options: [
      { label: "Paper forms they fill every visit", points: 0 },
      { label: "Paper form once, filed manually", points: 10 },
      { label: "Digital form on a tablet/computer at reception", points: 20 },
      { label: "Online pre-registration before they arrive", points: 30 },
    ],
  },
  {
    id: 2,
    text: "How do patients book appointments?",
    options: [
      { label: "Walk-ins only, no scheduling system", points: 0 },
      { label: "Receptionist maintains a physical diary/register", points: 10 },
      { label: "Receptionist uses a computer/spreadsheet", points: 20 },
      { label: "Patients can book online + receptionist manages digitally", points: 30 },
    ],
  },
  {
    id: 3,
    text: "Where are your patient records stored?",
    options: [
      { label: "Paper files in cabinets/racks", points: 0 },
      { label: "Mix of paper files and some digital notes", points: 10 },
      { label: "Digital records but no structured format", points: 20 },
      { label: "Fully structured EMR with search, templates, history", points: 30 },
    ],
  },
  {
    id: 4,
    text: "How do you write prescriptions?",
    options: [
      { label: "Handwritten on prescription pads", points: 0 },
      { label: "Printed from a template but filled manually", points: 10 },
      { label: "Digital prescriptions, printed and signed", points: 20 },
      { label: "Fully digital e-prescriptions, sent to patient's phone", points: 30 },
    ],
  },
  {
    id: 5,
    text: "How do patients pay?",
    options: [
      { label: "Cash only, manual receipts", points: 0 },
      { label: "Cash + card, manual billing", points: 10 },
      { label: "Digital billing with some UPI/card payments", points: 20 },
      { label: "Fully digital billing + UPI/card + auto-generated invoices", points: 30 },
    ],
  },
  {
    id: 6,
    text: "How do you remind patients about appointments?",
    options: [
      { label: "No reminders, patients remember on their own", points: 0 },
      { label: "Staff calls patients manually", points: 10 },
      { label: "SMS reminders sent manually", points: 20 },
      { label: "Automated WhatsApp/SMS reminders with confirmations", points: 30 },
    ],
  },
  {
    id: 7,
    text: "How do you handle lab reports?",
    options: [
      { label: "Paper reports handed to patients, no copy kept", points: 0 },
      { label: "Paper reports filed in patient folders", points: 10 },
      { label: "Scanned/uploaded to a basic computer system", points: 20 },
      { label: "Digital reports auto-linked to patient EMR, shared via WhatsApp", points: 30 },
    ],
  },
  {
    id: 8,
    text: "How do you track patients needing follow-ups?",
    options: [
      { label: "No system, depends on patient returning", points: 0 },
      { label: "Doctor notes it on the prescription", points: 10 },
      { label: "Staff maintains a follow-up register/Excel", points: 20 },
      { label: "Automated follow-up reminders via WhatsApp with rebooking", points: 30 },
    ],
  },
  {
    id: 9,
    text: 'Can you answer "how is my clinic doing this month?"',
    options: [
      { label: "No idea without checking the cash book", points: 0 },
      { label: "Basic revenue tracking in a notebook/Excel", points: 10 },
      { label: "Monthly reports generated manually from records", points: 20 },
      { label: "Real-time dashboard: revenue, patients, trends, top services", points: 30 },
    ],
  },
  {
    id: 10,
    text: "How secure are your patient records?",
    options: [
      { label: "No security measures, anyone can access files", points: 0 },
      { label: "Cabinet with a lock, that's it", points: 10 },
      { label: "Password-protected computers but no formal policy", points: 20 },
      { label: "Encrypted digital records, access controls, ABDM compliant", points: 30 },
    ],
  },
];

const MAX_SCORE = 300; // 10 questions x 30 points max

const scoreBands: ScoreBand[] = [
  {
    range: [0, 20],
    label: "Paper Era",
    color: "#EF4444",
    bgColor: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",
    textColor: "text-red-700 dark:text-red-400",
    description:
      "Your clinic runs on paper. You're losing ₹15,000-₹30,000/month in inefficiencies. Every day you wait, the pile grows.",
  },
  {
    range: [21, 40],
    label: "Early Digital",
    color: "#F97316",
    bgColor: "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800",
    textColor: "text-orange-700 dark:text-orange-400",
    description:
      "You've started the journey but there's a long way to go. Your staff still spends 2-3 hours/day on tasks software could handle in minutes.",
  },
  {
    range: [41, 60],
    label: "Semi-Digital",
    color: "#EAB308",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800",
    textColor: "text-yellow-700 dark:text-yellow-400",
    description:
      "Good progress. But the gaps — especially in patient communication and follow-ups — are where revenue leaks.",
  },
  {
    range: [61, 80],
    label: "Mostly Digital",
    color: "#22C55E",
    bgColor: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
    textColor: "text-green-700 dark:text-green-400",
    description:
      "Your clinic is ahead of 70% of Indian clinics. A few more steps and you're fully digital.",
  },
  {
    range: [81, 100],
    label: "Fully Digital",
    color: "#16A34A",
    bgColor: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
    textColor: "text-green-700 dark:text-green-400",
    description:
      "Your clinic is a model for others. You're saving ₹20,000+/month compared to paper-based peers.",
  },
];

// --- HELPERS ---

function getScoreBand(percentage: number): ScoreBand {
  return (
    scoreBands.find(
      (band) => percentage >= band.range[0] && percentage <= band.range[1],
    ) ?? scoreBands[0]
  );
}

// --- COMPONENT ---

export default function ScorecardQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    new Array(questions.length).fill(null),
  );
  const [showResults, setShowResults] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [leadForm, setLeadForm] = useState({ name: "", phone: "", clinic: "" });
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  const isLastQuestion = currentQuestion === questions.length - 1;
  const hasAnsweredCurrent = answers[currentQuestion] !== null;

  const handleSelectOption = useCallback(
    (optionIndex: number) => {
      setSelectedOption(optionIndex);
    },
    [],
  );

  const handleNext = useCallback(() => {
    if (selectedOption === null) return;

    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedOption;
    setAnswers(newAnswers);

    if (isLastQuestion) {
      setShowResults(true);
    } else {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedOption(null);
    }
  }, [selectedOption, answers, currentQuestion, isLastQuestion]);

  const handleBack = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
      const prevAnswer = answers[currentQuestion - 1];
      setSelectedOption(prevAnswer);
    }
  }, [currentQuestion, answers]);

  const handleOptionKeyDown = useCallback(
    (e: React.KeyboardEvent, optionIndex: number) => {
      const totalOptions = questions[currentQuestion].options.length;
      let nextIndex: number | null = null;

      switch (e.key) {
        case "ArrowDown":
        case "ArrowRight":
          e.preventDefault();
          nextIndex = (optionIndex + 1) % totalOptions;
          break;
        case "ArrowUp":
        case "ArrowLeft":
          e.preventDefault();
          nextIndex = (optionIndex - 1 + totalOptions) % totalOptions;
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          setSelectedOption(optionIndex);
          break;
      }

      if (nextIndex !== null) {
        setSelectedOption(nextIndex);
      }
    },
    [currentQuestion],
  );

  const handleRetake = useCallback(() => {
    setCurrentQuestion(0);
    setAnswers(new Array(questions.length).fill(null));
    setSelectedOption(null);
    setShowResults(false);
    setLeadSubmitted(false);
    setLeadForm({ name: "", phone: "", clinic: "" });
  }, []);

  const handleLeadSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!leadForm.name.trim() || !leadForm.phone.trim()) return;
      setLeadSubmitted(true);
      toast.success("Roadmap sent to your WhatsApp!");
    },
    [leadForm],
  );

  // --- COMPUTED SCORE ---
  const totalScore = answers.reduce<number>(
    (sum, optionIndex, questionIndex) => {
      if (optionIndex === null) return sum;
      return sum + (questions[questionIndex]?.options[optionIndex]?.points ?? 0);
    },
    0,
  );
  const percentage = Math.round((totalScore / MAX_SCORE) * 100);
  const band = getScoreBand(percentage);

  // --- RESULTS VIEW ---
  if (showResults) {
    return (
      <div className="max-w-2xl mx-auto">
        {/* Score Display */}
        <div
          className={`rounded-2xl border p-8 md:p-12 text-center ${band.bgColor}`}
        >
          <ScoreGauge percentage={percentage} />
          <h3
            className={`text-2xl md:text-3xl font-bold mt-6 ${band.textColor}`}
          >
            {band.label}
          </h3>
          <p className="mt-4 text-gray-700 dark:text-gray-300 text-base leading-relaxed">
            {band.description}
          </p>

          {/* Detailed breakdown */}
          <div className="mt-8 grid grid-cols-2 gap-4 text-left">
            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your Score
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalScore}/{MAX_SCORE}
              </p>
            </div>
            <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Digitization Level
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {percentage}%
              </p>
            </div>
          </div>

          {/* Retake button */}
          <Button
            variant="outline"
            onClick={handleRetake}
            className="mt-6 gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Retake Quiz
          </Button>
        </div>

        {/* Lead Capture Form */}
        {!leadSubmitted ? (
          <div className="mt-10 bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-8">
            <div className="flex items-start gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                <ClipboardCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Want a detailed digitization roadmap for your clinic?
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  We&apos;ll WhatsApp it to you. No spam, just actionable steps.
                </p>
              </div>
            </div>
            <form onSubmit={handleLeadSubmit} className="space-y-4">
              <div>
                <Input
                  placeholder="Your name"
                  value={leadForm.name}
                  onChange={(e) =>
                    setLeadForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                  className="w-full"
                />
              </div>
              <div>
                <Input
                  placeholder="Phone / WhatsApp number"
                  type="tel"
                  value={leadForm.phone}
                  onChange={(e) =>
                    setLeadForm((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  required
                  className="w-full"
                />
              </div>
              <div>
                <Input
                  placeholder="Clinic name (optional)"
                  value={leadForm.clinic}
                  onChange={(e) =>
                    setLeadForm((prev) => ({
                      ...prev,
                      clinic: e.target.value,
                    }))
                  }
                  className="w-full"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                <Send className="h-4 w-4" />
                Send Me the Roadmap on WhatsApp
              </Button>
            </form>
          </div>
        ) : (
          <div className="mt-10 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-2xl p-6 md:p-8 text-center">
            <p className="text-green-700 dark:text-green-400 font-semibold text-lg">
              Roadmap sent to your WhatsApp!
            </p>
            <p className="text-green-600 dark:text-green-500 mt-2 text-sm">
              Check your phone. We&apos;ve sent you a personalized digitization
              plan for your clinic.
            </p>
            <Button
              variant="outline"
              onClick={handleRetake}
              className="mt-4 gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Retake Quiz
            </Button>
          </div>
        )}
      </div>
    );
  }

  // --- QUIZ VIEW ---
  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-8">
        <h3
          id="scorecard-question"
          className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-6"
        >
          {currentQ.text}
        </h3>

        {/* Options */}
        <div role="radiogroup" aria-labelledby="scorecard-question" className="space-y-3">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            return (
              <button
                key={idx}
                role="radio"
                aria-checked={isSelected}
                tabIndex={isSelected || (selectedOption === null && idx === 0) ? 0 : -1}
                onClick={() => handleSelectOption(idx)}
                onKeyDown={(e) => handleOptionKeyDown(e, idx)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 shadow-sm"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    aria-hidden="true"
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span
                    className={`text-base ${
                      isSelected
                        ? "text-blue-700 dark:text-blue-300 font-medium"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {option.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentQuestion === 0}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={selectedOption === null}
            className={`gap-1 ${
              selectedOption !== null
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            }`}
          >
            {isLastQuestion ? "See My Results" : "Next"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
