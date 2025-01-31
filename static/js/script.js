// static/js/script.js
let files = [];

document.getElementById('pdfInput').addEventListener('change', handleFileSelect);
document.getElementById('dropZone').addEventListener('dragover', handleDragOver);
document.getElementById('dropZone').addEventListener('drop', handleFileDrop);

function handleFileSelect(e) {
    files = Array.from(e.target.files);
    updateFileList();
}

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
}

function handleFileDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    files = Array.from(e.dataTransfer.files);
    updateFileList();
}

function updateFileList() {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';
    
    files.forEach((file, index) => {
        const div = document.createElement('div');
        div.className = 'file-item';
        div.innerHTML = `
            <span>${file.name}</span>
            <button onclick="removeFile(${index})">Remove</button>
        `;
        fileList.appendChild(div);
    });
}

function removeFile(index) {
    files.splice(index, 1);
    updateFileList();
}

function clearFiles() {
    files = [];
    updateFileList();
}

async function mergePDFs() {
    if (files.length < 2) {
        alert('Please select at least two PDF file');
        return;
    }

    const formData = new FormData();
    files.forEach(file => formData.append('pdfs', file));

    const progress = document.getElementById('progress');
    progress.classList.remove('hidden');

    try {
        const response = await fetch('/merge', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'merged.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } catch (error) {
        alert(`Error: ${error.message}`);
    } finally {
        progress.classList.add('hidden');
    }
}