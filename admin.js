import { auth, db } from "./firebase-config.js";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const loginSection = document.getElementById('loginSection');
const panelSection = document.getElementById('panelSection');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loginError = document.getElementById('loginError');

// লগইন
loginBtn.addEventListener('click', () => {
  const email = document.getElementById('emailInput').value;
  const password = document.getElementById('passwordInput').value;
  signInWithEmailAndPassword(auth, email, password)
    .catch(() => { loginError.textContent = "ভুল ইমেইল বা পাসওয়ার্ড।"; });
});

logoutBtn.addEventListener('click', () => signOut(auth));

onAuthStateChanged(auth, (user) => {
  if(user){
    loginSection.style.display = "none";
    panelSection.style.display = "block";
    loadArticles();
  } else {
    loginSection.style.display = "flex";
    panelSection.style.display = "none";
  }
});

// ট্যাব সুইচ করা
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(c => c.style.display = "none");
    document.getElementById('tab-' + btn.dataset.tab).style.display = "block";
    if(btn.dataset.tab === "list") loadArticles();
  });
});

// আর্টিকেল ফর্ম সাবমিট
let editingId = null;

document.getElementById('articleForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
  title: document.getElementById('artTitle').value,
  desc: document.getElementById('artDesc').value,
  image: document.getElementById('artImage').value,
  cat: document.getElementById('artCat').value,
  badge: document.getElementById('artBadge').value,
  author: document.getElementById('artAuthor').value,
  body: document.getElementById('artBody').value,
  createdAt: serverTimestamp(),
  views: editingId ? undefined : 0,
  likes: editingId ? undefined : 0
};

// undefined ফিল্ড বাদ দেওয়া (এডিট করার সময়)
Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

  try {
    if(editingId){
      await updateDoc(doc(db, "articles", editingId), data);
      document.getElementById('formMsg').style.color = "green";
      document.getElementById('formMsg').textContent = "আর্টিকেল আপডেট হয়েছে!";
      editingId = null;
    } else {
      await addDoc(collection(db, "articles"), data);
      document.getElementById('formMsg').style.color = "green";
      document.getElementById('formMsg').textContent = "আর্টিকেল প্রকাশিত হয়েছে!";
    }
    document.getElementById('articleForm').reset();
  } catch(err){
    document.getElementById('formMsg').style.color = "red";
    document.getElementById('formMsg').textContent = "সমস্যা হয়েছে: " + err.message;
  }
});

// আর্টিকেল লিস্ট লোড করা
async function loadArticles(){
  const listDiv = document.getElementById('articlesList');
  listDiv.innerHTML = "লোড হচ্ছে...";
  const snapshot = await getDocs(collection(db, "articles"));

  if(snapshot.empty){
    listDiv.innerHTML = "<p>এখনো কোনো আর্টিকেল যোগ করা হয়নি।</p>";
    return;
  }

  listDiv.innerHTML = "";
  snapshot.forEach(docSnap => {
    const art = docSnap.data();
    const card = document.createElement('div');
    card.className = "admin-article-card";
    
      card.innerHTML = `
  <div class="info">
    <h4>${art.title}</h4>
    <span>${art.badge} · ${art.cat} · 👁️ ${art.views || 0} ভিউ · ❤️ ${art.likes || 0} লাইক</span>
  </div>
      <div class="actions">
        <button class="edit-btn">এডিট</button>
        <button class="delete-btn">ডিলিট</button>
      </div>
    `;
    card.querySelector('.edit-btn').addEventListener('click', () => {
  document.getElementById('artTitle').value = art.title;
  document.getElementById('artDesc').value = art.desc;
  document.getElementById('artImage').value = art.image || '';
  document.getElementById('artCat').value = art.cat;
  document.getElementById('artBadge').value = art.badge;
  document.getElementById('artAuthor').value = art.author;
  document.getElementById('artBody').value = art.body;
  editingId = docSnap.id;
  document.querySelector('[data-tab="add"]').click();
});
    card.querySelector('.delete-btn').addEventListener('click', async () => {
      if(confirm("সত্যিই এই আর্টিকেলটা মুছে ফেলতে চাও?")){
        await deleteDoc(doc(db, "articles", docSnap.id));
        loadArticles();
      }
    });
    listDiv.appendChild(card);
  });
}