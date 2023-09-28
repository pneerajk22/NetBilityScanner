document.querySelector(".nav-item.active").classList.remove("active");
document.querySelector(".nav-item:nth-child(3)").classList.add("active");

document.querySelector("#port-scan-form").addEventListener("submit", function (event) {
    event.preventDefault();
    document.querySelector("#error").style.display = "none";
    document.querySelector("#scan-button").style.display = "none";
    document.querySelector("#scanning-text").style.display = "inline";

    const formData = new FormData(event.target);
    const ipAddress = formData.get("ip_address"); // Get the IP address field value

    if (!validateIPv4(ipAddress)) {
        // Check if the entered IP address is a valid IPv4 address
        document.querySelector("#error").style.display = "block";
        document.querySelector("#error").textContent = "Invalid IPv4 address. Please enter a valid IPv4 address.";
        document.querySelector("#scan-button").style.display = "inline";
        document.querySelector("#scanning-text").style.display = "none";
    } else {
        fetch(event.target.action, {
            method: "POST",
            body: formData,
            headers: {
                "X-CSRFToken": formData.get("csrfmiddlewaretoken"),
            },
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                document.querySelector("#error").style.display = "block";
                document.querySelector("#error").textContent = data.error;
            } else {
                displayScanResults(data.ip_address, data.port_ranges, data.open_ports);
            }
            document.querySelector("#scan-button").style.display = "inline";
            document.querySelector("#scanning-text").style.display = "none";
            document.querySelector("#scan-results").style.display = "block";
        })
        .catch((error) => {
            console.error("Error:", error);
            document.querySelector("#scan-button").style.display = "inline";
            document.querySelector("#scanning-text").style.display = "none";
        });
    }
});

// Function to validate an IPv4 address
function validateIPv4(ipAddress) {
    const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    return ipv4Pattern.test(ipAddress);
}

function displayScanResults(ipAddress, portRanges, openPorts) {
    const resultsDiv = document.querySelector("#scan-results");
    resultsDiv.innerHTML = "";

    if (openPorts.length === 0) {
        resultsDiv.textContent = "No open ports found.";
    } else {
        openPorts.forEach((hostInfo) => {
            const ul = document.createElement("ul");
            ul.innerHTML = `
                <li>IP Address: ${hostInfo.ip}</li>
                <li>Port Ranges: ${portRanges}</li>
            `;
            hostInfo.ports.forEach((portInfo) => {
                const li = document.createElement("li");
                li.textContent = portInfo;
                ul.appendChild(li);
            });
            resultsDiv.appendChild(ul);
        });
    }
}
