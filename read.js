import { db } from "./firebase-config.js";
import { doc, getDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const articleId = params.get('id');

const contentDiv = document.getElementById('articleContent');
const bodyDiv = document.getElementById('articleBody');
const breadcrumbCat = document.getElementById('breadcrumbCat');
const coverDiv = document.getElementById('articleCover');
const likeCountEl = document.getElementById('likeCount');
const likeBtn = document.getElementById('likeBtn');

async function loadArticle(){
  if(!articleId){
    contentDiv.innerHTML = "<p>কোনো আর্টিকেল খুঁজে পাওয়া যায়নি।</p>";
    return;
  }
  try{
    const docRef = doc(db, "articles", articleId);
    const docSnap = await getDoc(docRef);
    if(docSnap.exists()){
      const art = docSnap.data();
      document.title = art.title + " — ইতিহাসবিদ";
      breadcrumbCat.textContent = art.badge;
      contentDiv.innerHTML = `
        <span class="cat">${art.cat}</span>
        <h1 class="headline">${art.title}</h1>
        <p class="article-lead">${art.desc}</p>
        <div class="article-meta"><span>লিখেছেন ${art.author}</span></div>
      `;
      if(art.image){
        coverDiv.style.backgroundImage = `url('${art.image}')`;
        coverDiv.style.backgroundSize = "cover";
        coverDiv.style.backgroundPosition = "center";
      }
      const paragraphs = art.body.split('\n').filter(p => p.trim() !== "");
      bodyDiv.innerHTML = paragraphs.map(p => `<p>${p}</p>`).join('');

      likeCountEl.textContent = art.likes || 0;

      // ভিউ কাউন্ট বাড়ানো
      await updateDoc(docRef, { views: increment(1) });

      // লাইক বাটন
      const likedKey = 'liked_' + articleId;
      if(localStorage.getItem(likedKey)){
        likeBtn.classList.add('liked');
      }
      likeBtn.addEventListener('click', async () => {
        if(localStorage.getItem(likedKey)) return;
        await updateDoc(docRef, { likes: increment(1) });
        const newLikes = (Number(likeCountEl.textContent) || 0) + 1;
likeCountEl.textContent = newLikes;
        localStorage.setItem(likedKey, 'true');
        likeBtn.classList.add('liked');
      });

      // শেয়ার বাটন
document.getElementById('shareBtn').addEventListener('click', async () => {
  const shareData = {
    title: art.title,
    text: art.desc,
    url: window.location.href
  };
  if(navigator.share){
    try{ await navigator.share(shareData); } catch(e){}
  } else {
    try {
  await navigator.clipboard.writeText(window.location.href);
  alert("লিংক কপি হয়েছে!");
} catch {
  alert("লিংক কপি করা যায়নি।");
}
  }
});

    } else {
      contentDiv.innerHTML = "<p>এই আর্টিকেলটি খুঁজে পাওয়া যায়নি।</p>";
    }
  } catch(err){
    contentDiv.innerHTML = "<p>আর্টিকেল লোড করতে সমস্যা হয়েছে।</p>";
  }
}
loadArticle();