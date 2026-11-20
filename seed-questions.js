import {
  grammarQuestions,
  vocabularyQuestions
} from "./src/data/gameData.js";

import fs from "node:fs";

const questions = [
  ...grammarQuestions.map(q => ({
    id: `grammar-${q.id}`,
    mode: "grammar",
    questions: q.q,
    options: JSON.stringify(q.opts),
    correct_answer: q.a,
    topic: q.topic || "Grammar"
  })),

  ...vocabularyQuestions.map(q => ({
    id: `vocabulary-${q.id}`,
    mode: "vocabulary",
    question: q.q,
    options: JSON.stringify(q.opts),
    correct_answer: q.a,
    topic: q.topic || "Vocabulary"
  }))
];

const escapeSQL = value =>
  String(value ?? "").replace(/'/g, "''");

const sql = questions.map(q =>
  `INSERT OR REPLACE INTO questions
  (id, mode, questions, options, correct_answer, topic)
  VALUES (
    '${escapeSQL(q.id)}',
    '${escapeSQL(q.mode)}',
    '${escapeSQL(q.question)}',
    '${escapeSQL(q.options)}',
    ${Number(q.correct_answer)},
    '${escapeSQL(q.topic)}'
  );`
).join("\n");

fs.writeFileSync("questions.sql", sql);

console.log(`${questions.length} ta savol tayyorlandi!`);