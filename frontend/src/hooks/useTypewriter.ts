import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

export function useTypewriter(words: string[], { typeMs = 70, deleteMs = 35, holdMs = 1800 } = {}) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [text, setText] = useState(reduce ? words[0] : "");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (reduce) {
      const timer = window.setTimeout(() => {
        setIndex((i) => (i + 1) % words.length);
        setText(words[(index + 1) % words.length]);
      }, holdMs * 1.5);
      return () => window.clearTimeout(timer);
    }

    const word = words[index];
    let timer: number;
    if (!deleting && text === word) timer = window.setTimeout(() => setDeleting(true), holdMs);
    else if (deleting && text === "") {
      setDeleting(false);
      setIndex((i) => (i + 1) % words.length);
      return;
    } else {
      timer = window.setTimeout(
        () => setText(deleting ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1)),
        deleting ? deleteMs : typeMs,
      );
    }
    return () => window.clearTimeout(timer);
  }, [text, deleting, index, words, typeMs, deleteMs, holdMs, reduce]);

  return text;
}
