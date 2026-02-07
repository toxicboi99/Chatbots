const prompt = document.querySelector("#prompt");
const chatContainer = document.querySelector(".chat-container");
const sendBtn = document.querySelector("#submit");
const imageBtn = document.querySelector("#image");
const imageInput = document.querySelector("#imageInput");

let selectedBase64 = null;

// ---------------- IMAGE PICK ----------------

imageBtn.addEventListener("click", () => imageInput.click());

imageInput.addEventListener("change", async () => {
  const file = imageInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    selectedBase64 = reader.result;
  };
  reader.readAsDataURL(file);
});

// ---------- typing dots ----------
function startTyping(el) {
  el.innerHTML = `<img src="Loading.gif" class="load" width="40">`;
}


function stopTyping(el) {
  // nothing needed now
}


// ---------- backend call ----------

async function askAI(text, image) {
  const res = await fetch("http://localhost:3000/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: text,
      image: image
    })
  });

  if (!res.ok) throw "Server error";

  const data = await res.json();
  return data.reply;
}

// ---------- UI helpers ----------

function createUserBox(msg, img) {
  let imgHtml = "";

  if (img) {
    imgHtml = `<img src="${img}" style="max-width:180px;border-radius:10px;margin-bottom:6px"><br>`;
  }

  return `
    <div class="user-chat-box">
      <img src="/img/user.png" class="avatar">
      <div class="user-chat-area">${imgHtml}${msg}</div>
    </div>
  `;
}

function createAIBox() {
  return `
    <div class="ai-chat-box">
<img src="/img/animation.gif" class="avatar">
      <div class="ai-chat-area"></div>
    </div>
  `;
}

// ---------- main ----------

async function handleChat(message) {
  if (!message.trim() && !selectedBase64) return;

  const img = selectedBase64;
  selectedBase64 = null;
  imageInput.value = "";

  prompt.value = "";

  chatContainer.innerHTML += createUserBox(message, img);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  setTimeout(async () => {
    chatContainer.innerHTML += createAIBox();
    chatContainer.scrollTop = chatContainer.scrollHeight;

    const aiArea = chatContainer.lastElementChild.querySelector(".ai-chat-area");
    startTyping(aiArea);

    try {
      const reply = await askAI(message, img);
      stopTyping(aiArea);

      aiArea.innerHTML = reply
        .replace(/\*\*/g, "")
        .replace(/\n/g, "<br>");

    } catch (e) {
      stopTyping(aiArea);
      aiArea.innerHTML = "Server error";
      console.error(e);
    }
  }, 300);
}

// ---------- events ----------

prompt.addEventListener("keydown", e => {
  if (e.key === "Enter") handleChat(prompt.value);
});

sendBtn.addEventListener("click", () => {
  handleChat(prompt.value);
});
/* Google login success */

function handleCredentialResponse(response){

  const data = JSON.parse(atob(response.credential.split('.')[1]));

  localStorage.setItem("username", data.name);

  document.getElementById("login").classList.remove("active");
  document.getElementById("chat").classList.add("active");

  addAI("Hello " + data.name + " 👋 How can I help you?");
}
