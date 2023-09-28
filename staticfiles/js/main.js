document.addEventListener("DOMContentLoaded", function () {
    var options = {
        rootMargin: "0px",
        threshold: 0.75,
    };

    var totalScansSection = document.getElementById("total-scans-section");
    var welcomeContainer = document.getElementById("welcome-container");
    var footerSection = document.getElementById("footer-section");

    function handleIntersect(entries, observer) {
        entries.forEach(function (entry) {
            if (entry.target.id === "total-scans-section") {
                if (entry.isIntersecting) {
                    totalScansSection.classList.add("in-viewport");
                    animateNumbers();
                } else {
                    totalScansSection.classList.remove("in-viewport");
                }
            } else if (entry.target.id === "footer-section") {
                if (entry.isIntersecting) {
                    footerSection.classList.add("in-viewport");
                } else {
                    footerSection.classList.remove("in-viewport");
                }
            } else {
                if (entry.isIntersecting) {
                    welcomeContainer.classList.add("in-viewport");
                } else {
                    welcomeContainer.classList.remove("in-viewport");
                }
            }
        });
    }

    var observer = new IntersectionObserver(handleIntersect, options);

    observer.observe(totalScansSection);
    observer.observe(welcomeContainer);
    observer.observe(footerSection);

    // Fetch initial data from the server when the page loads
    fetch("/get_initial_data/")
        .then((response) => response.json())
        .then((data) => {
            updateScanCounts(data);
        })
        .catch((error) => {
            console.error("Error fetching initial data:", error);
        });

    function updateScanCounts(data) {
        const zapScansElement = document.getElementById("zap_scans");
        const portScansElement = document.getElementById("port_scans");
        const fileScansElement = document.getElementById("file_scans");

        let zapCount = 0;
        let portCount = 0;
        let fileCount = 0;

        // Animate the numbers to their respective values
        const interval = setInterval(() => {
            zapScansElement.textContent = zapCount;
            portScansElement.textContent = portCount;
            fileScansElement.textContent = fileCount;

            // Increment the counts until they reach their respective values
            if (zapCount < data.zap_scans) {
                zapCount++;
            }
            if (portCount < data.port_scans) {
                portCount++;
            }
            if (fileCount < data.file_scans) {
                fileCount++;
            }

            // Stop the animation when all counts reach their respective values
            if (
                zapCount === data.zap_scans &&
                portCount === data.port_scans &&
                fileCount === data.file_scans
            ) {
                clearInterval(interval);
            }
        }, 100); // Adjust the animation speed as needed
    }
});
