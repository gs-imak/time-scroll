import { MCQCard } from './questions/MCQCard';
import { TrueFalseCard } from './questions/TrueFalseCard';
import { ImageIdCard } from './questions/ImageIdCard';
import { TimelineOrderCard } from './questions/TimelineOrderCard';
import type { QuizQuestion as QuizQuestionType } from './types';

interface Props {
  question: QuizQuestionType;
  selectedAnswer: number | boolean | number[] | null;
  isAnswered: boolean;
  eliminatedOptions: number[];
  onSelect: (answer: number | boolean | number[]) => void;
  onConfirm: () => void;
}

export function QuizQuestionRenderer({ question, selectedAnswer, isAnswered, eliminatedOptions, onSelect, onConfirm }: Props) {
  switch (question.type) {
    case 'mcq':
      return (
        <MCQCard
          question={question}
          selected={selectedAnswer as number | null}
          isAnswered={isAnswered}
          eliminatedOptions={eliminatedOptions}
          onSelect={(idx) => { onSelect(idx); onConfirm(); }}
        />
      );

    case 'true-false':
      return (
        <TrueFalseCard
          question={question}
          selected={selectedAnswer as boolean | null}
          isAnswered={isAnswered}
          onSelect={(val) => { onSelect(val); onConfirm(); }}
        />
      );

    case 'image-id':
      return (
        <ImageIdCard
          question={question}
          selected={selectedAnswer as number | null}
          isAnswered={isAnswered}
          eliminatedOptions={eliminatedOptions}
          onSelect={(idx) => { onSelect(idx); onConfirm(); }}
        />
      );

    case 'timeline-order':
      return (
        <TimelineOrderCard
          question={question}
          isAnswered={isAnswered}
          onSubmit={(order) => { onSelect(order); onConfirm(); }}
        />
      );

    default:
      return null;
  }
}
