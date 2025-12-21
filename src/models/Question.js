export class Question {
    constructor(questionText, image, answers, correctAnswer, difficulty, points) {
        this.questionText = questionText;
        this.image = image;
        this.answers = answers;
        this.correctAnswer = correctAnswer;
        this.difficulty = difficulty;
        this.points = points;
    }
}
