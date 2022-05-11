const chooseButton = document.querySelector("#chooseFolderButton");
const folderInput = document.querySelector("#folderInput");

chooseButton.onclick = async (e) => {
    const dir = await window.showDirectoryPicker();
}