export class Exam {
    constructor(
        id,
        name,
        duration,
        questionCount,
        questions,
        createdBy,
        createdDate,
        assignedStudents,
        version = 1,
        parentId = null,
        isActive = true
    ) {
        this.id = id;
        this.name = name;
        this.duration = duration;
        this.questionCount = questionCount;
        this.questions = questions;
        this.createdBy = createdBy;
        this.createdDate = createdDate;
        this.assignedStudents = assignedStudents;

        this.version = version;
        this.parentId = parentId || id; // If no parentId, this exam is the root
        this.isActive = isActive;
    }
}