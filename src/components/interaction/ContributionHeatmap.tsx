import { useMemo } from 'react';
import { Hash } from 'lucide-react';
import { useReadingHistory } from '../../hooks/useReadingHistory';
import styles from './ContributionHeatmap.module.css';

const WEEKS = 18;
const DAYS = 7;
const DAY_LABELS = ['一', '', '三', '', '五', '', '日'];

// Green shades (GitHub-style, dark-theme)
const LEVEL_COLORS = [
  'var(--bg-tertiary)',
  '#1b4d30',
  '#1f7840',
  '#2ea856',
  '#3dd965',
];

interface DayCell {
  date: string;
  level: number;
  count: number;
}

function levelForCount(count: number): number {
  if (count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 10) return 3;
  return 4;
}

function buildCells(history: { readAt: string }[]): { weeks: DayCell[][]; total: number } {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - today.getDay() + 1 - (WEEKS - 1) * 7);
  startDate.setHours(0, 0, 0, 0);

  // Aggregate real reading history into date counts
  const countByDate = new Map<string, number>();
  for (const entry of history) {
    const d = entry.readAt.slice(0, 10);
    countByDate.set(d, (countByDate.get(d) || 0) + 1);
  }

  const weeks: DayCell[][] = [];
  let total = 0;

  for (let w = 0; w < WEEKS; w++) {
    const week: DayCell[] = [];
    for (let d = 0; d < DAYS; d++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + w * 7 + d);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

      if (date > today) {
        week.push({ date: dateStr, level: 0, count: 0 });
        continue;
      }

      const count = countByDate.get(dateStr) || 0;
      total += count;
      week.push({ date: dateStr, level: levelForCount(count), count });
    }
    weeks.push(week);
  }

  return { weeks, total };
}

/** Compute month labels for the top of the heatmap */
function getMonthLabels(weeks: DayCell[][]): { label: string; pct: number }[] {
  const labels: { label: string; pct: number }[] = [];
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  let lastMonth = -1;

  for (let w = 0; w < weeks.length; w++) {
    const midCell = weeks[w][3];
    if (!midCell) continue;
    const month = parseInt(midCell.date.split('-')[1], 10) - 1;
    if (month !== lastMonth) {
      labels.push({ label: months[month], pct: (w / weeks.length) * 100 });
      lastMonth = month;
    }
  }

  return labels;
}

export function ContributionHeatmap() {
  const { history } = useReadingHistory();
  const { weeks, total } = useMemo(() => buildCells(history), [history]);
  const monthLabels = useMemo(() => getMonthLabels(weeks), [weeks]);
  const totalContributions = total;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <Hash size={16} className={styles.icon} />
        <span>活跃记录</span>
        <span className={styles.total}>{totalContributions} 次活跃</span>
      </div>

      <div className={styles.heatmap}>
        {/* Month labels */}
        <div className={styles.monthRow}>
          <div className={styles.dayLabelSpacer} />
          <div className={styles.monthLabels}>
            {monthLabels.map((m) => (
              <span
                key={m.label}
                className={styles.monthLabel}
                style={{ left: `${m.pct}%` }}
              >
                {m.label}
              </span>
            ))}
          </div>
        </div>

        {/* Unified grid: day labels + tiles in the same grid for alignment */}
        <div className={styles.gridBody}>
          {/* Day labels — col 1 */}
          {DAY_LABELS.map((label, i) => (
            <span
              key={`day-${i}`}
              className={styles.dayLabel}
              style={{ gridRow: i + 1, gridColumn: 1 }}
            >
              {label}
            </span>
          ))}

          {/* Tiles — cols 2..19, rows 1..7 */}
          {weeks.map((week, wi) =>
            week.map((day, di) => (
              <span
                key={`${wi}-${di}`}
                className={styles.tile}
                style={{
                  gridRow: di + 1,
                  gridColumn: wi + 2,
                  background: LEVEL_COLORS[day.level],
                }}
                title={`${day.date}: ${day.count} 次`}
                data-level={day.level}
              />
            ))
          )}
        </div>

        {/* Legend */}
        <div className={styles.legend}>
          <span className={styles.legendLabel}>少</span>
          {LEVEL_COLORS.map((color, i) => (
            <span
              key={i}
              className={styles.legendTile}
              style={{ background: color }}
            />
          ))}
          <span className={styles.legendLabel}>多</span>
        </div>
      </div>
    </div>
  );
}
