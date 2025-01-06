import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged  } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import {  signOut   } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
const msg = document.querySelector(".message")
const left = document.querySelector(".left")
const right = document.querySelector(".right")
const neutarl = document.querySelector(".neutral")
const template = document.getElementById("template-news-card")
const spec = document.querySelector(".spec")
import { GoogleGenerativeAI } from "@google/generative-ai";
spec.style.display="none"
const firebaseConfig = {
    apiKey: "AIzaSyB50oHXItUqhtr6og2SyA-YjNJh3vquQKM",
    authDomain: "news-38eff.firebaseapp.com",
    projectId: "news-38eff",
    storageBucket: "news-38eff.firebasestorage.app",
    messagingSenderId: "248358233838",
    appId: "1:248358233838:web:32c2deec6f37057907f5ff"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth();
onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/auth.user
      const uid = user.uid;
      work();
      // ...
    } else {
      // User is signed out
      // ...
      window.location.href = "login.html"
    }
  });
document.querySelector(".logout").addEventListener('click',logout)
function logout(){
    signOut(auth).then(() => {
        window.location.href = "login.html"
    }).catch((error) => {
        alert(error.message)
    // An error happened.

    });
}
function work(){

    var key = "c1a67307-62f3-4b60-a9e8-80c6a6599140"
    let API_KEY = "AIzaSyDAPC7nPIUe1TiBknKtfO-EqaSJsglXjb4";
    let btn = document.getElementById("search")
    btn.addEventListener('click',func)
    let input = document.getElementById("text")
    let wanted =  14;
    let samjhana = "Analyze the following news article and assign it a political leaning score: 1 for Left-leaning, 2 for Right-leaning, and 3 for Neutral. Do not provide any explanation or additional text; only return the numerical classification (1, 2, or 3)."
    let url = "https://eventregistry.org/api/v1/article/getArticles"
    function func(){
        left.innerHTML=""
        right.innerHTML=""
        neutarl.innerHTML=""
        msg.innerText = "Getting News...";
        let query = input.value
        input.value=""
        var data = {
            "query": {
                "$query": {
                    "$and": [
                        {
                            "keyword": query,
                            "keywordLoc": "title"
                        },
                        {
                            "lang": "eng"
                        }
                    ]
                },
                "$filter": {
                    "forceMaxDataTimeWindow": "31"
                }
            },
            "articlesCount": wanted,
            "resultType": "articles",
            "articlesSortBy": "date",
            "includeSourceDescription": true,
            "apiKey": key
        };
        $.ajax({
            url: url,
            type: "POST",
            data: JSON.stringify(data),
            contentType: "application/json",
            success: async function(response) {
            let article = (response.articles.results);
            let ideology = []
            for(let i = 0;i<article.length;i++){
                let news_text = (article[i].body);
                const genAI = new GoogleGenerativeAI(API_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                try {
                    const prompt = samjhana + news_text;
                    const result = await model.generateContent(prompt);
                    ideology.push(result.response.text());
                } catch (error) {
                    if (error.message.includes("429")) {
                        msg.innerText =("Too many requests. Please try again after some time.");
                    } else {
                        msg.innerText = ("An unexpected error occurred:", error);
                    }
                }
            }
            msg.innerText=""
            for(let i = 0;i<ideology.length;i++){
                if(ideology[i].includes("1")){
                    ideology[i] = '1'
                }else if(ideology[i].includes("2")){
                    ideology[i] = '2'
                }else{
                    ideology[i] = '3'
                }
            }
            spec.style.display="flex"
            for(let i=0;i<ideology.length;i++){
                // console.log(ideology[i])
                // console.log(article[i])
                // console.log()
                const clone = template.content.cloneNode(true)
                clone.querySelector("#news-img").src = article[i].image
                clone.querySelector("#news-title").innerText = article[i].title
                clone.querySelector("#news-source").innerText = article[i].source.title
                clone.firstElementChild.addEventListener("click", () => {
                    window.open(article[i].url, "_blank");
                });
                if(ideology[i]==1){
                    left.appendChild(clone)
                }else if(ideology[i]==2){
                    right.appendChild(clone)
                }else{
                    neutarl.appendChild(clone)
                }
                
            }
            },
            error: function(xhr, status, error) {
            console.error("Error:", error);
            }
        });
    }
}