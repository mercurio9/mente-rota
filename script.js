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

/* ---------- descarga del manual ---------- */
function descargarManual() {
  const link = document.createElement("a");
  link.href = "manual-mente-rota.pdf";
  link.download = "Manual_Mente_Rota.pdf";
  link.click();
}
