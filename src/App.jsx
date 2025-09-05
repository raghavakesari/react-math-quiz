import { useState, useEffect } from 'react';
import './App.css';

const generateQuestions = (count = 10) => {
  const questions = [];
  const usedQuestions = new Set();
  
  while (questions.length < count) {
    const operation = ['addition', 'subtraction', 'multiplication', 'division'][Math.floor(Math.random() * 4)];
    let a, b, correct, questionText;
    
    switch (operation) {
      case 'addition':
        a = Math.floor(Math.random() * 41) + 10; // 10-50
        b = Math.floor(Math.random() * 41) + 10;
        correct = a + b;
        questionText = `What is ${a} + ${b}?`;
        break;
      case 'subtraction':
        a = Math.floor(Math.random() * 41) + 20; // 20-60
        b = Math.floor(Math.random() * a) + 1;
        correct = a - b;
        questionText = `What is ${a} - ${b}?`;
        break;
      case 'multiplication':
        a = Math.floor(Math.random() * 13) + 3; // 3-15
        b = Math.floor(Math.random() * 13) + 3;
        correct = a * b;
        questionText = `What is ${a} * ${b}?`;
        break;
      case 'division':
        b = Math.floor(Math.random() * 13) + 3; // 3-15
        a = b * (Math.floor(Math.random() * 11) + 4); // multiple of b, 3*4=12 to 3*14=42
        correct = a / b;
        questionText = `What is ${a} ÷ ${b}?`;
        break;
    }
    
    // Avoid duplicate questions
    const key = `${operation}-${a}-${b}`;
    if (usedQuestions.has(key)) continue;
    usedQuestions.add(key);
    
    // Generate options
    const options = [correct];
    while (options.length < 4) {
      let wrong = correct + (Math.floor(Math.random() * 21) - 10); // -10 to +10
      if (!options.includes(wrong) && wrong >= 0) options.push(wrong);
    }
    
    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    
    questions.push({
      question: questionText,
      options: options.map(String),
      correct: String(correct)
    });
  }
  
  return questions;
};

const Question = ({ question, options, selectedAnswer, onSelectAnswer, feedback }) => {
  return (
    <div className="question">
      <h2>{question}</h2>
      <div className="options">
        {options.map((option, index) => (
          <button
            key={index}
            className={`option ${selectedAnswer === index ? 'selected' : ''} ${feedback && option === feedback.correct ? 'correct' : ''} ${feedback && selectedAnswer === index && option !== feedback.correct ? 'incorrect' : ''}`}
            onClick={() => onSelectAnswer(index)}
            disabled={feedback}
          >
            {option}
          </button>
        ))}
      </div>
      {feedback && (
        <div className="feedback">
          {feedback.isCorrect ? <p className="correct-msg">Correct!</p> : <p className="incorrect-msg">Incorrect! The correct answer is {feedback.correct}.</p>}
        </div>
      )}
    </div>
  );
};

const Results = ({ score, total, onRestart }) => {
  const percentage = Math.round((score / total) * 100);
  return (
    <div className="results">
      <h2>Quiz Complete!</h2>
      <p>Your Score: {score} out of {total} ({percentage}%)</p>
      <p className={`score-msg ${percentage >= 70 ? 'good' : 'poor'}`}>
        {percentage >= 70 ? 'Great job!' : 'Better luck next time!'}
      </p>
      <button onClick={onRestart} className="restart-btn">Restart Quiz</button>
    </div>
  );
};

function App() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    setQuestions(generateQuestions());
  }, []);

  const handleSelectAnswer = (index) => {
    if (feedback) return;
    setSelectedAnswer(index);
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = currentQuestion.options[index] === currentQuestion.correct;

    setFeedback({
      isCorrect,
      correct: currentQuestion.correct
    });

    setTimeout(() => {
      if (isCorrect) {
        setScore(score + 1);
      }
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setFeedback(null);
      } else {
        setShowResults(true);
      }
    }, 2000);
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResults(false);
    setFeedback(null);
    setQuestions(generateQuestions()); // Generate new questions on restart
  };

  if (showResults) {
    return <Results score={score} total={questions.length} onRestart={restartQuiz} />;
  }

  if (questions.length === 0) {
    return <div className="app"><h1>Loading...</h1></div>; // Loading while questions generate
  }

  return (
    <div className="app">
      <h1>Math Quiz</h1>
      <div className="progress">Question {currentQuestionIndex + 1} of {questions.length}</div>
      <div className="score">Score: {score}</div>
      <Question
        question={questions[currentQuestionIndex].question}
        options={questions[currentQuestionIndex].options}
        selectedAnswer={selectedAnswer}
        onSelectAnswer={handleSelectAnswer}
        feedback={feedback}
      />
    </div>
  );
}

export default App;
