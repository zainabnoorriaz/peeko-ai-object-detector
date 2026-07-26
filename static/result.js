(function(){

    const savedResult = sessionStorage.getItem("peekoResult");
    const photo = document.querySelector(".photo");
    const resultsArea = document.querySelector(".results-area");

    if(savedResult){

        const data = JSON.parse(savedResult);

        photo.innerHTML = `<img src="${data.image_url}" alt="Uploaded image" class="result-img">`;

        if(data.objects.length === 0){
            resultsArea.innerHTML = `<p style="text-align:center;color:#999;">No objects detected.</p>`;
        } else {
            resultsArea.innerHTML = data.objects.map(obj => `
                <div class="detected-chip">
                    <span class="chip-label">${obj.label}</span>
                    <span class="chip-confidence">${obj.confidence}%</span>
                </div>
            `).join("");
        }

    } else {
        resultsArea.innerHTML = `<p style="text-align:center;color:#999;">No image data found.</p>`;
    }

})();
const tryAgainBtn = document.getElementById("tryAgainBtn");
tryAgainBtn.addEventListener("click", () => {
    sessionStorage.removeItem("peekoResult");
    window.location.href = "/";
});