import type { TriviaItem } from '../data/trivia'

interface TriviaCardProps {
  item: TriviaItem
  showAnswer: boolean
  showSource: boolean
  density: 'full' | 'comfortable' | 'compact' | 'minimal'
  isPortrait: boolean
}

export function TriviaCard({ item, showAnswer, showSource, density, isPortrait }: TriviaCardProps) {
  const isFact = item.type === 'fact'
  const label = isFact ? 'Did You Know?' : 'Trivia Question'

  return (
    <div className={`trivia-card ${isPortrait ? 'trivia-card--portrait' : ''}`}>
      <span className="trivia-card__label">{label}</span>
      <p className="trivia-card__text">{item.text}</p>

      {!isFact && (
        <div className={`trivia-card__answer ${showAnswer ? 'trivia-card__answer--visible' : ''}`}>
          {item.answer}
        </div>
      )}

      {showSource && item.source && density !== 'minimal' && (
        <span className="trivia-card__source">{item.source}</span>
      )}
    </div>
  )
}
