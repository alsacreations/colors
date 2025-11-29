// Quiz Module
export class ColorQuiz {
  constructor(colors) {
    this.colors = colors.filter((c) => !c.system); // Exclude system colors
    this.totalQuestions = 10;
    this.currentQuestion = 0;
    this.score = 0;
    this.questions = [];

    this.initElements();
    this.attachEventListeners();
  }

  initElements() {
    this.dialog = document.getElementById("quiz-dialog");
    this.closeBtn = document.getElementById("quiz-close");
    this.startScreen = document.getElementById("quiz-start");
    this.gameScreen = document.getElementById("quiz-game");
    this.resultsScreen = document.getElementById("quiz-results");
    this.startBtn = document.getElementById("quiz-start-btn");
    this.nextBtn = document.getElementById("quiz-next-btn");
    this.replayBtn = document.getElementById("quiz-replay-btn");
    this.colorNameEl = document.getElementById("quiz-color-name");
    this.choicesEl = document.getElementById("quiz-choices");
    this.feedbackEl = document.getElementById("quiz-feedback");
    this.currentScoreEl = document.getElementById("quiz-current-score");
    this.questionNumEl = document.getElementById("quiz-question-num");
    this.finalScoreEl = document.getElementById("quiz-final-score");
    this.messageEl = document.getElementById("quiz-message");
  }

  attachEventListeners() {
    this.closeBtn.addEventListener("click", () => this.close());
    this.startBtn.addEventListener("click", () => this.startGame());
    this.nextBtn.addEventListener("click", () => this.nextQuestion());
    this.replayBtn.addEventListener("click", () => this.startGame());
  }

  open() {
    this.dialog.showModal();
  }

  close() {
    this.dialog.close();
    this.showScreen("start");
  }

  showScreen(screen) {
    this.startScreen.hidden = screen !== "start";
    this.gameScreen.hidden = screen !== "game";
    this.resultsScreen.hidden = screen !== "results";
  }

  startGame() {
    this.currentQuestion = 0;
    this.score = 0;
    this.questions = this.generateQuestions();
    this.showScreen("game");
    this.displayQuestion();
  }

  generateQuestions() {
    const questions = [];
    const usedColors = new Set();

    // Select interesting colors (not too common, not too obscure)
    const interestingColors = this.colors.filter(
      (c) => c.name.length >= 6 && c.name.length <= 15
    );

    for (let i = 0; i < this.totalQuestions; i++) {
      let correctColor;
      do {
        correctColor =
          interestingColors[
            Math.floor(Math.random() * interestingColors.length)
          ];
      } while (usedColors.has(correctColor.name));

      usedColors.add(correctColor.name);

      // Generate 5 wrong answers (6 choices total)
      const wrongColors = [];
      while (wrongColors.length < 5) {
        const randomColor =
          this.colors[Math.floor(Math.random() * this.colors.length)];
        if (
          randomColor.name !== correctColor.name &&
          !wrongColors.find((c) => c.name === randomColor.name)
        ) {
          wrongColors.push(randomColor);
        }
      }

      // Shuffle choices
      const choices = [correctColor, ...wrongColors].sort(
        () => Math.random() - 0.5
      );

      questions.push({
        correctColor,
        choices,
      });
    }

    return questions;
  }

  displayQuestion() {
    const question = this.questions[this.currentQuestion];

    this.colorNameEl.textContent = question.correctColor.name;
    this.questionNumEl.textContent = this.currentQuestion + 1;
    this.currentScoreEl.textContent = this.score;
    this.feedbackEl.hidden = true;
    this.nextBtn.hidden = true;

    // Clear previous choices
    this.choicesEl.innerHTML = "";

    // Create choice buttons
    question.choices.forEach((color) => {
      const button = document.createElement("button");
      button.className = "quiz-choice";
      button.style.backgroundColor = color.hex;
      button.setAttribute("data-color", color.name);
      button.setAttribute("aria-label", `Choisir cette couleur`);
      button.addEventListener("click", () => this.checkAnswer(color.name));
      this.choicesEl.appendChild(button);
    });
  }

  checkAnswer(selectedColorName) {
    const question = this.questions[this.currentQuestion];
    const isCorrect = selectedColorName === question.correctColor.name;

    if (isCorrect) {
      this.score++;
      this.currentScoreEl.textContent = this.score;
    }

    // Disable all choices
    const choices = this.choicesEl.querySelectorAll(".quiz-choice");
    choices.forEach((choice) => {
      choice.classList.add("disabled");
      choice.style.pointerEvents = "none";

      if (choice.dataset.color === question.correctColor.name) {
        choice.classList.add("correct");
      } else if (choice.dataset.color === selectedColorName && !isCorrect) {
        choice.classList.add("incorrect");
      }
    });

    // Show feedback
    this.feedbackEl.hidden = false;
    this.feedbackEl.className = `quiz-feedback ${
      isCorrect ? "correct" : "incorrect"
    }`;
    this.feedbackEl.textContent = isCorrect
      ? "✅ Bravo ! C'est la bonne couleur !"
      : `❌ Oups ! C'était ${selectedColorName}`;

    // Show next button or end game
    if (this.currentQuestion < this.totalQuestions - 1) {
      this.nextBtn.hidden = false;
    } else {
      setTimeout(() => this.showResults(), 2000);
    }
  }

  nextQuestion() {
    this.currentQuestion++;
    this.displayQuestion();
  }

  showResults() {
    this.showScreen("results");
    this.finalScoreEl.textContent = this.score;

    let message = "";
    if (this.score === 5) {
      message = "🏆 Parfait ! Vous êtes un expert des couleurs CSS !";
    } else if (this.score >= 3) {
      message = "👍 Bien joué ! Vous connaissez bien vos couleurs !";
    } else {
      message = "💪 Continuez à vous entraîner, vous progresserez !";
    }

    this.messageEl.textContent = message;
  }
}
