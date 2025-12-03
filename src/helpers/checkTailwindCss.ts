// Check if Tailwind CSS is available on the page
function isTailwindAvailable(): boolean {
  // Check if any element has Tailwind classes applied and they're working
  const testEl = document.createElement("div");
  testEl.className = "bg-yellow-300";
  testEl.style.display = "none";
  document.body.appendChild(testEl);

  const computed = window.getComputedStyle(testEl);
  const hasTailwind =
    computed.backgroundColor === "rgb(253, 224, 71)" ||
    computed.backgroundColor === "rgb(254, 240, 138)";

  document.body.removeChild(testEl);
  return hasTailwind;
}

export default isTailwindAvailable;
