import User from "./User.js";

export class Student extends User {
    constructor(
        username,
        password,
        grade = null,
        mobile = null,
        profilePicture = null,
        id = null,
        completedExams = [],
        requiredExams = [],
        theme = "default",
    ) {

        super(id, username, password, mobile, profilePicture, "student", theme );;
        this.grade = grade;

        this.completedExams = completedExams;
        this.requiredExams = requiredExams;
      
    }
}