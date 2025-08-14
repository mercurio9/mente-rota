/* ---------- registro del Service Worker ---------- */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    // Registrar el SW
    navigator.serviceWorker
      .register("sw.js")
      .then((reg) => console.log("SW registrado:", reg.scope))
      .catch((err) => console.error("SW error:", err));

    // Lógica de instalación
    let deferredPrompt;
    const installBtn = document.getElementById("btn-install");

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredPrompt = e;
      installBtn.style.display = "block";

      installBtn.addEventListener("click", () => {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choice) => {
          console.log("User choice:", choice);
          deferredPrompt = null;
        });
      });
    });
  });
}

const hamburgerBtn = document.getElementById("hamburger-btn");
const navMenu = document.getElementById("nav-menu");

hamburgerBtn.addEventListener("click", () => {
  navMenu.classList.toggle("active");
});
