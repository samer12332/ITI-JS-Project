export default class User {
    constructor(
        id = null,
        username,
        password,
        mobile = null,
        profilePicture = null,
        role = "student",
        theme = "default"

    ) {

        this.id = id;
        this.username = username;
        this.password = password;
        this.mobile = mobile;
        this.profilePicture = profilePicture;
        this.role = role;
        this.theme = theme;
    }

    checkPassword(password) {
        return this.password === password;
    }
}