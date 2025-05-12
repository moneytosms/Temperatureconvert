// DOM Elements
const themeToggle = document.getElementById("themeToggle");
const convertBtn = document.getElementById("convertBtn");
const clearBtn = document.getElementById("clearBtn");
const swapBtn = document.getElementById("swapBtn");
const fromTemp = document.getElementById("fromTemp");
const toTemp = document.getElementById("toTemp");
const fromUnit = document.getElementById("fromUnit");
const toUnit = document.getElementById("toUnit");
const result = document.getElementById("result");

// Temperature conversion constants
const ABSOLUTE_ZERO = {
  celsius: -273.15,
  fahrenheit: -459.67,
  kelvin: 0,
  rankine: 0,
};

// Conversion functions
const convertToCelsius = {
  celsius: (temp) => temp,
  fahrenheit: (temp) => ((temp - 32) * 5) / 9,
  kelvin: (temp) => temp - 273.15,
  rankine: (temp) => ((temp - 491.67) * 5) / 9,
};

const convertFromCelsius = {
  celsius: (temp) => temp,
  fahrenheit: (temp) => (temp * 9) / 5 + 32,
  kelvin: (temp) => temp + 273.15,
  rankine: (temp) => ((temp + 273.15) * 9) / 5,
};

// Theme handling
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute("data-theme") === "dark";
  const newTheme = isDark ? "light" : "dark";
  const icon = themeToggle.querySelector("i");

  // Animate theme toggle
  icon.style.transform = "rotate(360deg)";
  setTimeout(() => {
    icon.style.transform = "";
    icon.className = isDark ? "fas fa-moon" : "fas fa-sun";
  }, 300);

  html.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
}

// Initialize theme
function initTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  themeToggle.querySelector("i").className =
    savedTheme === "dark" ? "fas fa-sun" : "fas fa-moon";
}

// History functionality
const historyBtn = document.getElementById("historyBtn");
const historyContainer = document.getElementById("historyContainer");
const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

// Maximum number of history items to store
const MAX_HISTORY_ITEMS = 10;

// Load history from localStorage
let conversionHistory =
  JSON.parse(localStorage.getItem("conversionHistory")) || [];

function toggleHistory() {
  historyContainer.classList.toggle("show");
  if (historyContainer.classList.contains("show")) {
    updateHistoryList();
  }
}

function addToHistory(fromValue, fromUnit, toValue, toUnit) {
  const historyItem = {
    fromValue,
    fromUnit,
    toValue,
    toUnit,
    timestamp: new Date().toISOString(),
  };

  // Add to beginning of array
  conversionHistory.unshift(historyItem);

  // Keep only the most recent items
  if (conversionHistory.length > MAX_HISTORY_ITEMS) {
    conversionHistory = conversionHistory.slice(0, MAX_HISTORY_ITEMS);
  }

  // Save to localStorage
  localStorage.setItem("conversionHistory", JSON.stringify(conversionHistory));

  // Update history list if visible
  if (historyContainer.classList.contains("show")) {
    updateHistoryList();
  }
}

