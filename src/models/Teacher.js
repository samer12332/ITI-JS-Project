import User from "./User.js"; 
export class Teacher extends User {
    constructor(
        username,
        password,
        mobile = null,
        profilePicture = null,
        examsCreated = [],
        id = null,
        theme = "default",
    ) {
        super(id, username, password, mobile, profilePicture, "teacher", theme );
        this.examsCreated = examsCreated;
    }
}