import React from 'react';
import { motion, Variants } from 'framer-motion';

interface ScrollTextProps {
  text: string;
  as?: React.ElementType;
  className?: string;
  letterAnime?: boolean;
  lineAnime?: boolean;
  direction?: 'up' | 'down' | 'left' | 'right';
  variants?: Variants;
  gradientText?: boolean;
}

export const ScrollText: React.FC<ScrollTextProps> = ({
  text,
  as: Component = 'h2',
  className = '',
  letterAnime = false,
  lineAnime = false,
  direction = 'up',
  variants,
  gradientText = false,
}) => {
  // Default animation direction offsets
  const getDirectionOffset = () => {
    switch (direction) {
      case 'up': return { y: 40, x: 0 };
      case 'down': return { y: -40, x: 0 };
      case 'left': return { x: 40, y: 0 };
      case 'right': return { x: -40, y: 0 };
      default: return { y: 40, x: 0 };
    }
  };

  const defaultContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: letterAnime ? 0.03 : lineAnime ? 0.15 : 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const defaultChildVariants: Variants = {
    hidden: {
      opacity: 0,
      filter: 'blur(12px)',
      ...getDirectionOffset(),
    },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      x: 0,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.215, 0.61, 0.355, 1.0], // Apple smooth cubic-bezier
      },
    },
  };

  const activeContainerVariants = variants || defaultContainerVariants;
  const activeChildVariants = defaultChildVariants;

  if (letterAnime) {
    const letters = Array.from(text);
    return (
      <Component className={className}>
        <motion.span
          className={`inline-block ${gradientText ? 'bg-gradient-to-r from-white via-[#00FF87] to-emerald-400 bg-clip-text text-transparent' : ''}`}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: '-10% 0px' }}
          variants={activeContainerVariants}
        >
          {letters.map((char, index) => (
            <motion.span
              key={`${char}-${index}`}
              className="inline-block"
              variants={activeChildVariants}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </motion.span>
      </Component>
    );
  }

  if (lineAnime) {
    const lines = text.split('\n');
    return (
      <Component className={className}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: '-10% 0px' }}
          variants={activeContainerVariants}
          className="space-y-2"
        >
          {lines.map((line, index) => (
            <motion.div
              key={index}
              variants={activeChildVariants}
              className={`${gradientText ? 'bg-gradient-to-r from-white via-[#00FF87] to-emerald-400 bg-clip-text text-transparent' : ''}`}
            >
              {line}
            </motion.div>
          ))}
        </motion.div>
      </Component>
    );
  }

  return (
    <Component className={className}>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, margin: '-10% 0px' }}
        variants={activeContainerVariants}
      >
        <motion.span
          variants={activeChildVariants}
          className={`inline-block ${gradientText ? 'bg-gradient-to-r from-white via-[#00FF87] to-emerald-400 bg-clip-text text-transparent' : ''}`}
        >
          {text}
        </motion.span>
      </motion.div>
    </Component>
  );
};
