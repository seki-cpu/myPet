import styles from './PawBackground.module.css';

const PAW_ROWS = 16;
const PAWS_PER_ROW = 10;
const pawSizes = [40, 32, 40, 48, 40, 32, 40, 48, 40, 40];

function PawIcon({ size }: { size: number }) {
  return (
    <svg
      className={styles.paw}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="currentColor"
      stroke="none"
      focusable="false"
      aria-hidden="true"
    >
      <ellipse cx="16" cy="21.5" rx="8.2" ry="7" />
      <ellipse cx="7.1" cy="14.3" rx="3.3" ry="4.3" transform="rotate(-24 7.1 14.3)" />
      <ellipse cx="12.4" cy="7.7" rx="3.3" ry="4.5" transform="rotate(-8 12.4 7.7)" />
      <ellipse cx="20.1" cy="7.7" rx="3.3" ry="4.5" transform="rotate(8 20.1 7.7)" />
      <ellipse cx="25.2" cy="14.3" rx="3.3" ry="4.3" transform="rotate(24 25.2 14.3)" />
    </svg>
  );
}

function PawPatternTile() {
  return (
    <div className={styles.pawPatternTile}>
      {Array.from({ length: PAW_ROWS }, (_, rowIndex) => (
        <div className={styles.pawRow} key={rowIndex}>
          {Array.from({ length: PAWS_PER_ROW }, (_, pawIndex) => (
            <PawIcon
              key={pawIndex}
              size={pawSizes[(pawIndex + rowIndex * 3) % pawSizes.length]}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function PawBackground() {
  return (
    <div className={styles.pawBackground} aria-hidden="true">
      <div className={styles.pawPattern}>
        <PawPatternTile />
        <PawPatternTile />
      </div>
    </div>
  );
}
