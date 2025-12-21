export class RegisterView {
    constructor() {
        this.registerForm = document.getElementById('registerForm');
        this.usernameInput = document.getElementById('username');
        this.passwordInput = document.getElementById('password');
        this.gradeInput = document.getElementById('grade');
        this.mobileInput = document.getElementById('mobile');
        this.profilePictureInput = document.getElementById('profilePicture');
        this.profilePreview = document.getElementById('profilePreview');
        this.errorMessage = document.getElementById('errorMessage');
        this.successMessage = document.getElementById('successMessage');
    }
    // register form
    bindRegister(handler) {
        this.registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const mobileValue = this.mobileInput.value.trim();
            const phoneRegex = /^01[0125][0-9]{8}$/; // Egyptian phone number format

            if (!phoneRegex.test(mobileValue)) {
                this.showError("Please enter a valid Egyptian phone number.");
                return;
            }
            const formData = {
                username: this.usernameInput.value,
                password: this.passwordInput.value,
                grade: this.gradeInput.value,
                mobile: mobileValue,
                profilePicture: this.profilePictureInput.files[0]
            };
            handler(formData);
        });
    }
    // profile picture preview
    bindProfilePicturePreview() {
        this.profilePictureInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    this.profilePreview.innerHTML = `<img src="${event.target.result}" alt="Profile">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.style.display = 'block';
        this.successMessage.style.display = 'none';
    }

    showSuccess(message) {
        this.successMessage.textContent = message;
        this.successMessage.style.display = 'block';
        this.errorMessage.style.display = 'none';
    }
    // redirect to home page after successful registration
    redirect(url) {
        setTimeout(() => {
            window.location.href = url;
        }, 2000);
    }
}
