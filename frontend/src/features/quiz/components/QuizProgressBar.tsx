import { motion } from 'framer-motion';

interface Props {
  total: number;
  current: number;
  answers: { correct: boolean }[];
  accentColor: string;
}

export function QuizProgressBar({ total, current, answers, accentColor }: Props) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => {
        const answered = i < answers.length;
        const isCurrent = i === current;
        const correct = answers[i]?.correct;

        let bg = '#1a1a24';
        if (answered) bg = correct ? '#6d9476' : '#b85454';
        else if (isCurrent) bg = accentColor;

        return (
          <motion.div
            key={i}
            className="h-1.5 rounded-full"
            style={{ background: bg, width: isCurrent ? 24 : 8 }}
            animate={{ width: isCurrent ? 24 : 8, background: bg }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          />
        );
      })}
    </div>
  );
}