function updateHistoryList() {
  historyList.innerHTML = "";

  if (conversionHistory.length === 0) {
    historyList.innerHTML =
      '<div class="history-item">No conversion history</div>';
    return;
  }

  conversionHistory.forEach((item, index) => {
    const historyItem = document.createElement("div");
    historyItem.className = "history-item";

    const date = new Date(item.timestamp);
    const timeString = date.toLocaleTimeString();
    const dateString = date.toLocaleDateString();

    historyItem.innerHTML = `
      <div class="conversion">
        ${item.fromValue}°${item.fromUnit.charAt(0).toUpperCase()} = ${
      item.toValue
    }°${item.toUnit.charAt(0).toUpperCase()}
      </div>
      <div class="timestamp">${dateString} ${timeString}</div>
      <div class="actions">
        <button class="use-btn" aria-label="Use this conversion">
          <i class="fas fa-redo"></i>
        </button>
        <button class="delete-btn" aria-label="Delete this conversion">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;

    // Add event listeners for the buttons
    const useBtn = historyItem.querySelector(".use-btn");
    const deleteBtn = historyItem.querySelector(".delete-btn");

    useBtn.addEventListener("click", () => {
      fromTemp.value = item.fromValue;
      fromUnit.value = item.fromUnit;
      toUnit.value = item.toUnit;
      convert();
    });

    deleteBtn.addEventListener("click", () => {
      conversionHistory.splice(index, 1);
      localStorage.setItem(
        "conversionHistory",
        JSON.stringify(conversionHistory)
      );
      updateHistoryList();
    });

    historyList.appendChild(historyItem);
  });
}

function clearHistory() {
  conversionHistory = [];
  localStorage.removeItem("conversionHistory");
  updateHistoryList();
}

// Temperature conversion
function convert() {
  const fromValue = parseFloat(fromTemp.value);
  const fromUnitValue = fromUnit.value;
  const toUnitValue = toUnit.value;

  if (isNaN(fromValue)) {
    showError("Please enter a valid temperature");
    return;
  }

  // Check for absolute zero
  if (fromValue < ABSOLUTE_ZERO[fromUnitValue]) {
    showError("Temperature cannot be below absolute zero");
    return;
  }

  // Convert to Celsius first, then to target unit
  const celsius = convertToCelsius[fromUnitValue](fromValue);
  const converted = convertFromCelsius[toUnitValue](celsius);

  // Add to history
  addToHistory(fromValue, fromUnitValue, converted.toFixed(2), toUnitValue);

  // Update result with animation
  toTemp.value = converted.toFixed(2);
  toTemp.classList.add("updated");
  setTimeout(() => {
    toTemp.classList.remove("updated");
  }, 300);

  result.textContent = `${fromValue}°${fromUnitValue
    .charAt(0)
    .toUpperCase()} = ${converted.toFixed(2)}°${toUnitValue
    .charAt(0)
    .toUpperCase()}`;
  result.style.color = "var(--primary-color)";
}

function showError(message) {
  result.textContent = message;
  result.style.color = "var(--secondary-color)";

  // Shake animation for error
  result.style.animation = "shake 0.5s ease-in-out";
  setTimeout(() => {
    result.style.animation = "";
  }, 500);
}

// Swap units
function swapUnits() {
  const tempFrom = fromTemp.value;
  const unitFrom = fromUnit.value;

  // Animate swap button
  swapBtn.style.transform = "rotate(180deg)";
  setTimeout(() => {
    swapBtn.style.transform = "";
  }, 300);

  fromTemp.value = toTemp.value;
  toTemp.value = tempFrom;
  fromUnit.value = toUnit.value;
  toUnit.value = unitFrom;

  // Update result if there's a value
  if (fromTemp.value) {
    convert();
  }
}

// Clear form
function clearForm() {
  fromTemp.value = "";
  toTemp.value = "";
  result.textContent = "Enter a temperature to convert";
  result.style.color = "var(--text-color)";

  // Animate clear button
  clearBtn.style.transform = "rotate(-180deg)";
  setTimeout(() => {
    clearBtn.style.transform = "";
  }, 300);
}

// Button state management
function updateButtonState() {
  const hasValue = fromTemp.value !== "";
  convertBtn.disabled = !hasValue;

  // Animate button state change
  if (hasValue) {
    convertBtn.style.transform = "scale(1.05)";
    setTimeout(() => {
      convertBtn.style.transform = "";
    }, 200);
  }
}

// Event Listeners
themeToggle.addEventListener("click", toggleTheme);

convertBtn.addEventListener("click", () => {
  convertBtn.style.transform = "scale(0.95)";
  setTimeout(() => {
    convertBtn.style.transform = "";
    convert();
  }, 100);
});

clearBtn.addEventListener("click", clearForm);
swapBtn.addEventListener("click", swapUnits);

fromTemp.addEventListener("input", () => {
  updateButtonState();
  if (fromTemp.value) {
    convert();
  }
});

fromUnit.addEventListener("change", () => {
  if (fromTemp.value) {
    convert();
  }
});

toUnit.addEventListener("change", () => {
  if (fromTemp.value) {
    convert();
  }
});

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey) {
    switch (e.key.toLowerCase()) {
      case "enter":
        if (!convertBtn.disabled) {
          e.preventDefault();
          convert();
        }
        break;
      case "r":
        e.preventDefault();
        clearForm();
        break;
      case "s":
        e.preventDefault();
        swapUnits();
        break;
    }
  }

  // Close modal with Escape key
  if (e.key === "Escape" && helpModal.classList.contains("show")) {
    hideHelpModal();
  }

  // Copy result with Ctrl/Cmd + C
  if (
    (e.ctrlKey || e.metaKey) &&
    e.key === "c" &&
    result.textContent !== "Enter a temperature to convert"
  ) {
    e.preventDefault();
    copyToClipboard();
  }
});

// Initialize
initTheme();
updateButtonState();

// Add CSS animation for shake effect
const style = document.createElement("style");
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
`;
document.head.appendChild(style);

// Export functionality
const exportBtn = document.getElementById("exportBtn");
const exportOptions = document.querySelectorAll(".export-option");

async function copyToClipboard() {
  const result = document.getElementById("result").textContent;
  try {
    await navigator.clipboard.writeText(result);
    showNotification("Copied to clipboard!");
  } catch (err) {
    showError("Failed to copy to clipboard");
  }
}

async function downloadAsImage(format) {
  const form = document.querySelector("#result");
  try {
    const canvas = await html2canvas(form, {
      backgroundColor: getComputedStyle(
        document.documentElement
      ).getPropertyValue("--form-bg"),
      scale: 2,
    });

    const link = document.createElement("a");
    link.download = `temperature-converter.${format}`;
    link.href = canvas.toDataURL(`image/${format}`);
    link.click();

    showNotification(`Downloaded as ${format.toUpperCase()}!`);
  } catch (err) {
    showError("Failed to download image");
  }
}

function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;
  document.body.appendChild(notification);

  // Trigger animation
  setTimeout(() => {
    notification.classList.add("show");
  }, 10);

  // Remove notification after animation
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 2000);
}

// Add notification styles
const notificationStyle = document.createElement("style");
notificationStyle.textContent = `
  .notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: var(--primary-color);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    box-shadow: 0 5px 15px var(--shadow-color);
    transform: translateY(100px);
    opacity: 0;
    transition: all 0.3s ease;
    z-index: 1000;
  }

  .notification.show {
    transform: translateY(0);
    opacity: 1;
  }
`;
document.head.appendChild(notificationStyle);

// Event listeners for export options
exportOptions.forEach((option) => {
  option.addEventListener("click", () => {
    const action = option.dataset.action;
    switch (action) {
      case "copy":
        copyToClipboard();
        break;
      case "png":
        downloadAsImage("png");
        break;
      case "jpg":
        downloadAsImage("jpeg");
        break;
    }
  });
});

// Help Modal functionality
const helpBtn = document.getElementById("helpBtn");
const helpModal = document.getElementById("helpModal");
const closeBtn = helpModal.querySelector(".close-btn");

function showHelpModal() {
  helpModal.classList.add("show");
  document.body.style.overflow = "hidden";
}

function hideHelpModal() {
  helpModal.classList.remove("show");
  document.body.style.overflow = "";
}

helpBtn.addEventListener("click", showHelpModal);
closeBtn.addEventListener("click", hideHelpModal);

// Close modal when clicking outside
helpModal.addEventListener("click", (e) => {
  if (e.target === helpModal) {
    hideHelpModal();
  }
});

// Add event listeners for history functionality
historyBtn.addEventListener("click", toggleHistory);
clearHistoryBtn.addEventListener("click", clearHistory);

// Add input validation for step
fromTemp.addEventListener("input", function () {
  const value = parseFloat(this.value);
  if (!isNaN(value)) {
    // Round to nearest 0.1
    this.value = Math.round(value * 10) / 10;
  }
});
