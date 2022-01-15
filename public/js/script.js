document.getElementsByClassName("number")[0].onkeydown = function (event) {
    return event.keyCode >= 48 && event.keyCode <= 57 || event.keyCode === 8;
};

document.addEventListener("keypress", function (event) {
    if (event.key === "Enter")
    {
        event.preventDefault();
        event.stopPropagation();
        document.getElementsByClassName("add")[0].click();
    }
});
