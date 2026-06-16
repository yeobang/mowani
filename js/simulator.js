const handleConfig = {
    pink: {
        label: "Pink Handle",
        imagePath: "assets/handle-pink.png",
        width: 433,
        top: 160,
        left: 64,
        zIndex: 10,
        swatch: "#f1a9ad"
    },
    yellow: {
        label: "Yellow Base",
        imagePath: "assets/handle-yellow.png",
        width: 375,
        top: 185,
        left: 92,
        zIndex: 10,
        swatch: "#e7c64b"
    },
    black: {
        label: "Black Handle",
        imagePath: "assets/handle-black.png",
        width: 433,
        top: 160,
        left: 64,
        zIndex: 10,
        swatch: "#202020"
    }
};

let selectedHandle = "pink";

const elements = {
    optionList: document.getElementById("optionList"),
    handleImage: document.getElementById("handleImage"),
    selectedLabel: document.getElementById("selectedLabel"),
    summaryLabel: document.getElementById("summaryLabel"),
    summaryPath: document.getElementById("summaryPath"),
    metricTop: document.getElementById("metricTop"),
    metricLeft: document.getElementById("metricLeft"),
    metricWidth: document.getElementById("metricWidth"),
    copyConfigButton: document.getElementById("copyConfigButton"),
    copyStatus: document.getElementById("copyStatus")
};

function getSelectedConfig() {
    return handleConfig[selectedHandle];
}

function renderOptions() {
    elements.optionList.innerHTML = "";

    Object.entries(handleConfig).forEach(([key, config]) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `option-button${key === selectedHandle ? " active" : ""}`;
        button.setAttribute("role", "option");
        button.setAttribute("aria-selected", String(key === selectedHandle));
        button.dataset.handle = key;
        button.innerHTML = `
            <span class="option-name">${config.label}</span>
            <span class="swatch" style="background:${config.swatch}" aria-hidden="true"></span>
        `;
        button.addEventListener("click", () => selectHandle(key));
        elements.optionList.appendChild(button);
    });
}

function renderPreview() {
    const config = getSelectedConfig();

    elements.handleImage.src = config.imagePath;
    elements.handleImage.alt = `${config.label} 선택 이미지`;
    elements.handleImage.style.width = `${config.width}px`;
    elements.handleImage.style.top = `${config.top}px`;
    elements.handleImage.style.left = `${config.left}px`;
    elements.handleImage.style.zIndex = config.zIndex;

    elements.selectedLabel.textContent = config.label;
    elements.summaryLabel.textContent = config.label;
    elements.summaryPath.textContent = config.imagePath;
    elements.metricTop.textContent = `${config.top}px`;
    elements.metricLeft.textContent = `${config.left}px`;
    elements.metricWidth.textContent = `${config.width}px`;
}

function selectHandle(key) {
    selectedHandle = key;
    renderOptions();
    renderPreview();

    // Cafe24 상품 옵션 연동 시점:
    // 여기에서 선택된 key 또는 config.label 값을 Cafe24 옵션 select/input 값과 동기화하면 됩니다.
}

function adjustSelectedConfig({ top = 0, left = 0, width = 0 }) {
    const config = getSelectedConfig();
    config.top += top;
    config.left += left;
    config.width = Math.max(20, config.width + width);
    renderPreview();
}

function handleKeyboardControl(event) {
    const step = event.shiftKey ? 10 : 1;

    if (event.key === "ArrowUp") {
        event.preventDefault();
        adjustSelectedConfig({ top: -step });
    }

    if (event.key === "ArrowDown") {
        event.preventDefault();
        adjustSelectedConfig({ top: step });
    }

    if (event.key === "ArrowLeft") {
        event.preventDefault();
        adjustSelectedConfig({ left: -step });
    }

    if (event.key === "ArrowRight") {
        event.preventDefault();
        adjustSelectedConfig({ left: step });
    }

    if (event.key === "[") {
        event.preventDefault();
        adjustSelectedConfig({ width: -1 });
    }

    if (event.key === "]") {
        event.preventDefault();
        adjustSelectedConfig({ width: 1 });
    }
}

function getCopyText() {
    const config = getSelectedConfig();

    return `${selectedHandle}: {
    label: "${config.label}",
    imagePath: "${config.imagePath}",
    width: ${config.width},
    top: ${config.top},
    left: ${config.left},
    zIndex: ${config.zIndex}
}`;
}

async function copyCurrentConfig() {
    const copyText = getCopyText();

    try {
        await navigator.clipboard.writeText(copyText);
        elements.copyStatus.textContent = "현재 선택 옵션 config를 복사했습니다.";
    } catch (error) {
        elements.copyStatus.textContent = copyText;
    }
}

elements.copyConfigButton.addEventListener("click", copyCurrentConfig);
document.addEventListener("keydown", handleKeyboardControl);

renderOptions();
renderPreview();
