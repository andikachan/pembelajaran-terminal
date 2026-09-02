'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { QUIZ_QUESTIONS } from '@/data/quizzes';
import { useGame } from '@/context/GameContext';
import { useSound } from '@/context/SoundContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/Button';
import {
  Heart,
  Flame,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  Terminal,
  ArrowRight,
  Sparkles,
  Zap,
  HelpCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function QuizPage() {
  const router = useRouter();
  const { profile, recordCommandExecution } = useGame();
  const { playKeyClick, playSubmit, playSuccess, playError } = useSound();
  const { t, language, getQuizText } = useLanguage();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [totalXpEarned, setTotalXpEarned] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const questions = QUIZ_QUESTIONS;
  const currentQuestion = questions[currentIndex];
  const locQuiz = getQuizText(currentQuestion?.id);

  const activeQuestionText = locQuiz?.question || currentQuestion?.question;
  const activeScenario = locQuiz?.scenario || currentQuestion?.scenario;
  const activeExplanation = locQuiz?.explanation || currentQuestion?.explanation;
  const activeOptions = useMemo(() => {
    if (!currentQuestion) return [];
    if (locQuiz?.options && locQuiz.options.length > 0) {
      return locQuiz.options;
    }
    return currentQuestion.options;
  }, [currentQuestion, locQuiz]);

  const selectedOption = useMemo(() => {
    return activeOptions.find((o) => o.id === selectedOptionId);
  }, [activeOptions, selectedOptionId]);

  const isCorrect = selectedOption?.isCorrect ?? false;
  const correctOption = useMemo(() => {
    return activeOptions.find((o) => o.isCorrect);
  }, [activeOptions]);

  // Keyboard navigation: 1, 2, 3, 4, Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinished || isGameOver) return;

      if (!isAnswerChecked) {
        if (e.key === '1' && activeOptions[0]) {
          setSelectedOptionId(activeOptions[0].id);
          playKeyClick();
        } else if (e.key === '2' && activeOptions[1]) {
          setSelectedOptionId(activeOptions[1].id);
          playKeyClick();
        } else if (e.key === '3' && activeOptions[2]) {
          setSelectedOptionId(activeOptions[2].id);
          playKeyClick();
        } else if (e.key === '4' && activeOptions[3]) {
          setSelectedOptionId(activeOptions[3].id);
          playKeyClick();
        } else if (e.key === 'Enter' && selectedOptionId) {
          handleCheckAnswer();
        }
      } else {
        if (e.key === 'Enter') {
          handleNextQuestion();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeOptions, isAnswerChecked, selectedOptionId, isFinished, isGameOver]);

  const handleSelectOption = (optionId: string) => {
    if (isAnswerChecked) return;
    playKeyClick();
    setSelectedOptionId(optionId);
  };

  const handleCheckAnswer = () => {
    if (!selectedOptionId || isAnswerChecked) return;

    setIsAnswerChecked(true);

    if (isCorrect) {
      playSuccess();
      const comboBonus = combo >= 2 ? combo * 5 : 0;
      const earned = currentQuestion.xpReward + comboBonus;
      setTotalXpEarned((prev) => prev + earned);
      setCorrectAnswersCount((prev) => prev + 1);
      setCombo((prev) => prev + 1);
      recordCommandExecution(true);
    } else {
      playError();
      setCombo(0);
      setLives((prev) => {
        const nextLives = prev - 1;
        if (nextLives <= 0) {
          setIsGameOver(true);
        }
        return nextLives;
      });
      recordCommandExecution(false);
    }
  };

  const handleNextQuestion = () => {
    playSubmit();
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setIsAnswerChecked(false);
    } else {
      setIsFinished(true);
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#7CFF6B', '#FFC857', '#4EE2EC'],
        });
      } catch (e) {}
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setIsAnswerChecked(false);
    setLives(3);
    setCombo(0);
    setTotalXpEarned(0);
    setCorrectAnswersCount(0);
    setIsFinished(false);
    setIsGameOver(false);
  };

  // 1. GAME OVER VIEW (Lost all 3 hearts)
  if (isGameOver) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-[#0E0808] border-2 border-[#FF5C5C] text-center font-mono space-y-5 animate-fadeIn">
        <div className="w-14 h-14 mx-auto bg-[#240C0C] border border-[#751E1E] text-[#FF5C5C] flex items-center justify-center text-2xl font-bold">
          <Heart className="w-7 h-7 text-[#FF5C5C] fill-current" />
        </div>

        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider">
            {t.quiz.gameOverTitle}
          </h2>
          <p className="text-xs text-[#D8B4B4] leading-relaxed">
            {t.quiz.gameOverSubtitle}
          </p>
        </div>

        <div className="p-3 bg-[#170B0B] border border-[#3A1414] text-xs text-[#B88A8A] flex items-center justify-around">
          <div>
            <div className="text-[10px] uppercase text-[#885A5A]">{t.quiz.progress}</div>
            <div className="text-sm font-bold text-white">{currentIndex + 1} / {questions.length}</div>
          </div>
          <div className="w-px h-6 bg-[#3A1414]" />
          <div>
            <div className="text-[10px] uppercase text-[#885A5A]">XP</div>
            <div className="text-sm font-bold text-[#FFC857]">+{totalXpEarned}</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button variant="danger" size="md" onClick={handleRestart} className="w-full sm:w-auto">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.quiz.retryBtn}</span>
          </Button>

          <Link href="/play" className="w-full sm:w-auto">
            <Button variant="ghost" size="md" className="w-full sm:w-auto">
              <Terminal className="w-3.5 h-3.5" />
              <span>{t.quiz.backToTerminal}</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // 2. DRILL COMPLETED VIEW
  if (isFinished) {
    const accuracy = Math.round((correctAnswersCount / questions.length) * 100);

    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-[#080D0A] border-2 border-[#7CFF6B] text-center font-mono space-y-6 animate-fadeIn shadow-[0_0_40px_rgba(124,255,107,0.2)]">
        <div className="w-14 h-14 mx-auto bg-[#132B18] border border-[#2B6636] text-[#7CFF6B] flex items-center justify-center">
          <Trophy className="w-7 h-7 text-[#FFC857]" />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">
            {t.quiz.resultsTitle}
          </h2>
          <p className="text-xs text-[#8A9099] leading-relaxed">
            {t.quiz.resultsSubtitle}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 p-3 bg-[#0D1410] border border-[#1E3322] text-xs">
          <div className="text-center space-y-0.5">
            <div className="text-[10px] text-[#73777D] uppercase">{t.quiz.xpYield}</div>
            <div className="text-base font-bold text-[#7CFF6B]">+{totalXpEarned}</div>
          </div>
          <div className="text-center space-y-0.5 border-x border-[#1E3322]">
            <div className="text-[10px] text-[#73777D] uppercase">{t.quiz.accuracy}</div>
            <div className="text-base font-bold text-[#FFC857]">{accuracy}%</div>
          </div>
          <div className="text-center space-y-0.5">
            <div className="text-[10px] text-[#73777D] uppercase">{t.quiz.livesRemaining}</div>
            <div className="text-base font-bold text-[#FF5C5C] flex items-center justify-center gap-1">
              <Heart className="w-3.5 h-3.5 fill-current" /> {lives}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button variant="primary" size="md" onClick={handleRestart} className="w-full sm:w-auto">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.quiz.tryAgainBtn}</span>
          </Button>

          <Link href="/play" className="w-full sm:w-auto">
            <Button variant="secondary" size="md" className="w-full sm:w-auto">
              <Terminal className="w-3.5 h-3.5 text-[#7CFF6B]" />
              <span>{t.quiz.backToTerminal}</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // 3. MAIN DUOLINGO-STYLE QUESTION CARD VIEW
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-6 font-mono pb-24">
      {/* Top Header Bar (Duolingo Style: Exit, Progress Bar, Lives, Combo) */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/play"
          className="text-[#656D76] hover:text-white transition-colors text-sm font-bold"
          title="Exit to Terminal"
        >
          ✕
        </Link>

        {/* Animated Progress Bar */}
        <div className="flex-1 h-3 bg-[#14181D] border border-[#27303B] overflow-hidden rounded-full p-0.5">
          <div
            className="h-full bg-gradient-to-r from-[#29542D] to-[#7CFF6B] rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Combo Badge */}
        {combo >= 2 && (
          <div className="flex items-center gap-1 px-2 py-0.5 bg-[#2B1B09] border border-[#754411] text-[#FFC857] text-xs font-bold animate-pulse">
            <Flame className="w-3.5 h-3.5 text-[#FFC857]" />
            <span>{combo}x</span>
          </div>
        )}

        {/* Hearts Indicator */}
        <div className="flex items-center gap-1 text-[#FF5C5C] font-bold text-xs" title={`${lives} Hearts Left`}>
          {Array.from({ length: 3 }).map((_, idx) => (
            <Heart
              key={idx}
              className={`w-4 h-4 ${
                idx < lives ? 'text-[#FF5C5C] fill-[#FF5C5C]' : 'text-[#361919] fill-[#1C0F0F]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-[#0B0D0F] border-2 border-[#1E252D] p-5 sm:p-7 space-y-5 relative">
        <div className="flex items-center justify-between text-[11px] text-[#73777D] uppercase tracking-widest border-b border-[#1A1F26] pb-2">
          <span className="text-[#FFC857]">
            {t.quiz.progress} {currentIndex + 1} / {questions.length}
          </span>
          <span className="text-[#7CFF6B]">+{currentQuestion.xpReward} XP</span>
        </div>

        {/* Question Title */}
        <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed">
          {activeQuestionText}
        </h2>

        {/* Scenario description if available */}
        {activeScenario && (
          <p className="text-xs text-[#8A9099] italic leading-relaxed pl-3 border-l-2 border-[#2C3440]">
            {activeScenario}
          </p>
        )}

        {/* Command snippet codeblock if available */}
        {currentQuestion.commandSnippet && (
          <div className="p-3 bg-[#050606] border border-[#202730] text-[#7CFF6B] text-xs sm:text-sm font-mono tracking-wide">
            $ {currentQuestion.commandSnippet}
          </div>
        )}

        {/* Options Grid (Multiple Choice Cards) */}
        <div className="space-y-3 pt-2">
          {activeOptions.map((opt, idx) => {
            const isSelected = selectedOptionId === opt.id;
            const isThisCorrect = opt.isCorrect;

            let cardStyles = 'bg-[#101418] border-[#252C36] text-[#D8DCE2] hover:border-[#3E4A5C] hover:bg-[#141A20]';

            if (isSelected) {
              cardStyles = 'bg-[#141F17] border-[#3B663F] text-white shadow-[0_0_10px_rgba(124,255,107,0.15)]';
            }

            if (isAnswerChecked) {
              if (isThisCorrect) {
                cardStyles = 'bg-[#122416] border-[#7CFF6B] text-[#7CFF6B] font-bold shadow-[0_0_15px_rgba(124,255,107,0.25)]';
              } else if (isSelected && !isThisCorrect) {
                cardStyles = 'bg-[#261010] border-[#FF5C5C] text-[#FF5C5C] font-bold';
              } else {
                cardStyles = 'bg-[#0A0C0E] border-[#181D23] text-[#555B64] opacity-50';
              }
            }

            return (
              <div
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                className={`p-3.5 sm:p-4 border-2 transition-all flex items-center justify-between gap-3 cursor-pointer select-none ${cardStyles}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 flex items-center justify-center border border-[#303945] text-xs font-bold text-[#8A9099] shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-xs sm:text-sm font-mono tracking-wide">
                    {opt.text}
                  </span>
                </div>

                {isAnswerChecked && isThisCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-[#7CFF6B] shrink-0" />
                )}

                {isAnswerChecked && isSelected && !isThisCorrect && (
                  <XCircle className="w-5 h-5 text-[#FF5C5C] shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Sticky Action / Feedback Drawer (Duolingo Style) */}
      <div
        className={`p-4 border-t-2 font-mono transition-all duration-300 ${
          !isAnswerChecked
            ? 'bg-[#0B0D0F] border-[#1E252D]'
            : isCorrect
            ? 'bg-[#0E1A11] border-[#7CFF6B] text-white'
            : 'bg-[#1C0E0E] border-[#FF5C5C] text-white'
        }`}
      >
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status Message & Explanation when checked */}
          <div className="space-y-1 min-w-0">
            {!isAnswerChecked ? (
              <div className="text-xs text-[#8A9099] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#FFC857]" />
                <span>{t.quiz.selectPrompt}</span>
              </div>
            ) : isCorrect ? (
              <div>
                <div className="text-sm font-bold text-[#7CFF6B] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t.quiz.correctFeedback} (+{currentQuestion.xpReward} XP)</span>
                </div>
                <p className="text-[11px] text-[#A6CCAC] mt-1 leading-snug">
                  {activeExplanation}
                </p>
              </div>
            ) : (
              <div>
                <div className="text-sm font-bold text-[#FF5C5C] flex items-center gap-1.5">
                  <XCircle className="w-4 h-4" />
                  <span>{t.quiz.wrongFeedback} (-1 ❤️)</span>
                </div>
                <p className="text-[11px] text-[#DCAAAA] mt-1 leading-snug">
                  <span className="font-bold">{t.quiz.correctAnswerWas}</span> {correctOption?.text}. {activeExplanation}
                </p>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="shrink-0">
            {!isAnswerChecked ? (
              <Button
                variant="primary"
                size="md"
                onClick={handleCheckAnswer}
                disabled={!selectedOptionId}
                className="w-full sm:w-auto"
              >
                <span>{t.quiz.checkBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                variant={isCorrect ? 'primary' : 'danger'}
                size="md"
                onClick={handleNextQuestion}
                className="w-full sm:w-auto"
              >
                <span>{t.quiz.continueBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
