document.addEventListener("DOMContentLoaded", function () {
    var options = {
        rootMargin: "0px",
        threshold: 0.75,
    };

    var totalScansSection = document.getElementById("total-scans-section");
    var welcomeContainer = document.getElementById("welcome-container");
    var footerSection = document.getElementById("footer-section");
    var scans_data = {};

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
            scans_data = data;
        })
        .catch((error) => {
            console.error("Error fetching initial data:", error);
        });

    function animateNumbers() {
        var zapScansElement = document.getElementById("zap_scans");
        var portScansElement = document.getElementById("port_scans");
        var fileScansElement = document.getElementById("file_scans");

        if (zapScansElement && portScansElement && fileScansElement) {
            // Provide the initial count for each scan type here
            var data = {
                zap_scans: scans_data.zap_scans, // Example initial count
                port_scans: scans_data.port_scans, // Example initial count
                file_scans: scans_data.file_scans, // Example initial count
            };

            var interval = 10; // Interval in milliseconds
            var duration = 500; // Animation duration in milliseconds

            animate(zapScansElement, data.zap_scans,  interval, duration);
            animate(portScansElement, data.port_scans, interval, duration);
            animate(fileScansElement, data.file_scans, interval, duration);
        } else {
            console.error("One or more elements not found in the DOM.");
        }
    }
    function animate(element, targetValue, interval, duration) {
        var startValue = 0;
        var startTime = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = timestamp - startTime;

            if (progress < duration) {
                var increment = (targetValue - startValue) * (progress / duration);
                element.textContent = Math.floor(startValue + increment);
                requestAnimationFrame(step);
            } else {
                element.textContent = targetValue;
            }
        }

        requestAnimationFrame(step);
    }


});
