/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, type FormEvent, useEffect } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, RotateCcw, Hash, ArrowRight, Gamepad2, X, Clock, Trophy, Languages, ChevronDown, Check } from "lucide-react";

type GameState = 'SETUP' | 'LOADING' | 'PLAYING' | 'GAME_OVER' | 'VICTORY';
type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
type GameMode = 'RACE' | 'ENDLESS';
type Language = 'en' | 'pt' | 'es' | 'fr' | 'de' | 'ja' | 'zh';

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
];

const TRANSLATIONS: Record<Language, any> = {
  en: {
    title: "LexiClue",
    subtitle: "Experience Themed Vocabulary",
    description: "Choose a theme and challenge your vocabulary",
    gameMode: "GAME MODE",
    theEvolution: "THE SPRINT",
    evoDesc: "Race to 5 correctly guessed words",
    theMarathon: "The Marathon",
    maraDesc: "Discover max words",
    matchTheme: "MATCH THEME",
    themePlaceholder: "Enter theme...",
    complexity: "COMPLEXITY",
    limit: "Limit",
    startGame: "START GAME",
    loadingPhrases: [
      "Searching the dictionary...",
      "Consulting the experts...",
      "Selecting the best words...",
      "Hiring a spelling bee champ...",
      "Waking up the AI...",
      "Polishing the vowels...",
      "Sharpening the consonants..."
    ],
    theme: "Theme",
    time: "Time",
    seq: "Seq",
    skip: "Skip",
    guessed: "Guessed!",
    success: "Success",
    gameFinished: "Game Finished",
    matchStats: "Match Stats",
    remainingTime: "Remaining Time",
    successfulGuesses: "Successful Guesses",
    skippedWords: "SKIPPED WORDS",
    restartGame: "Restart Game",
    newGame: "New Game",
    easy: "EASY",
    medium: "MEDIUM",
    hard: "HARD",
    difficultyPrompts: {
      EASY: 'very common, everyday objects or simple concepts everyone knows instantly',
      MEDIUM: 'moderately specific or slightly abstract concepts, still well-known but requiring more creative hints',
      HARD: 'specialized but still recognizable terms, or abstract concepts that are challenging to describe but known to the general public'
    }
  },
  pt: {
    title: "LexiClue",
    subtitle: "Experimente Vocabulário Temático",
    description: "Escolha um tema e desafie seu vocabulário",
    gameMode: "MODO DE JOGO",
    theEvolution: "A ARRANCADA",
    evoDesc: "Corra para 5 palavras adivinhadas",
    theMarathon: "A Maratona",
    maraDesc: "Descubra o máximo de palavras",
    matchTheme: "TEMA DA PARTIDA",
    themePlaceholder: "Digite o tema...",
    complexity: "COMPLEXIDADE",
    limit: "Limite",
    startGame: "INICIAR JOGO",
    loadingPhrases: [
      "Procurando no dicionário...",
      "Consultando especialistas...",
      "Selecionando as melhores palavras...",
      "Contratando um campeão de ortografia...",
      "Acordando a IA...",
      "Polindo as vogais...",
      "Afiando as consoantes..."
    ],
    theme: "Tema",
    time: "Tempo",
    seq: "Seq",
    skip: "Pular",
    guessed: "Acertou!",
    success: "Sucesso",
    gameFinished: "Partida Finalizada",
    matchStats: "Estatísticas",
    remainingTime: "Tempo Restante",
    successfulGuesses: "Acertos",
    skippedWords: "PALAVRAS PULADAS",
    restartGame: "Reiniciar Partida",
    newGame: "Novo Jogo",
    easy: "FÁCIL",
    medium: "MÉDIO",
    hard: "DIFÍCIL",
    difficultyPrompts: {
      EASY: 'objetos cotidianos muito comuns ou conceitos simples que todos conhecem instantaneamente',
      MEDIUM: 'conceitos moderadamente específicos ou levemente abstratos, ainda bem conhecidos mas que exigem dicas mais criativas',
      HARD: 'termos especializados mas ainda reconhecíveis, ou conceitos abstratos que são desafiadores de descrever, mas conhecidos pelo público em geral'
    }
  },
  es: {
    title: "LexiClue",
    subtitle: "Experimenta el Vocabulario Temático",
    description: "Elige un tema y desafía tu vocabulario",
    gameMode: "MODO DE JUEGO",
    theEvolution: "EL SPRINT",
    evoDesc: "Corre para adivinar 5 palabras",
    theMarathon: "El Maratón",
    maraDesc: "Descubre el máximo de palabras",
    matchTheme: "TEMA DE LA PARTIDA",
    themePlaceholder: "Ingresa el tema...",
    complexity: "COMPLEJIDAD",
    limit: "Límite",
    startGame: "EMPEZAR JUEGO",
    loadingPhrases: [
      "Buscando en el diccionario...",
      "Consultando a los expertos...",
      "Seleccionando las mejores palabras...",
      "Contratando a un campeón de ortografía...",
      "Despertando a la IA...",
      "Puliendo las vocales...",
      "Afilando las consonantes..."
    ],
    theme: "Tema",
    time: "Tiempo",
    seq: "Sec",
    skip: "Saltar",
    guessed: "¡Adivinado!",
    success: "Éxito",
    gameFinished: "Juego Terminado",
    matchStats: "Estadísticas",
    remainingTime: "Tiempo Restante",
    successfulGuesses: "Adivinanzas Exitosas",
    skippedWords: "PALABRAS SALTADAS",
    restartGame: "Reiniciar Juego",
    newGame: "Nuevo Juego",
    easy: "FÁCIL",
    medium: "MEDIO",
    hard: "DIFÍCIL",
    difficultyPrompts: {
      EASY: 'objetos cotidianos muy comunes o conceptos simples que todos conocen al instante',
      MEDIUM: 'conceptos moderadamente específicos o ligeramente abstractos, todavía conocidos pero que requieren pistas más creativas',
      HARD: 'términos especializados pero aún reconocibles, o conceptos abstractos que son difíciles de describir pero conocidos por el público en general'
    }
  },
  fr: {
    title: "LexiClue",
    subtitle: "Découvrez le Vocabulaire Thématique",
    description: "Choisissez un thème et défiez votre vocabulaire",
    gameMode: "MODE DE JEU",
    theEvolution: "LE SPRINT",
    evoDesc: "Course pour deviner 5 mots",
    theMarathon: "Le Marathon",
    maraDesc: "Découvrez le maximum de mots",
    matchTheme: "THÈME DU MATCH",
    themePlaceholder: "Entrez le thème...",
    complexity: "COMPLEXITÉ",
    limit: "Limite",
    startGame: "DÉMARRER LE JEU",
    loadingPhrases: [
      "Recherche dans le dictionnaire...",
      "Consultation des experts...",
      "Sélection des meilleurs mots...",
      "Embauche d'un champion d'orthographe...",
      "Réveil de l'IA...",
      "Polissage des voyelles...",
      "Affûtage des consonnes..."
    ],
    theme: "Thème",
    time: "Temps",
    seq: "Séqu",
    skip: "Passer",
    guessed: "Deviné !",
    success: "Succès",
    gameFinished: "Partie Terminée",
    matchStats: "Stats du Match",
    remainingTime: "Temps Restant",
    successfulGuesses: "Devinettes Réussies",
    skippedWords: "MOTS PASSÉS",
    restartGame: "Rejouer",
    newGame: "Nouveau Jeu",
    easy: "FACILE",
    medium: "MOYEN",
    hard: "DIFFICILE",
    difficultyPrompts: {
      EASY: 'objets quotidiens très courants ou concepts simples que tout le monde connaît instantanément',
      MEDIUM: 'concepts modérément spécifiques ou légèrement abstraits, encore bien connus mais nécessitant des indices plus créatifs',
      HARD: 'termes spécialisés mais encore reconnaissables, ou concepts abstraits difficiles à décrire mais connus du grand public'
    }
  },
  de: {
    title: "LexiClue",
    subtitle: "Thematischen Wortschatz Erleben",
    description: "Wähle ein Thema und fordere deinen Wortschatz heraus",
    gameMode: "SPIELMODUS",
    theEvolution: "DER SPRINT",
    evoDesc: "Rennen um 5 erratene Wörter",
    theMarathon: "Der Marathon",
    maraDesc: "Entdecke so viele Wörter wie möglich",
    matchTheme: "SPIELTHEMA",
    themePlaceholder: "Thema eingeben...",
    complexity: "KOMPLEXITÄT",
    limit: "Limit",
    startGame: "SPIEL STARTEN",
    loadingPhrases: [
      "Suche im Wörterbuch...",
      "Experten werden konsultiert...",
      "Die besten Wörter werden ausgewählt...",
      "Ein Rechtschreibprofi wird engagiert...",
      "KI wird aufgeweckt...",
      "Vokale werden poliert...",
      "Konsonanten werden geschärft..."
    ],
    theme: "Thema",
    time: "Zeit",
    seq: "Seq",
    skip: "Überspringen",
    guessed: "Erraten!",
    success: "Erfolg",
    gameFinished: "Spiel Beendet",
    matchStats: "Spielstatistiken",
    remainingTime: "Restzeit",
    successfulGuesses: "Erfolgeriches Raten",
    skippedWords: "ÜBERSPRUNGENE WÖRTER",
    restartGame: "Spiel Neustarten",
    newGame: "Neues Spiel",
    easy: "EINFACH",
    medium: "MITTEL",
    hard: "SCHWER",
    difficultyPrompts: {
      EASY: 'sehr häufige Alltagsgegenstände oder einfache Konzepte, die jeder sofort kennt',
      MEDIUM: 'mäßig spezifische oder leicht abstrakte Konzepte, die immer noch bekannt sind, aber kreativere Hinweise erfordern',
      HARD: 'Fachbegriffe, die aber noch erkennbar sind, oder abstrakte Konzepte, die schwer zu beschreiben, aber der Allgemeinheit bekannt sind'
    }
  },
  ja: {
    title: "LexiClue",
    subtitle: "テーマ別語彙を体験する",
    description: "テーマを選んで、語彙力に挑戦しましょう",
    gameMode: "ゲームモード",
    theEvolution: "スプリント",
    evoDesc: "5単語の正解を目指すレース",
    theMarathon: "マラソン",
    maraDesc: "最大単語数を発見する",
    matchTheme: "対戦テーマ",
    themePlaceholder: "テーマを入力...",
    complexity: "難易度",
    limit: "制限時間",
    startGame: "ゲーム開始",
    loadingPhrases: [
      "辞書を引いています...",
      "専門家に相談中...",
      "最高の単語を選択中...",
      "スペリングの達人を募集中...",
      "AIを起こしています...",
      "母音を磨いています...",
      "子音を研いでいます..."
    ],
    theme: "テーマ",
    time: "時間",
    seq: "順番",
    skip: "スキップ",
    guessed: "正解！",
    success: "成功",
    gameFinished: "ゲーム終了",
    matchStats: "対戦結果",
    remainingTime: "残り時間",
    successfulGuesses: "正解数",
    skippedWords: "スキップした単語",
    restartGame: "もう一度プレイ",
    newGame: "新しいゲーム",
    easy: "簡単",
    medium: "ふつう",
    hard: "難しい",
    difficultyPrompts: {
      EASY: '非常に一般的で日常的な物や、誰もがすぐにわかる簡単な概念',
      MEDIUM: 'ある程度具体的、あるいは少し抽象的な概念で、よく知られているがより独創的なヒントが必要なもの',
      HARD: '専門的だが認識可能な用語、あるいは説明するのは難しいが一般に知られている抽象的な概念'
    }
  },
  zh: {
    title: "LexiClue",
    subtitle: "体验主题词汇",
    description: "选择一个主题，挑战你的词汇量",
    gameMode: "游戏模式",
    theEvolution: "冲刺模式",
    evoDesc: "比赛猜对5个单词",
    theMarathon: "马拉松模式",
    maraDesc: "发现最多的单词",
    matchTheme: "比赛主题",
    themePlaceholder: "输入主题...",
    complexity: "复杂度",
    limit: "限制",
    startGame: "开始游戏",
    loadingPhrases: [
      "正在查字典...",
      "咨询专家中...",
      "挑选最棒的单词...",
      "雇佣拼写冠军...",
      "正在唤醒人工智能...",
      "打磨元音中...",
      "磨利辅音中..."
    ],
    theme: "主题",
    time: "时间",
    seq: "序列",
    skip: "跳过",
    guessed: "猜对了！",
    success: "成功",
    gameFinished: "游戏结束",
    matchStats: "比赛统计",
    remainingTime: "剩余时间",
    successfulGuesses: "猜对次数",
    skippedWords: "已跳过单词",
    restartGame: "重新开始",
    newGame: "新游戏",
    easy: "简单",
    medium: "中等",
    hard: "困难",
    difficultyPrompts: {
      EASY: '非常常见的日常物品或每个人都能立即理解的简单概念',
      MEDIUM: '中等程度的具体或略微抽象的概念，仍然广为人知，但需要更有创意的提示',
      HARD: '专业但仍可识别的术语，或描述起来具有挑战性但公众已知晓的抽象概念'
    }
  }
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>('SETUP');
  const [gameMode, setGameMode] = useState<GameMode>('ENDLESS');
  const [language, setLanguage] = useState<Language>('en');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [theme, setTheme] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [timerConfig, setTimerConfig] = useState(60); // Default 60 seconds
  const [timeLeft, setTimeLeft] = useState(60);
  const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);
  const [shuffledPhrases, setShuffledPhrases] = useState<string[]>([]);
  
  const [currentWord, setCurrentWord] = useState("");
  const [wordQueue, setWordQueue] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [successCount, setSuccessCount] = useState(0);
  const [skippedWords, setSkippedWords] = useState<string[]>([]);
  const [lastAction, setLastAction] = useState<'SUCCESS' | 'SKIP' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = TRANSLATIONS[language];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };

  const parseTimerInput = (input: string): number => {
    // 1:30 format
    if (input.includes(':')) {
      const [m, s] = input.split(':').map(Number);
      return (m * 60) + (s || 0);
    }
    // 2m format
    if (input.toLowerCase().includes('m')) {
      const parts = input.toLowerCase().split('m');
      const m = Number(parts[0]);
      const s = Number(parts[1]?.replace('s', '') || 0);
      return (m * 60) + s;
    }
    // Just seconds
    return Number(input.replace('s', '')) || 0;
  };

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'PLAYING' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'PLAYING') {
      setGameState('GAME_OVER');
    }
    return () => clearInterval(interval);
  }, [gameState, timeLeft]);

  // Loading phrase rotation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'LOADING' && shuffledPhrases.length > 0) {
      interval = setInterval(() => {
        setLoadingPhraseIndex((prev) => (prev + 1) % shuffledPhrases.length);
      }, 2000);
    } else {
      setLoadingPhraseIndex(0);
    }
    return () => clearInterval(interval);
  }, [gameState, shuffledPhrases.length]);

  // Shuffle phrases when entering loading state
  useEffect(() => {
    if (gameState === 'LOADING') {
      const shuffled = [...t.loadingPhrases].sort(() => Math.random() - 0.5);
      setShuffledPhrases(shuffled);
    }
  }, [gameState, language]);

  const startQuest = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!theme.trim()) return;
    
    setTimeLeft(timerConfig);
    setSuccessCount(0);
    setSkippedWords([]);
    setLastAction(null);
    setGameState('LOADING');
    await refillQueue(true);
  };

  const restartGame = () => {
    startQuest();
  };

  const refillQueue = async (isFirstFetch = false, forceNextWord = false) => {
    setLoading(true);
    setError(null);

    const wordCount = gameMode === 'RACE' ? 5 : 10;

    try {
      const apiBase = import.meta.env.VITE_API_URL ?? '';
      const response = await fetch(`${apiBase}/api/words`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme,
          language,
          difficulty,
          word_count: wordCount,
          history: history.slice(-20),
        }),
      });

      if (!response.ok) {
        const msg = await response.text().catch(() => '');
        throw new Error(response.status === 429 ? msg || 'Rate limit exceeded. Please wait and try again.' : `Server error: ${response.status}`);
      }

      const data: { words: string[] } = await response.json();
      if (data.words && Array.isArray(data.words)) {
        const newWords = data.words.filter(w => !history.includes(w));
        
        if (isFirstFetch) {
          const first = newWords[0];
          setCurrentWord(first);
          setHistory([first]);
          setWordQueue(newWords.slice(1));
          setGameState('PLAYING');
        } else {
          // In Marathon mode, we don't refill if we already have our pool
          if (gameMode !== 'RACE') {
            setWordQueue(prev => {
              const combined = [...prev, ...newWords];
              // If we were waiting for words (current word was empty or just finished), 
              // we should grab one immediately if the state is still PLAYING
              return combined;
            });

            // If we don't have a current word (exhausted queue) or forced, pick one from the new batch
            if ((!currentWord || forceNextWord) && newWords.length > 0) {
              const first = newWords[0];
              setCurrentWord(first);
              setHistory(prev => [...prev, first]);
              setWordQueue(newWords.slice(1));
            }
          }
        }
      } else {
        throw new Error("Invalid response");
      }
    } catch (err) {
      console.error("Error forging words:", err);
      if (isFirstFetch) {
        const msg = err instanceof Error ? err.message : "The theme escaped our grasp. Try another energy.";
        setError(msg);
        setGameState('SETUP');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (isSuccess: boolean) => {
    setLastAction(isSuccess ? 'SUCCESS' : 'SKIP');
    
    let newSuccessCount = successCount;
    if (isSuccess) {
      newSuccessCount += 1;
      setSuccessCount(newSuccessCount);
      // Remove from skipped words if it was recyled and guessed
      if (skippedWords.includes(currentWord)) {
        setSkippedWords(prev => prev.filter(w => w !== currentWord));
      }
    } else {
      // Skip logic: only add if truly new to skipped list
      if (!skippedWords.includes(currentWord)) {
        setSkippedWords(prev => [...prev, currentWord]);
      }
    }

    // Check for win condition in RACE mode
    if (gameMode === 'RACE' && newSuccessCount >= 5) {
      setGameState('VICTORY');
      return;
    }

    // For Sprint/Race mode, recycle the word to the end of the queue if skipped
    const isSprint = gameMode === 'RACE';
    
    if (wordQueue.length === 0) {
      if (!isSuccess && isSprint) {
        // If we skipped and it was the last word in Sprint, recycle it immediately
        setWordQueue([currentWord]);
      } else if (!isSprint) { // Marathon mode
        setCurrentWord(""); 
        refillQueue(false, true);
      } else {
        setGameState('GAME_OVER');
      }
      return;
    }

    const next = wordQueue[0];
    const remaining = wordQueue.slice(1);
    
    // In Sprint mode, if skipped, push back to end of the immediate queue
    if (!isSuccess && isSprint) {
      setWordQueue([...remaining, currentWord]);
    } else {
      setWordQueue(remaining);
    }
    
    setCurrentWord(next);
    setHistory(prev => [...prev, next]);

    if (!isSprint && remaining.length < 3 && !loading) {
      refillQueue();
    }
  };

  const resetGame = () => {
    setGameState('SETUP');
    setTheme("");
    setHistory([]);
    setWordQueue([]);
    setCurrentWord("");
    setSuccessCount(0);
    setTimeLeft(timerConfig);
  };

  return (
    <div className="fixed inset-0 bg-[#050505] text-white font-sans overflow-hidden select-none">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute inset-0 opacity-40 blur-[100px]"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${gameState === 'PLAYING' ? '#1A1A1A' : '#111'} 0%, transparent 80%)`
          }}
        />
        <AnimatePresence>
          {gameState === 'PLAYING' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"
            />
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'SETUP' && (
          <motion.div 
            key="setup"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative h-full w-full flex flex-col items-center justify-center p-4 overflow-y-auto"
          >
            {/* Language Selector Dropdown - Floating Top Right */}
            <div className="absolute top-4 right-4 md:top-8 md:right-8 z-[100]">
              <div className="relative">
                <button
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-xs font-bold backdrop-blur-md ${
                    isLangOpen 
                      ? 'bg-white text-black border-white' 
                      : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                  }`}
                >
                  <Languages className="w-4 h-4" />
                  <span className="hidden sm:inline">{LANGUAGES.find(l => l.code === language)?.label}</span>
                  <span className="sm:hidden">{LANGUAGES.find(l => l.code === language)?.flag}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isLangOpen && (
                    <>
                      {/* Backdrop to close */}
                      <div 
                        className="fixed inset-0 z-[-1]" 
                        onClick={() => setIsLangOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 py-2 w-48 bg-[#0D0D0D] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                      >
                        <div className="px-3 py-2 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#71717A]">Select Language</span>
                        </div>
                        {LANGUAGES.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              setLanguage(lang.code);
                              setIsLangOpen(false);
                            }}
                            className={`w-full px-4 py-2 text-left flex items-center justify-between transition-colors hover:bg-white/5 ${
                              language === lang.code ? 'text-white' : 'text-white/40'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{lang.flag}</span>
                              <span className="text-xs font-bold">{lang.label}</span>
                            </div>
                            {language === lang.code && <Check className="w-3 h-3 text-white" />}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <div className="max-w-2xl w-full py-8 space-y-8 md:space-y-10 text-center text-white">
              <div className="space-y-3">
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-[#71717A]"
                >
                  <Gamepad2 className="w-3 h-3" />
                  {t.subtitle}
                </motion.div>
                <motion.h1 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-[clamp(2rem,10vw,5.5rem)] md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] px-4 break-words"
                >
                  {t.title}
                </motion.h1>
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-[#71717A] text-base md:text-lg font-medium px-4"
                >
                  {t.description}
                </motion.p>
              </div>

              <motion.form 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                onSubmit={startQuest}
                className="space-y-6 md:space-y-8 bg-white/5 p-5 md:p-8 rounded-3xl border border-white/10 backdrop-blur-sm mx-auto"
              >
                {/* Mode Selection */}
                <div className="space-y-3 text-left">
                  <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-[#71717A] ml-2">{t.gameMode}</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <button
                      type="button"
                      onClick={() => setGameMode('RACE')}
                      className={`p-3 md:p-4 rounded-xl border transition-all flex flex-col gap-1 items-start text-left ${
                        gameMode === 'RACE' 
                          ? 'bg-white border-white text-black' 
                          : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30'
                      }`}
                    >
                      <span className="text-[10px] font-black uppercase leading-none">{t.theEvolution}</span>
                      <span className="text-[9px] md:text-[10px] font-medium opacity-60">{t.evoDesc}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGameMode('ENDLESS')}
                      className={`p-3 md:p-4 rounded-xl border transition-all flex flex-col gap-1 items-start text-left ${
                        gameMode === 'ENDLESS' 
                          ? 'bg-white border-white text-black' 
                          : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30'
                      }`}
                    >
                      <span className="text-[10px] font-black uppercase leading-none">{t.theMarathon}</span>
                      <span className="text-[9px] md:text-[10px] font-medium opacity-60">{t.maraDesc}</span>
                    </button>
                  </div>
                </div>

                {/* Theme Field */}
                <div className="relative group text-left">
                  <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-[#71717A] mb-2 block ml-2">{t.matchTheme}</label>
                  <div className="relative">
                    <Hash className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-5 md:w-6 h-5 md:h-6 text-white/20 group-focus-within:text-white/60 transition-colors" />
                    <input
                      type="text"
                      autoFocus
                      required
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      placeholder={t.themePlaceholder}
                      className="w-full bg-white/5 border-2 border-white/10 rounded-2xl py-4 md:py-5 pl-12 md:pl-16 pr-6 md:pr-8 text-lg md:text-xl outline-none focus:border-white/40 focus:bg-white/10 transition-all placeholder:text-white/10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 md:gap-6">
                  {/* Difficulty Button Group */}
                  <div className="space-y-3 text-left">
                    <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-[#71717A] ml-2">{t.complexity}</label>
                    <div className="flex bg-white/5 rounded-xl p-1 border border-white/10 overflow-hidden">
                      {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDifficulty(d)}
                          className={`flex-1 py-2 text-[8px] md:text-[10px] font-bold rounded-lg transition-all ${
                            difficulty === d ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white font-medium'
                          }`}
                        >
                          {t[d.toLowerCase()]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Timer Field */}
                  <div className="space-y-3 text-left">
                    <label className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-[#71717A] ml-2">
                      {t.limit} {timerConfig > 60 && `(${formatTime(timerConfig)})`}
                    </label>
                    <div className="relative flex items-center group">
                      <Clock className="absolute left-3 md:left-4 w-4 h-4 text-white/20 group-focus-within:text-white/60 transition-colors" />
                      <input
                        type="text"
                        required
                        value={timerConfig}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTimerConfig(parseTimerInput(val));
                        }}
                        placeholder="e.g. 2m or 1:30"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 md:pl-10 pr-3 text-xs md:text-sm font-bold outline-none focus:border-white/40 focus:bg-white/10 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!theme.trim() || loading}
                  className="w-full py-4 md:py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-20 transition-all hover:bg-white/90 active:scale-[0.98]"
                >
                  {loading ? <RotateCcw className="w-5 h-5 animate-spin" /> : <><span>{t.startGame}</span><ArrowRight className="w-5 h-5" /></>}
                </button>
              </motion.form>

              {error && <p className="text-red-400 text-xs font-bold uppercase tracking-widest pb-4">{error}</p>}
            </div>
          </motion.div>
        )}

        {gameState === 'LOADING' && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full w-full flex flex-col items-center justify-center gap-6"
          >
            <div className="relative w-16 md:w-24 h-16 md:h-24">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-4 border-white/5 border-t-white rounded-full"
              />
              <Sparkles className="absolute inset-0 m-auto w-6 md:w-8 h-6 md:h-8 text-white animate-pulse" />
            </div>
            <AnimatePresence mode="wait">
              <motion.p 
                key={loadingPhraseIndex}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] text-white/40 text-center px-8"
              >
                {shuffledPhrases[loadingPhraseIndex] || t.loadingPhrases[0]}
              </motion.p>
            </AnimatePresence>
          </motion.div>
        )}

        {gameState === 'PLAYING' && (
          <motion.div 
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative h-full w-full flex flex-col"
          >
            <header className="p-4 md:p-8 flex items-start md:items-center justify-between z-50">
              <div className="flex flex-wrap gap-4 md:gap-8">
                <div className="flex flex-col">
                  <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">{t.theme}</span>
                  <span className="text-xs md:text-sm font-bold uppercase tracking-widest">{theme}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">{t.complexity}</span>
                  <span className="text-xs md:text-sm font-bold uppercase tracking-widest">{t[difficulty.toLowerCase()]}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 md:gap-6">
                <div className="flex flex-col items-end">
                  <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">{t.time}</span>
                  <span className={`text-base md:text-xl font-black ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <button 
                  onClick={resetGame}
                  className="p-2 md:p-3 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/10"
                >
                  <X className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </header>

            <main className="flex-1 w-full flex items-center justify-center p-6 md:p-12 overflow-hidden select-none">
              <div className="relative text-center w-full max-w-7xl mx-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentWord}
                    initial={{ opacity: 0, scale: 0.8, filter: "blur(20px)", x: 0 }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)", x: 0 }}
                    exit={{ 
                      opacity: 0, 
                      scale: lastAction === 'SUCCESS' ? 1.2 : 1, 
                      x: lastAction === 'SKIP' ? -100 : (lastAction === 'SUCCESS' ? 0 : 0),
                      filter: "blur(20px)" 
                    }}
                    transition={{ 
                      type: "spring", 
                      damping: 25, 
                      stiffness: 150,
                      opacity: { duration: 0.3 }
                    }}
                    className="flex flex-col items-center justify-center min-h-[300px]"
                  >
                    <h2 
                      className="font-black uppercase tracking-tighter leading-[0.85] mix-blend-difference drop-shadow-2xl whitespace-nowrap px-6 max-w-full select-none"
                      style={{ 
                        fontSize: `clamp(1.5rem, ${Math.min(20, 95 / (currentWord.length || 1))}vw, 18rem)` 
                      }}
                    >
                      {currentWord}
                    </h2>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="mt-8 md:mt-12 flex items-center gap-3 md:gap-4 opacity-40"
                    >
                      <div className="h-[1px] w-8 md:w-12 bg-white" />
                      <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.6em] whitespace-nowrap">
                        {t.seq} 0{history.length}
                      </span>
                      <div className="h-[1px] w-8 md:w-12 bg-white" />
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </main>

            <footer className="p-8 md:p-12 flex items-center justify-center gap-6 md:gap-12 z-50">
              <button
                onClick={() => handleAction(false)}
                disabled={loading && wordQueue.length === 0}
                className="group flex flex-col items-center gap-2 md:gap-4 cursor-pointer"
              >
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/5 hover:border-white transition-all">
                  <X className="w-4 h-4 md:w-6 md:h-6 text-white/40 group-hover:text-red-400 group-hover:scale-110" />
                </div>
                <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.4em] text-white/20 group-hover:text-white">{t.skip}</span>
              </button>

              <button
                onClick={() => handleAction(true)}
                disabled={loading && wordQueue.length === 0}
                className="group relative flex flex-col items-center gap-2 md:gap-4 cursor-pointer"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-white/10 flex items-center justify-center group-hover:border-white group-hover:scale-110 transition-all active:scale-90 relative bg-white/5">
                  {(loading && wordQueue.length === 0) ? (
                    <RotateCcw className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
                  ) : (
                    <Sparkles className="w-6 h-6 md:w-8 md:h-8 group-hover:text-yellow-400 transition-colors" />
                  )}
                  {wordQueue.length > 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-white text-black text-[8px] md:text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#050505]">
                      {wordQueue.length}
                    </div>
                  )}
                </div>
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-white/40 group-hover:text-white transition-colors">
                  {t.guessed}
                </span>
                <div className="absolute top-full mt-1.5 text-[8px] md:text-[10px] text-[#71717A] uppercase tracking-widest font-black whitespace-nowrap">
                  {successCount} {t.success}
                </div>
              </button>
            </footer>
          </motion.div>
        )}

        {(gameState === 'GAME_OVER' || gameState === 'VICTORY') && (
          <motion.div 
            key={gameState}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="h-full w-full flex flex-col items-center justify-center p-6 md:p-8 text-center space-y-6 md:space-y-8 overflow-y-auto"
          >
            <div className="space-y-3 md:space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 10 }}
                className={`w-16 h-16 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(255,255,255,0.1)] ${gameState === 'VICTORY' ? 'bg-yellow-500 shadow-yellow-500/20' : 'bg-red-500 shadow-red-500/20'}`}
              >
                <Trophy className={`w-8 h-8 md:w-12 md:h-12 ${gameState === 'VICTORY' ? 'text-black' : 'text-white'}`} />
              </motion.div>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
                {t.gameFinished}
              </h2>
              <p className="text-[#71717A] uppercase tracking-[0.3em] font-bold text-xs md:text-sm">
                {t.matchStats}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 md:gap-8 py-6 md:py-8 border-y border-white/10 w-full max-w-md">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] md:text-[11px] font-bold text-[#71717A] uppercase tracking-widest">
                  {gameState === 'VICTORY' ? t.remainingTime : t.successfulGuesses}
                </span>
                <span className="text-2xl md:text-4xl font-black text-white">
                  {gameState === 'VICTORY' ? formatTime(timeLeft) : successCount}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] md:text-[11px] font-bold text-[#71717A] uppercase tracking-widest">{t.complexity}</span>
                <span className="text-2xl md:text-4xl font-black text-white">{t[difficulty.toLowerCase()]}</span>
              </div>
              <div className="flex flex-col gap-1 col-span-2 pt-4 border-t border-white/5">
                <span className="text-[10px] md:text-[11px] font-bold text-[#71717A] uppercase tracking-widest">{t.successfulGuesses}</span>
                <span className="text-xl md:text-2xl font-black text-white transition-all">
                  {successCount}
                </span>
              </div>
            </div>

            {skippedWords.length > 0 && (
              <div className="w-full max-w-md space-y-3">
                <h3 className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] text-[#71717A]">{t.skippedWords}</h3>
                <div className="flex flex-wrap justify-center gap-2 max-h-[120px] overflow-y-auto px-4 scrollbar-hide">
                  {skippedWords.map((word, i) => (
                    <motion.span 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      key={`${word}-${i}`} 
                      className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-white/40"
                    >
                      {word}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
              <button
                onClick={restartGame}
                className="flex-1 px-8 py-4 md:py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest hover:bg-white/90 transition-transform active:scale-95 text-xs md:text-sm"
              >
                {t.restartGame}
              </button>
              <button
                onClick={resetGame}
                className="flex-1 px-8 py-4 md:py-5 bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-white/20 transition-transform active:scale-95 text-xs md:text-sm border border-white/10"
              >
                {t.newGame}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .writing-vertical {
          writing-mode: vertical-rl;
          text-orientation: mixed;
          transform: rotate(180deg);
        }
      `}} />
    </div>
  );
}
