chrome.action.onClicked.addListener(() => {
  chrome.windows.create({
    url: "popup.html",
    type: "popup",
    width: 900,
    height: 800
  });
});