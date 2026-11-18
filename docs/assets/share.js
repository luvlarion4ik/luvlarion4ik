const profileShare = document.querySelector("[data-share]");
const profileLink = profileShare.querySelector("[data-share-link]");
const profileStatus = profileShare.querySelector("[data-share-status]");

profileLink.addEventListener("click", async (event) => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  event.preventDefault();
  const url = profileLink.href;
  profileStatus.textContent = "";
  if (navigator.share) {
    try {
      await navigator.share({ title: profileShare.dataset.title, url });
      return;
    } catch (error) {
      if (error.name === "AbortError") return;
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    profileStatus.textContent = profileShare.dataset.copied;
  } catch {
    const manual = profileShare.querySelector("[data-share-manual]");
    const input = manual.querySelector("input");
    manual.hidden = false;
    input.focus();
    input.select();
  }
});
