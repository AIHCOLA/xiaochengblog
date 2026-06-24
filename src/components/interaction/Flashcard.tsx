import { useState, useCallback, useEffect } from 'react';
import { Shuffle, Check, X, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as flashcardsApi from '../../api/flashcards';
import styles from './Flashcard.module.css';

interface Word {
  id: number;
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
}

const WORD_BANK: Word[] = [
  { id: 1, word: 'serendipity', phonetic: '/ˌser.ənˈdɪp.ə.ti/', meaning: '意外发现的美好事物；机缘巧合', example: 'Finding that café was pure serendipity.' },
  { id: 2, word: 'ephemeral', phonetic: '/ɪˈfem.ər.əl/', meaning: '短暂的；转瞬即逝的', example: 'The beauty of cherry blossoms is ephemeral.' },
  { id: 3, word: 'resilient', phonetic: '/rɪˈzɪl.i.ənt/', meaning: '有韧性的；能迅速恢复的', example: 'She is a resilient person who never gives up.' },
  { id: 4, word: 'ubiquitous', phonetic: '/juːˈbɪk.wɪ.təs/', meaning: '无处不在的；普遍存在的', example: 'Smartphones have become ubiquitous in modern life.' },
  { id: 5, word: 'eloquent', phonetic: '/ˈel.ə.kwənt/', meaning: '雄辩的；有口才的', example: 'She gave an eloquent speech at the ceremony.' },
  { id: 6, word: 'pragmatic', phonetic: '/præɡˈmæt.ɪk/', meaning: '务实的；实用的', example: 'We need a pragmatic approach to solve this problem.' },
  { id: 7, word: 'ambiguous', phonetic: '/æmˈbɪɡ.ju.əs/', meaning: '模棱两可的；含糊不清的', example: 'The contract language is ambiguous and needs clarification.' },
  { id: 8, word: 'meticulous', phonetic: '/məˈtɪk.jə.ləs/', meaning: '一丝不苟的；注意细节的', example: 'He is meticulous about his code reviews.' },
  { id: 9, word: 'verbose', phonetic: '/vɜːˈbəʊs/', meaning: '啰嗦的；冗长的', example: 'The documentation was too verbose and hard to follow.' },
  { id: 10, word: 'concise', phonetic: '/kənˈsaɪs/', meaning: '简洁的；简明的', example: 'Please give a concise summary of the report.' },
  { id: 11, word: 'inevitable', phonetic: '/ɪˈnev.ɪ.tə.bəl/', meaning: '不可避免的；必然发生的', example: 'Change is inevitable in the tech industry.' },
  { id: 12, word: 'diligent', phonetic: '/ˈdɪl.ɪ.dʒənt/', meaning: '勤奋的；勤勉的', example: 'A diligent student always completes homework on time.' },
  { id: 13, word: 'profound', phonetic: '/prəˈfaʊnd/', meaning: '深刻的；深远的', example: 'The book had a profound impact on my thinking.' },
  { id: 14, word: 'subtle', phonetic: '/ˈsʌt.əl/', meaning: '微妙的；不易察觉的', example: 'There is a subtle difference between the two designs.' },
  { id: 15, word: 'versatile', phonetic: '/ˈvɜː.sə.taɪl/', meaning: '多才多艺的；多功能的', example: 'Python is a versatile programming language.' },
  { id: 16, word: 'robust', phonetic: '/rəʊˈbʌst/', meaning: '健壮的；稳固的', example: 'We need a robust error handling system.' },
  { id: 17, word: 'intricate', phonetic: '/ˈɪn.trɪ.kət/', meaning: '错综复杂的；精细的', example: 'The watch has an intricate mechanical movement.' },
  { id: 18, word: 'advocate', phonetic: '/ˈæd.və.keɪt/', meaning: '提倡；拥护；倡导者', example: 'She advocates for open source software.' },
  { id: 19, word: 'candid', phonetic: '/ˈkæn.dɪd/', meaning: '坦率的；直言不讳的', example: 'Let me be candid about the project risks.' },
  { id: 20, word: 'scrutiny', phonetic: '/ˈskruː.tɪ.ni/', meaning: '仔细审查；审视', example: 'The proposal will face intense scrutiny from the board.' },
  { id: 21, word: 'plausible', phonetic: '/ˈplɔː.zə.bəl/', meaning: '似乎合理的；貌似可信的', example: 'Her explanation sounds plausible but needs verification.' },
  { id: 22, word: 'tangible', phonetic: '/ˈtæn.dʒə.bəl/', meaning: '有形的；可触摸的；实际的', example: 'We need to see tangible results by next quarter.' },
  { id: 23, word: 'leverage', phonetic: '/ˈliː.vər.ɪdʒ/', meaning: '利用；杠杆作用', example: 'We should leverage existing tools to speed up development.' },
  { id: 24, word: 'consensus', phonetic: '/kənˈsen.səs/', meaning: '共识；一致意见', example: 'The team reached a consensus on the architecture decision.' },
  { id: 25, word: 'feasible', phonetic: '/ˈfiː.zə.bəl/', meaning: '可行的；可能的', example: 'Is it feasible to finish this feature by Friday?' },
  { id: 26, word: 'alleviate', phonetic: '/əˈliː.vi.eɪt/', meaning: '减轻；缓解', example: 'This tool alleviates the pain of manual testing.' },
  { id: 27, word: 'compelling', phonetic: '/kəmˈpel.ɪŋ/', meaning: '引人入胜的；有说服力的', example: 'She made a compelling argument for the refactor.' },
  { id: 28, word: 'scrutinize', phonetic: '/ˈskruː.tɪ.naɪz/', meaning: '仔细检查；审视', example: 'Please scrutinize the pull request before merging.' },
  { id: 29, word: 'consolidate', phonetic: '/kənˈsɒl.ɪ.deɪt/', meaning: '合并；巩固', example: 'Let us consolidate the duplicate code into a shared module.' },
  { id: 30, word: 'alleviate', phonetic: '/əˈliː.vi.eɪt/', meaning: '减轻；缓解', example: 'This tool alleviates the pain of manual testing.' },
];

export function Flashcard() {
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [knownIds, setKnownIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    flashcardsApi.getKnownWordIds()
      .then((ids) => setKnownIds(ids))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isLoggedIn, authLoading]);

  const current = WORD_BANK[currentIdx];
  const known = knownIds.includes(current.id);

  const next = useCallback(() => {
    setFlipped(false);
    setCurrentIdx((prev) => (prev + 1) % WORD_BANK.length);
  }, []);

  const shuffle = useCallback(() => {
    setFlipped(false);
    setCurrentIdx(Math.floor(Math.random() * WORD_BANK.length));
  }, []);

  const markKnown = useCallback(() => {
    setKnownIds((prev) => (prev.includes(current.id) ? prev : [...prev, current.id]));
    flashcardsApi.markKnown(current.id).catch(() => {
      setKnownIds((prev) => prev.filter((id) => id !== current.id));
    });
    next();
  }, [current.id, next]);

  const markUnknown = useCallback(() => {
    setKnownIds((prev) => prev.filter((id) => id !== current.id));
    flashcardsApi.markUnknown(current.id).catch(() => {
      setKnownIds((prev) => [...prev, current.id]);
    });
    next();
  }, [current.id, next]);

  if (authLoading || loading) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <h3 className={styles.title}>单词闪卡</h3>
        </div>
        <div className={styles.flashcard}>
          <div className={styles.front}>
            <Loader2 size={20} className={styles.spinner} />
          </div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <h3 className={styles.title}>单词闪卡</h3>
        </div>
        <div className={styles.flashcard}>
          <div className={styles.front}>
            <span className={styles.word}>请先登录</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>单词闪卡</h3>
        <div className={styles.headerRight}>
          <span className={styles.progress}>{knownIds.length}/{WORD_BANK.length} 掌握</span>
          <button className={styles.shuffleBtn} onClick={shuffle} title="随机">
            <Shuffle size={13} />
          </button>
        </div>
      </div>

      <div className={`${styles.flashcard} ${flipped ? styles.flipped : ''}`} onClick={() => setFlipped((v) => !v)}>
        <div className={styles.front}>
          <span className={styles.word}>{current.word}</span>
          <span className={styles.phonetic}>{current.phonetic}</span>
          <span className={styles.hint}>点击翻转查看释义</span>
        </div>
        <div className={styles.back}>
          <span className={styles.meaning}>{current.meaning}</span>
          <span className={styles.example}>{current.example}</span>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={`${styles.btn} ${styles.unknownBtn}`} onClick={markUnknown}>
          <X size={14} />
          不认识
        </button>
        <button className={`${styles.btn} ${styles.knownBtn}`} onClick={markKnown}>
          <Check size={14} />
          认识
        </button>
      </div>

      {known && <div className={styles.mastered}>已掌握</div>}
    </div>
  );
}
