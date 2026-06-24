import { Quote } from 'lucide-react';
import styles from './DailyQuote.module.css';

const QUOTES = [
  { text: 'Talk is cheap. Show me the code.', author: 'Linus Torvalds' },
  { text: 'First, solve the problem. Then, write the code.', author: 'John Johnson' },
  { text: '代码是写给人看的，顺便能在机器上运行。', author: 'Harold Abelson' },
  { text: '简单是可靠的先决条件。', author: 'Edsger Dijkstra' },
  { text: '任何傻瓜都能写出计算机能理解的代码，好的程序员写出人能理解的代码。', author: 'Martin Fowler' },
  { text: '调试的难度是编写代码的两倍。如果你已经尽可能聪明地编写代码，那么你将不够聪明去调试它。', author: 'Brian Kernighan' },
  { text: '计算机科学中没有什么问题是不能通过增加一个间接层来解决的。', author: 'David Wheeler' },
  { text: '过早优化是万恶之源。', author: 'Donald Knuth' },
  { text: '预测未来的最好方式就是创造它。', author: 'Alan Kay' },
  { text: 'Stay hungry, stay foolish.', author: 'Steve Jobs' },
  { text: '世界上最遥远的距离不是生与死，而是你在 if 里我在 else 里。', author: '程序猿' },
  { text: '我写的代码，只有上帝和我知道。现在，只有上帝知道了。', author: '佚名' },
  { text: 'If debugging is the process of removing bugs, then programming must be the process of putting them in.', author: 'Edsger Dijkstra' },
  { text: 'The best way to predict the future is to implement it.', author: 'David Heinemeier Hansson' },
  { text: '九层之台，起于累土；千里之行，始于足下。', author: '老子' },
  { text: 'Write code as if the next person to maintain it is a violent psychopath who knows where you live.', author: 'John Woods' },
  { text: 'Measuring programming progress by lines of code is like measuring aircraft building progress by weight.', author: 'Bill Gates' },
  { text: 'The computer was born to solve problems that did not exist before.', author: 'Bill Gates' },
];

function getDailyQuote() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  return QUOTES[dayOfYear % QUOTES.length];
}

export function DailyQuote() {
  const quote = getDailyQuote();

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>
        <Quote size={16} />
        每日一言
      </h3>
      <div className={styles.body}>
        <span className={styles.quoteMark}>"</span>
        <p className={styles.text}>{quote.text}</p>
        <span className={styles.author}>— {quote.author}</span>
      </div>
    </div>
  );
}
