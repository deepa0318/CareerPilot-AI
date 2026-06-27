import { motion } from 'framer-motion';
import { getScoreColor, getScoreLabel } from '../utils/helpers';

export default function CircularProgress({ score = 0, size = 120, strokeWidth = 10, label = '', showLabel = true }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="#1e293b" strokeWidth={strokeWidth} fill="none" />
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke={color} strokeWidth={strokeWidth} fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="font-black text-white"
            style={{ fontSize: size / 4.5 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score}
          </motion.span>
          <span className="text-white/50" style={{ fontSize: size / 9 }}>/ 100</span>
        </div>
      </div>
      {showLabel && (
        <div className="text-center">
          <p className="text-sm font-semibold" style={{ color }}>{getScoreLabel(score)}</p>
          {label && <p className="text-xs text-white/50 mt-0.5">{label}</p>}
        </div>
      )}
    </div>
  );
}