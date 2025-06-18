interface CharacterCounterProps {
  current: number;
  max: number;
  className?: string;
}

export const CharacterCounter = ({ 
  current, 
  max, 
  className = "" 
}: CharacterCounterProps) => {
  const percentage = (current / max) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;
  
  return (
    <span 
      className={`text-xs font-mono ${
        isAtLimit ? 'text-red-600' : isNearLimit ? 'text-orange-600' : 'text-gray-500'
      } ${className}`}
    >
      {current}/{max}
    </span>
  );
}; 