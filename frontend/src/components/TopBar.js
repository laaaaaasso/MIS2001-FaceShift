export function createTopBar({ onHome }) {
  const topBar = document.createElement("header");
  topBar.className = "top-bar";

  const left = document.createElement("div");
  left.className = "top-bar-left";
  const homeBtn = document.createElement("button");
  homeBtn.className = "ghost-btn";
  homeBtn.textContent = "Home";
  homeBtn.addEventListener("click", onHome);
  left.appendChild(homeBtn);

  const brand = document.createElement("div");
  brand.className = "brand";
  brand.innerHTML = "<span class='brand-dot'></span><span>FaceShift</span>";

  const right = document.createElement("div");
  right.className = "top-bar-right";
  const badge = document.createElement("span");
  badge.className = "phase-badge";
  badge.textContent = "UI Phase";
  right.appendChild(badge);

  topBar.appendChild(left);
  topBar.appendChild(brand);
  topBar.appendChild(right);
  return topBar;
}

