// zap_progress.js

function updateProgressBar(progress) {
    const progressBar = document.getElementById('progress-bar');
    progressBar.style.width = progress + '%';
}

function fetchZapProgress() {
    fetch('/scan/')  // Replace with your Django endpoint
        .then(response => response.json())
        .then(data => {
            const progress = data.progress;  // Extract progress percentage from data
            updateProgressBar(progress);
            if (progress < 100) {
                setTimeout(fetchZapProgress, 1000);  // Fetch progress again after 1 second
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Start fetching ZAP progress when the page loads
fetchZapProgress();

