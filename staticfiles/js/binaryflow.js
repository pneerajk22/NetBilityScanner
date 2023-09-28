document.addEventListener("DOMContentLoaded", function () {
    const binaryBackground = document.querySelector(".binary-background");

    // Generate binary numbers and append them to the background
    for (let i = 0; i < 100; i++) { // Adjust the number of binary numbers
        const binaryNumber = document.createElement("div");
        binaryNumber.className = "binary-number";
        binaryNumber.textContent = generateBinaryNumber();
        binaryBackground.appendChild(binaryNumber);
    }
});

function generateBinaryNumber() {
    const binaryDigits = [];
    for (let i = 0; i < 8; i++) { // Generate an 8-digit binary number
        binaryDigits.push(Math.random() < 0.5 ? "0" : "1");
    }
    return binaryDigits.join("");
}
