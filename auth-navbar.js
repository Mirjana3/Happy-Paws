
const firebaseConfig = {
    apiKey: "AIzaSyBX8BanaMhQyh93JfV5PM9MK7cNwB8EuoI",
    authDomain: "happypaws-shelter.firebaseapp.com",
    projectId: "happypaws-shelter",
    storageBucket: "happypaws-shelter.firebasestorage.app",
    messagingSenderId: "793183880153",
    appId: "1:793183880153:web:ed707020b24ffd289acfc8"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

function logout() {
    auth.signOut().then(() => {
        window.location.href = '../index.html'; 
    });
}

auth.onAuthStateChanged(user => {
    const navLinks = document.querySelector('.nav-links');
    const navButton = document.querySelector('.nav-button');

    if (!navLinks || !navButton) return; 

    if (user) {
        navLinks.innerHTML = `
            <a href="#mypage">My Page</a>
            <a href="#contact">Contact</a>
        `;
        navButton.innerHTML = `
            <span style="color:#ff7a00;font-weight:600;margin-right:10px">
                👋 ${user.email.split('@')[0]}
            </span>
            <button class="login-btn" onclick="logout()">Logout</button>
        `;
    } else {
        navLinks.innerHTML = `
            <a href="#about">About Us</a>
            <a href="#pets">Adopt Pets</a>
            <a href="#contact">Contact</a>
        `;
        navButton.innerHTML = `
            <button class="login-btn" onclick="window.location.href='pages/login.html'">Login</button>
            <button class="register-btn" onclick="window.location.href='pages/register.html'">Register</button>
        `;
    }
});
