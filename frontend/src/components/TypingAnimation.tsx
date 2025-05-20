import { useState, useEffect } from 'react';

interface TypingAnimationProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

const TypingAnimation: React.FC<TypingAnimationProps> = ({ 
  text, 
  speed = 100, 
  className = "", 
  onComplete 
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      
      return () => clearTimeout(timeout);
    } else if (!isComplete) {
      setIsComplete(true);
      onComplete && onComplete();
    }
  }, [currentIndex, text, speed, isComplete, onComplete]);

  return <span className={className}>{displayedText}</span>;
};

export default TypingAnimation;
