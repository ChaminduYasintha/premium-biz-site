
import { supabase } from '../lib/supabase';

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const signupLink = document.getElementById("signupLink");
    if (signupLink) {
        signupLink.addEventListener("click", (e) => {
            e.preventDefault();
            alert("Please contact your system administrator to create an account.");
        });
    }
});

async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        showSuccess("Already logged in! Redirecting...");
        setTimeout(() => {
            window.location.href = "/admin";
        }, 1000);
    }
}

async function handleLogin(e: Event) {
    e.preventDefault();

    const emailInput = document.getElementById("email") as HTMLInputElement;
    const passwordInput = document.getElementById("password") as HTMLInputElement;
    const loginBtn = document.getElementById("loginBtn") as HTMLButtonElement;
    const loginText = document.getElementById("loginText");

    // Reset UI
    hideError();
    hideSuccess();

    if (loginBtn) loginBtn.disabled = true;
    if (loginText) loginText.innerHTML = 'Signing in<span class="loading-spinner"></span>';

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: emailInput.value,
            password: passwordInput.value,
        });

        if (error) throw error;

        if (data.session) {
            const successDiv = document.getElementById("successMessage");
            if (successDiv) {
                successDiv.innerHTML = 'Login successful! Redirecting... <br><a href="/admin" style="color: green; text-decoration: underline;">Click here if not redirected</a>';
                successDiv.classList.add("show");
            }

            setTimeout(() => {
                window.location.href = "/admin";
            }, 1000);
        }
    } catch (error: any) {
        console.error("Login error:", error);
        showError(error.message || "Invalid credentials.");
        if (loginBtn) loginBtn.disabled = false;
        if (loginText) loginText.textContent = "Sign In";
    }
}

function showError(message: string) {
    const errorDiv = document.getElementById("errorMessage");
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.add("show");
    }
}

function hideError() {
    document.getElementById("errorMessage")?.classList.remove("show");
}

function showSuccess(message: string) {
    const successDiv = document.getElementById("successMessage");
    if (successDiv) {
        successDiv.textContent = message;
        successDiv.classList.add("show");
    }
}

function hideSuccess() {
    document.getElementById("successMessage")?.classList.remove("show");
}
