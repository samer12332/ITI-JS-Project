export class Result {
    constructor(id, examId, studentId, answers, score, totalPoints, earnedPoints, completedDate) {
        this.id = id;
        this.examId = examId;
        this.studentId = studentId;
        this.answers = answers;
        this.score = score;
        this.totalPoints = totalPoints;
        this.earnedPoints = earnedPoints;
        this.completedDate = completedDate;
    }
}
