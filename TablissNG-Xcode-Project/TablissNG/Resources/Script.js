document
  .querySelector("button.open-preferences")
  .addEventListener("click", () => {
    webkit.messageHandlers.controller.postMessage("open-preferences");
  });

document.querySelector("a").addEventListener("click", (e) => {
  e.preventDefault();
  webkit.messageHandlers.controller.postMessage("open-docs");
});
