import { auth, db } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ── LOGIN
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email    = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const btn      = document.getElementById("signin-btn");
    const err      = document.getElementById("error-msg");

    // Hide old error
    if (err) err.style.display = 'none';

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "dashboard.html";
    } catch (error) {
      // Show nice error instead of alert
      const msgs = {
        'auth/user-not-found':     'Yeh email registered nahi hai.',
        'auth/wrong-password':     'Password galat hai. Dobara try karo.',
        'auth/invalid-email':      'Email format sahi nahi hai.',
        'auth/too-many-requests':  'Zyada attempts. Thodi der baad try karo.',
        'auth/invalid-credential': 'Email ya password galat hai.',
      };
      if (err) {
        err.textContent = msgs[error.code] || 'Login fail: ' + error.message;
        err.style.display = 'block';
      }
      if (btn) {
        btn.textContent = 'Sign In';
        btn.classList.remove('loading');
      }
    }
  });
}

// ── AUTH STATE: dashboard protect + auto redirect
onAuthStateChanged(auth, (user) => {
  const path = location.pathname;

  // Agar dashboard pe hai aur logged out → index pe bhejo
  if (!user && (path.includes("dashboard") || path.includes("customers"))) {
    window.location.href = "index.html";
  }

  // Agar index pe hai aur logged in → dashboard pe bhejo
  if (user && (path.includes("index") || path.endsWith("/"))) {
    window.location.href = "dashboard.html";
  }
});

// ── LOGOUT
window.logout = async () => {
  await signOut(auth);
  window.location.href = "index.html";
};

// ── CUSTOMER FORM (customers.html pe)
const form = document.getElementById("customerForm");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name    = document.getElementById("name").value;
    const phone   = document.getElementById("phone").value;
    const address = document.getElementById("address").value;

    await addDoc(collection(db, "customers"), {
      name,
      phone,
      address,
      createdAt: new Date().toISOString()
    });

    form.reset();
    loadCustomers();
  });
}

// ── LOAD CUSTOMERS
async function loadCustomers() {
  const list = document.getElementById("list");
  if (!list) return;

  list.innerHTML = "";

  const snapshot = await getDocs(collection(db, "customers"));
  snapshot.forEach((doc) => {
    const d = doc.data();
    const li = document.createElement("li");
    li.innerHTML = `<b>${d.name}</b><br>${d.phone}<br>${d.address}<hr>`;
    list.appendChild(li);
  });
}

loadCustomers();
