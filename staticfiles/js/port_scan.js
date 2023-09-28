document.querySelector(".nav-item.active").classList.remove("active"); // Remove active class from any previous active item
document.querySelector(".nav-item:nth-child(3)").classList.add("active"); // Add active class to the third item (PORT)

document
    .querySelector("#port-scan-form")
    .addEventListener("submit", function (event) {
        event.preventDefault();
        document.querySelector("#error").style.display = "none";
        document.querySelector("#scan-button").style.display = "none";
        document.querySelector("#scanning-text").style.display = "inline"; // Show the scanning text
        const formData = new FormData(event.target);
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
                document.querySelector("#scan-button").style.display = "inline"; // Show the button again
                document.querySelector("#scanning-text").style.display = "none"; // Hide the scanning text
                document.querySelector("#scan-results").style.display = "block"; // Show the results
            })
            .catch((error) => {
                console.error("Error:", error);
                document.querySelector("#scan-button").style.display = "inline"; // Show the button again
                document.querySelector("#scanning-text").style.display = "none"; // Hide the scanning text
            });
    });

function displayScanResults(ipAddress, portRanges, openPorts) {
    const resultsDiv = document.querySelector("#scan-results");
    resultsDiv.innerHTML = ""; // Clear previous results

    if (openPorts.length === 0) {
        resultsDiv.textContent = "No open ports found.";
    } else {
        openPorts.forEach((hostInfo) => {
            const ul = document.createElement("ul"); // Create an unordered list
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
