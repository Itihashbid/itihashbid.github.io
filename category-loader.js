// category-loader.js
// সব category-*.html পেজে এই একই ফাইল ব্যবহার হবে।
// কোন category দেখাতে হবে তা HTML-এর div এর data-category অ্যাট্রিবিউট থেকে জানা যায়।

import { db } from "./firebase-config.js";
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

async function loadCategoryArticles(){
  const container = document.getElementById('categoryArticles');
  if(!container) return;

  const categoryName = container.dataset.category;

  try{
    const q = query(collection(db, "articles"), where("badge", "==", categoryName));
    const snapshot = await getDocs(q);

    if(snapshot.empty){
      container.innerHTML = "<p class='empty-state'>এই বিভাগে এখনো কোনো প্রতিবেদন যোগ করা হয়নি।</p>";
      return;
    }

    // নতুন লেখা আগে দেখানোর জন্য createdAt অনুযায়ী সাজানো হচ্ছে
    let articles = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
    articles.sort((a, b) => {
      const t1 = a.createdAt?.seconds || 0;
      const t2 = b.createdAt?.seconds || 0;
      return t2 - t1;
    });

    container.innerHTML = "";
    articles.forEach(art => {
      const card = document.createElement('a');
      card.href = `read.html?id=${art.id}`;
      card.className = "card";
      card.style.textDecoration = "none";
      const imgStyle = art.image ? `style="background-image:url('${art.image}'); background-size:cover; background-position:center;"` : '';
      card.innerHTML = `
        <div class="card-img" ${imgStyle}><span class="card-badge">${art.badge}</span></div>
        <div class="card-body">
          <span class="cat">${art.cat}</span>
          <h3 class="headline">${art.title}</h3>
          <p>${art.desc}</p>
          <div class="meta">লিখেছেন ${art.author}</div>
        </div>
      `;
      container.appendChild(card);
    });
  } catch(err){
    container.innerHTML = "<p class='empty-state'>লোড করতে সমস্যা হয়েছে।</p>";
  }
}

loadCategoryArticles();
