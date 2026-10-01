// Brilhartes — Firebase Auth + Firestore
// 1) Cole a configuração do seu projeto Firebase em firebaseConfig.
// 2) Defina o e-mail administrador em ADMIN_EMAIL antes de publicar.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, orderBy, onSnapshot, doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "COLE_SUA_API_KEY",
  authDomain: "SEU-PROJETO.firebaseapp.com",
  projectId: "SEU-PROJETO",
  storageBucket: "SEU-PROJETO.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID"
};
const ADMIN_EMAIL = "SEU_EMAIL_ADMIN@exemplo.com";
const WHATSAPP_NUMBER = "55DDDNUMERO"; // Ex.: 5567999999999, somente dígitos

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const $ = (id) => document.getElementById(id);
const products = [
 {name:"Caneca Afeto",category:"Canecas",description:"Caneca personalizada com nome ou frase especial.",price:"A partir de R$ 35,00",symbol:"♡",tone:""},
 {name:"Caneca Botânica",category:"Canecas",description:"Uma composição delicada inspirada na natureza.",price:"A partir de R$ 39,00",symbol:"✿",tone:"tone2"},
 {name:"Kit Presente",category:"Presentes",description:"Uma combinação pensada para surpreender.",price:"Sob consulta",symbol:"🎁",tone:"tone3"},
 {name:"Arte Personalizada",category:"Artes",description:"Arte digital criada a partir da sua ideia.",price:"A partir de R$ 25,00",symbol:"✧",tone:""},
 {name:"Caneca Memórias",category:"Canecas",description:"Uma foto ou lembrança transformada em presente.",price:"A partir de R$ 42,00",symbol:"☼",tone:"tone3"},
 {name:"Cartão Especial",category:"Presentes",description:"Um detalhe personalizado para acompanhar seu presente.",price:"A partir de R$ 12,00",symbol:"❀",tone:"tone2"}
];
let mode="login", currentUser=null, unsubscribeOrders=null;
function renderProducts(filter="Todos"){
  $("productGrid").innerHTML=products.filter(p=>filter==="Todos"||p.category===filter).map((p,i)=>`<article class="product-card"><div class="product-art ${p.tone}"><span>${p.symbol}</span></div><div class="product-info"><small>${p.category}</small><h3>${p.name}</h3><p>${p.description}</p><div class="product-bottom"><span class="price">${p.price}</span><button class="order-btn" data-product="${i}">Encomendar +</button></div></div></article>`).join("");
  document.querySelectorAll("[data-product]").forEach(btn=>btn.addEventListener("click",()=>openOrder(products[Number(btn.dataset.product)].name)));
}
renderProducts();
document.querySelectorAll(".filter").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");renderProducts(b.dataset.filter)}));
function whatsappUrl(text){return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`}
$("whatsLink").href=whatsappUrl("Olá! Gostaria de informações sobre os produtos da Brilhartes.");
$("floatWhats").href=$("whatsLink").href;
function openAuth(next){mode=next; $("authTitle").textContent=next==="signup"?"Crie sua conta":"Entre na sua conta";$("nameLabel").classList.toggle("hidden",next!=="signup");$("authName").required=next==="signup";$("authPassword").autocomplete=next==="signup"?"new-password":"current-password";$("authSubmit").textContent=next==="signup"?"Criar cadastro":"Entrar";$("authSwitch").innerHTML=next==="signup"?'Já tem uma conta? <button type="button" id="switchMode">Entrar</button>':'Ainda não tem conta? <button type="button" id="switchMode">Cadastre-se</button>'; $("switchMode").onclick=()=>openAuth(next==="signup"?"login":"signup");$("authMessage").textContent="";$("authModal").classList.remove("hidden")}
$("loginOpen").onclick=()=>openAuth("login");$("signupOpen").onclick=()=>openAuth("signup");$("modalClose").onclick=()=>$("authModal").classList.add("hidden");
$("authForm").addEventListener("submit",async e=>{e.preventDefault();const email=$("authEmail").value.trim(),password=$("authPassword").value;try{if(mode==="signup"){const name=$("authName").value.trim();const cred=await createUserWithEmailAndPassword(auth,email,password);await updateProfile(cred.user,{displayName:name});await setDoc(doc(db,"users",cred.user.uid),{name,email,createdAt:serverTimestamp()});}else{await signInWithEmailAndPassword(auth,email,password)}$("authModal").classList.add("hidden");$("authForm").reset()}catch(err){$("authMessage").textContent=authError(err.code)}});
function authError(code){const map={"auth/email-already-in-use":"Este e-mail já possui cadastro.","auth/invalid-email":"Informe um e-mail válido.","auth/weak-password":"A senha deve ter pelo menos 6 caracteres.","auth/invalid-credential":"E-mail ou senha incorretos.","auth/too-many-requests":"Muitas tentativas. Aguarde e tente novamente."};return map[code]||"Não foi possível concluir. Confira os dados e tente novamente."}
function openOrder(product="Encomenda personalizada"){ $("orderProduct").value=product;$("orderMessage").textContent="";$("orderModal").classList.remove("hidden")}
$("customOrder").onclick=()=>openOrder();$("orderClose").onclick=()=>$("orderModal").classList.add("hidden");
$("orderForm").addEventListener("submit",async e=>{e.preventDefault();if(!currentUser){$("orderModal").classList.add("hidden");openAuth("login");$("authMessage").textContent="Entre ou cadastre-se para enviar uma encomenda.";return}const item={uid:currentUser.uid,customerName:currentUser.displayName||"",email:currentUser.email,product:$("orderProduct").value.trim(),details:$("orderDetails").value.trim(),deadline:$("orderDeadline").value||null,status:"Recebido",createdAt:serverTimestamp()};try{await addDoc(collection(db,"orders"),item);const message=`Olá! Sou ${item.customerName}. Enviei uma solicitação pelo site Brilhartes. Produto: ${item.product}. Detalhes: ${item.details}. Prazo: ${item.deadline||"a combinar"}.`;window.open(whatsappUrl(message),"_blank","noopener");$("orderMessage").textContent="Solicitação registrada. Você também pode concluir o contato pelo WhatsApp.";$("orderForm").reset();setTimeout(()=>$("orderModal").classList.add("hidden"),1600)}catch(err){$("orderMessage").textContent="Não foi possível salvar. Verifique sua conexão e as regras do Firebase."}});
$("logoutBtn").onclick=()=>signOut(auth);
onAuthStateChanged(auth,async user=>{currentUser=user;$("loginOpen").classList.toggle("hidden",!!user);$("signupOpen").classList.toggle("hidden",!!user);$("logoutBtn").classList.toggle("hidden",!user);$("accountArea").classList.toggle("hidden",!user);$("adminArea").classList.toggle("hidden",!user||user.email?.toLowerCase()!==ADMIN_EMAIL.toLowerCase());if(unsubscribeOrders){unsubscribeOrders();unsubscribeOrders=null}if(!user)return;$("welcome").textContent=`Olá, ${user.displayName||user.email}`;const q=query(collection(db,"orders"),where("uid","==",user.uid),orderBy("createdAt","desc"));unsubscribeOrders=onSnapshot(q,snap=>{$("ordersList").innerHTML=snap.empty?'<p>Você ainda não possui encomendas.</p>':snap.docs.map(d=>orderMarkup(d.data())).join("")});if(user.email?.toLowerCase()===ADMIN_EMAIL.toLowerCase()){onSnapshot(query(collection(db,"orders"),orderBy("createdAt","desc")),snap=>{$("adminOrders").innerHTML=snap.empty?"Nenhum pedido registrado.":snap.docs.map(d=>orderMarkup(d.data(),true)).join("")})}});
function orderMarkup(o,admin=false){const date=o.createdAt?.toDate?.().toLocaleDateString("pt-BR")||"Agora";return `<article class="order-row"><div><b>${escapeHtml(o.product)}</b><div>${admin?escapeHtml(o.customerName||o.email):"Solicitação enviada"} · ${date}</div><small>${escapeHtml(o.details)}</small></div><span class="status">${escapeHtml(o.status||"Recebido")}</span></article>`}
function escapeHtml(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
