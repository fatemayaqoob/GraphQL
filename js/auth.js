// Only redirect to dashboard if we're on the login page
if (isAuthenticated() && window.location.pathname.endsWith('login.html')) {
    window.location.href = 'dashboard.html';
}

const form =document.getElementById('loginForm');
const loginBtn =document.getElementById('loginBtn');
const usernameInput =document.getElementById('username');
const passwordInput =document.getElementById('password');

// Only set up login form if it exists (on login page)
if (form) {
    let errorEl = document.getElementById('error');
    if (!errorEl) {
        errorEl = document.createElement('p');
        errorEl.id = 'error';
        errorEl.className = 'error-message';
        form.appendChild(errorEl);
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        errorEl.textContent = '';
        loginBtn.disabled = true;
        loginBtn.textContent= 'Logging in...';

        try {
            const jwt = await login(username, password);

            localStorage.setItem('jwt', jwt);
            window.location.href = 'dashboard.html';
        } catch(err) {
            errorEl.textContent = err.message || 'Login failed, please recheck your credentials.';
            loginBtn.disabled = false;
            loginBtn.textContent = 'Enter Kingdom';
        }
    });
}

async function login(username, password) {
    const credentials = btoa(`${username}:${password}`);

    const res = await fetch(API_ENDPOINTS.signin, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${credentials}`
        }
    });
    
    if (!res.ok) {
        throw new Error('Invalid credentials');
    }

    // Get the JWT token - API returns it as plain text
    let jwt = await res.text();
    
    // Remove any whitespace/newlines/quotes
    jwt = jwt.trim();
    
    // Remove quotes if present (sometimes APIs wrap tokens in quotes)
    if (jwt.startsWith('"') && jwt.endsWith('"')) {
        jwt = jwt.slice(1, -1);
    }
    
    // Validate token format (should be 3 parts separated by dots)
    const parts = jwt.split('.');
    if (parts.length !== 3) {
        console.error('Invalid JWT format. Received:', jwt.substring(0, 50));
        throw new Error('Received invalid token format from server');
    }
    
    console.log('Token validated - Length:', jwt.length, 'Parts:', parts.length);
    
    return jwt;
}

function isAuthenticated() {
    const token = localStorage.getItem('jwt');
    if (!token) return false;

    // Basic token format check
    const parts = token.split('.');
    if (parts.length !== 3) {
        console.warn('Invalid JWT format');
        localStorage.removeItem('jwt');
        return false;
    }

    // Check if token is expired
    try {
        const decoded = decodeJWT(token);
        if (!decoded || !decoded.exp) {
            return true; // Token doesn't have expiry, assume valid
        }
        const now = Math.floor(Date.now() / 1000);
        return decoded.exp > now;
    } catch (e) {
        console.warn('JWT decode error:', e);
        return false;
    }
}

function getToken(){
    return localStorage.getItem('jwt');
}

function logout() {
    localStorage.removeItem('jwt');
    window.location.href = 'login.html';
}

function decodeJWT(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g,'+').replace(/_/g,'/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Error decoding JWT:', e);
        return null;
    }
}