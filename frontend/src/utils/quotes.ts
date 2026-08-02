export interface Quote {
  question: string;
  answer: string;
  author: string;
}

export const quotes: Quote[] = [
  {
    question: "Do not save what is left after spending...",
    answer: "...but spend what is left after saving.",
    author: "Warren Buffett"
  },
  {
    question: "A budget is telling your money where to go...",
    answer: "...instead of wondering where it went.",
    author: "John C. Maxwell"
  },
  {
    question: "Wealth consists not in having great possessions...",
    answer: "...but in having few wants.",
    author: "Epictetus"
  },
  {
    question: "It's not your salary that makes you rich...",
    answer: "...it's your spending habits.",
    author: "Charles A. Jaffe"
  },
  {
    question: "The habit of saving is itself an education...",
    answer: "...it fosters every virtue, teaches self-denial, cultivates the sense of order, trains to forethought, and so broadens the mind.",
    author: "T.T. Munger"
  },
  {
    question: "Beware of little expenses...",
    answer: "...a small leak will sink a great ship.",
    author: "Benjamin Franklin"
  }
];
