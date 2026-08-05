(function() {
  const API_URL = "https://functions.yandexcloud.net/d4e0djanh02gmh4he289"; // <-- замените на URL вашей функции
  const messagesEl = document.getElementById("messages");
  const inputEl = document.getElementById("userInput");
  const sendBtn = document.getElementById("sendBtn");
  const statusEl = document.getElementById("status");

  function showStatus(text, type) {
    statusEl.textContent = text;
    statusEl.className = "hw-chat__status " + (type || "");
  }

  async function sendMessage() {
    const text = (inputEl.value || "").trim();
    if (!text) return;

    // Показываем сообщение пользователя
    appendMessage(text, "msg-user");
    inputEl.value = "";
    showStatus("Отправляю...", "loading");

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) {
        const errData = await res.text().catch(() => "");
        throw new Error(res.status + (errData ? ": " + errData.substring(0, 200) : ""));
      }

      const data = await res.json();
      const answer = data.answer || "Нет ответа от бота.";
      appendMessage(answer, "msg-bot");
      showStatus("");
    } catch (e) {
      console.error(e);
      showStatus("Ошибка: " + e.message, "error");
    }
  }

  function appendMessage(text, className) {
    const div = document.createElement("div");
    div.className = className;
    // Простая защита от XSS: экранирование HTML
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  sendBtn.addEventListener("click", sendMessage);
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });
})();
