'use client'

import { motion, Transition, Variants } from 'motion/react'

type Props = {
  label: string
  fromFontVariationSettings: string
  toFontVariationSettings: string
  transition?: Transition
  staggerDuration?: number
  staggerFrom?: 'first' | 'last' | 'center' | number
  repeatDelay?: number
  className?: string
  onClick?: () => void
}

export const Breathing = ({
  label,
  fromFontVariationSettings,
  toFontVariationSettings,
  transition = {
    duration: 1.5,
    ease: 'easeInOut',
  },
  staggerDuration = 0.1,
  staggerFrom = 'first',
  repeatDelay = 0.1,
  className,
  onClick,
  ...props
}: Props) => {
  const letterVariants: Variants = {
    initial: { fontVariationSettings: fromFontVariationSettings },
    animate: (i) => ({
      fontVariationSettings: toFontVariationSettings,
      transition: {
        ...transition,
        repeat: Infinity,
        repeatType: 'mirror',
        delay: i * staggerDuration,
        repeatDelay: repeatDelay,
      },
    }),
  }

  const getCustomIndex = (index: number, total: number) => {
    if (typeof staggerFrom === 'number') {
      return Math.abs(index - staggerFrom)
    }
    switch (staggerFrom) {
      case 'first':
        return index
      case 'last':
        return total - 1 - index
      case 'center':
      default:
        return Math.abs(index - Math.floor(total / 2))
    }
  }

  const letters = label.split('')

  return (
    <span className={`${className}`} onClick={onClick} {...props}>
      {letters.map((letter: string, i: number) => (
        <motion.span
          key={i}
          className="inline-block whitespace-pre"
          aria-hidden="true"
          variants={letterVariants}
          initial="initial"
          animate="animate"
          custom={getCustomIndex(i, letters.length)}
        >
          {letter}
        </motion.span>
      ))}
      <span className="sr-only">{label}</span>
    </span>
  )
}
