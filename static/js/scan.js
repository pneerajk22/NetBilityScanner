// Get the form element and URL input field
const scanForm = document.getElementById("scan-form");
const urlInput = document.getElementById("url");
const errorDiv = document.getElementById("error");
const progressDiv = document.getElementById("progress");
const resultsDiv = document.getElementById("results");
const spiderResultsElement = document.getElementById("spider-results");
const spiderPerPage = document.querySelector("#spider-per-page");
const prevPageButton = document.querySelector("#prev-page");
const nextPageButton = document.querySelector("#next-page");
const alertListElement = document.querySelector("#alert-list");
const alertCountElement = document.querySelector("#alert-count");
let spiderResults = [];
let currentPage = 1;
let resultsPerPage = 10;
let alertPage = 1;
let alertsPerPage = 10;

document.querySelector(".nav-item.active").classList.remove("active"); // Remove active class from any previous active item
document.querySelector(".nav-item:nth-child(2)").classList.add("active"); 

// Function to validate a URL
function validateURL(url) {
    // Regular expression pattern for a valid URL (simplified)
    const urlPattern = /^(https?:\/\/)?([\w\d.-]+)\.([a-z.]{2,6})([/\w\d.-]*)*\/?$/i;
    return urlPattern.test(url);
}

// Function to display an error message
function displayError(message) {
    errorDiv.style.display = "block";
    errorDiv.textContent = message;
}

// Function to display spider results based on current page and results per page
function displaySpiderResults(page, perPage) {
    spiderResultsElement.innerHTML = ""; // Clear previous spider results
    const start = (page - 1) * perPage;
    const end = start + perPage;
    for (let i = start; i < end && i < spiderResults.length; i++) {
        const li = document.createElement("li");
        li.className = "list-group-item";
        li.textContent = spiderResults[i];
        spiderResultsElement.appendChild(li);
    }
}

// Function to display alerts based on current page and alerts per page
function displayAlerts(page, perPage, alertDict) {
    alertListElement.innerHTML = ""; // Clear previous alert data
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const alerts = Object.entries(alertDict).slice(startIndex, endIndex); // Adjusted slicing
    const alertGroups = {}; // Store alert groups by name

    for (const [key, alert] of alerts) {
        const name = alert.name;
        if (!alertGroups[name]) {
            alertGroups[name] = [];
        }
        alertGroups[name].push({
            id: key,
            risk: alert.risk,
            url: alert.url,
        });
    }

    for (const [name, group] of Object.entries(alertGroups)) {
        const li = document.createElement("li");
        li.className = "list-group-item";
        const button = document.createElement("button");
        button.className = "btn btn-link";
        const numberOfAlerts = group.length;
        button.textContent = `${name} [${numberOfAlerts}]`;
        const detailsDiv = document.createElement("div");
        detailsDiv.innerHTML = group
            .map((item) => `Url - ${item.url}    Risk - ${item.risk}`)
            .join("<br>");
        detailsDiv.style.display = "none";
        button.addEventListener("click", function () {
            if (detailsDiv.style.display === "none") {
                detailsDiv.style.display = "block";
            } else {
                detailsDiv.style.display = "none";
            }
        });
        li.appendChild(button);
        li.appendChild(detailsDiv);
        alertListElement.appendChild(li);
    }
}

// Event listener for form submission
scanForm.addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the form from submitting initially

    const url = urlInput.value.trim(); // Trim leading/trailing spaces

    if (!validateURL(url)) {
        displayError("Invalid URL. Please enter a valid URL.");
        return; // Exit the function, don't make the POST request
    } else {
        errorDiv.style.display = "none"; // Hide any previous error messages
    }

    progressDiv.style.display = "block"; // Display the progress message

    // Prepare the form data and make the POST request
    const formData = new FormData(scanForm);
    fetch(scanForm.action, {
        method: "POST",
        body: formData,
        headers: {
            "X-CSRFToken": formData.get("csrfmiddlewaretoken"),
        },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Scan failed.");
            }
            return response.json();
        })
        .then((data) => {
            progressDiv.style.display = "none"; // Hide the progress message
            resultsDiv.style.display = "block"; // Display the results section
            spiderResults = data.spider_results;
            displaySpiderResults(currentPage, resultsPerPage);
            document.querySelector("#spider-count").textContent =
                spiderResults.length;

            // Populate spider results dropdown
            spiderPerPage.addEventListener("change", function () {
                resultsPerPage = parseInt(spiderPerPage.value);
                currentPage = 1;
                displaySpiderResults(currentPage, resultsPerPage);
            });

            // Populate alert list
            const alertCount = data.alert_count;
            alertCountElement.textContent = alertCount;
            alertsPerPage = alertCount;
            displayAlerts(alertPage, alertsPerPage, data.alert_dict);

            // Add event listeners to pagination buttons
            prevPageButton.addEventListener("click", function () {
                if (currentPage > 1) {
                    currentPage--;
                    displaySpiderResults(currentPage, resultsPerPage);
                }
            });

            nextPageButton.addEventListener("click", function () {
                if (
                    currentPage < Math.ceil(spiderResults.length / resultsPerPage)
                ) {
                    currentPage++;
                    displaySpiderResults(currentPage, resultsPerPage);
                }
            });
        })
        .catch((error) => {
            progressDiv.style.display = "none"; // Hide the progress message
            errorDiv.style.display = "block"; // Display an error message
            errorDiv.textContent = "An error occurred during the scan.";
            console.error("Error:", error);
        });
});
