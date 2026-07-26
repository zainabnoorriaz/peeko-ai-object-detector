(function(){

    const dropzone = document.getElementById("dropzone");
    const dropzoneInner = document.getElementById("dropzoneInner");
    const fileInput = document.getElementById("fileInput");
    const preview = document.getElementById("preview");
    const scanline = document.getElementById("scanline");
    const scanBtn = document.getElementById("scanBtn");
    const resetBtn = document.getElementById("resetBtn");
    const result = document.getElementById("result");
    const tagline = document.getElementById("tagline");
    const card = document.getElementById("card");
    const verdictBadge = document.getElementById("verdictBadge");
    const confidenceNum = document.getElementById("confidenceNum");
    const meterFill = document.getElementById("meterFill");

    let hasImage = false;
    let selectedFile = null;

    function openPicker(){
        fileInput.click();
    }

    dropzone.addEventListener("click", () => {
        if(!hasImage){
            openPicker();
        }
    });

    dropzone.addEventListener("keydown", (e)=>{
        if((e.key==="Enter" || e.key===" ") && !hasImage){
            openPicker();
        }
    });

    ["dragenter","dragover"].forEach(event=>{
        dropzone.addEventListener(event,(e)=>{
            e.preventDefault();
            dropzone.classList.add("drag");
        });
    });

    ["dragleave","drop"].forEach(event=>{
        dropzone.addEventListener(event,(e)=>{
            e.preventDefault();
            dropzone.classList.remove("drag");
        });
    });

    dropzone.addEventListener("drop",(e)=>{
        const file=e.dataTransfer.files[0];

        if(file){
            loadImage(file);
        }
    });

    fileInput.addEventListener("change",()=>{

        if(fileInput.files.length>0){
            loadImage(fileInput.files[0]);
        }

    });

    function loadImage(file){

        selectedFile = file;

        const imageURL = URL.createObjectURL(file);

        preview.src = imageURL;
        preview.style.display="block";

        dropzoneInner.style.display="none";

        hasImage=true;

        scanBtn.disabled=false;

        tagline.textContent = "Image loaded. Ready to detect!";

        setMood("curious");

    }

    scanBtn.addEventListener("click", runScan);

    function runScan(){

        scanBtn.disabled=true;

        tagline.textContent = "Detecting objects...";

        scanline.classList.add("active");

        setMood("scanning");

        setTimeout(()=>{

            scanline.classList.remove("active");

            goToResultPage();

        },1600);

    }

    function goToResultPage(){

        const formData = new FormData();
        formData.append("file", selectedFile);

        fetch("/upload", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            sessionStorage.setItem("peekoResult", JSON.stringify(data));
            window.location.href = "/result";
        })
        .catch(err => {
            console.error("Upload failed:", err);
            tagline.textContent = "Something went wrong. Try again.";
            setMood("idle");
            scanBtn.disabled = false;
        });

    }

    resetBtn.addEventListener("click",()=>{

        hasImage=false;

        preview.src="";

        preview.style.display="none";

        dropzoneInner.style.display="flex";

        scanBtn.hidden=false;

        scanBtn.disabled=true;

        resetBtn.hidden=true;

        result.hidden=true;

        meterFill.style.width="0%";

        tagline.textContent = "Upload an image. I'll find what's inside.";

        card.classList.remove("mode-real","mode-fake");

        setMood("idle");

    });

    function setMood(mood){
        card.setAttribute("data-mood", mood);
    }

    setMood("idle");

})();