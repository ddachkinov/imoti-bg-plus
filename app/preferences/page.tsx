'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QUESTIONNAIRE_STEPS, calculateWeightsFromAnswers } from '@/lib/questionnaire';

export default function PreferencesPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [loading, setLoading] = useState(false);

  const step = QUESTIONNAIRE_STEPS[currentStep];
  const isLastStep = currentStep === QUESTIONNAIRE_STEPS.length - 1;

  const handleAnswer = (optionId: string) => {
    if (step.multiSelect) {
      // Multi-select: toggle option
      const current = (answers[step.id] as string[]) || [];
      const updated = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      setAnswers({ ...answers, [step.id]: updated });
    } else {
      // Single select: set option
      setAnswers({ ...answers, [step.id]: optionId });
    }
  };

  const isSelected = (optionId: string): boolean => {
    const answer = answers[step.id];
    if (Array.isArray(answer)) {
      return answer.includes(optionId);
    }
    return answer === optionId;
  };

  const canProceed = (): boolean => {
    if (step.optional) return true;
    const answer = answers[step.id];
    if (step.multiSelect) {
      return Array.isArray(answer) && answer.length > 0;
    }
    return !!answer;
  };

  const handleNext = () => {
    if (isLastStep) {
      handleSubmit();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Calculate weights from answers
      const weights = calculateWeightsFromAnswers(answers);

      // Save to API
      const res = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryWeights: weights }),
      });

      if (!res.ok) {
        throw new Error('Failed to save preferences');
      }

      const data = await res.json();

      // Redirect to properties with preferences
      router.push(`/properties?preferenceId=${data.id}`);
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Грешка при запазване на предпочитанията');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.push('/properties');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Персонализирайте търсенето
          </h1>
          <p className="text-gray-600">
            Отговорете на няколко въпроса, за да намерим най-подходящите имоти за вас
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              Въпрос {currentStep + 1} от {QUESTIONNAIRE_STEPS.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(((currentStep + 1) / QUESTIONNAIRE_STEPS.length) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{
                width: `${((currentStep + 1) / QUESTIONNAIRE_STEPS.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Question card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            {step.question}
          </h2>

          {step.type === 'options' && step.options && (
            <div className="space-y-3">
              {step.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleAnswer(option.id)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition ${
                    isSelected(option.id)
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 bg-white'
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                        isSelected(option.id)
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-300'
                      }`}
                    >
                      {isSelected(option.id) && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="text-lg text-gray-800">{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {step.multiSelect && (
            <p className="mt-4 text-sm text-gray-500">
              ℹ️ Може да изберете повече от един отговор
            </p>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              ← Назад
            </button>
          )}

          <button
            onClick={handleNext}
            disabled={!canProceed() || loading}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition"
          >
            {loading ? (
              'Запазване...'
            ) : isLastStep ? (
              'Намери имоти →'
            ) : (
              'Напред →'
            )}
          </button>

          <button
            onClick={handleSkip}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 transition"
          >
            Прескочи
          </button>
        </div>
      </div>
    </div>
  );
}
