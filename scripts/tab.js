function SetupTabBar() {
    const buttons = document.querySelectorAll(".DesignsTabButton");
    const selector = document.querySelector(".DesignsTabButtonSelector");

    buttons.forEach((button, index) => {
        button.addEventListener("click", () => {
            const buttonRect = button.getBoundingClientRect();
            const parentRect = button.parentElement.getBoundingClientRect();

            // Calculate the new left position based on the clicked button
            const newLeft = buttonRect.left - parentRect.left + "px";
            selector.style.left = newLeft;
            selector.style.width = buttonRect.width + "px";
        });
    });

    // Set initial position of the selector based on the first button
    if (buttons.length > 0) {
        const firstButtonRect = buttons[0].getBoundingClientRect();
        const parentRect = buttons[0].parentElement.getBoundingClientRect();
        selector.style.left = firstButtonRect.left - parentRect.left + "px";
        selector.style.width = firstButtonRect.width + "px";
    }

    window.addEventListener("resize", () => {
         // Set initial position of the selector based on the first button
        if (buttons.length > 0) {
            const firstButtonRect = buttons[0].getBoundingClientRect();
            const parentRect = buttons[0].parentElement.getBoundingClientRect();
            selector.style.left = firstButtonRect.left - parentRect.left + "px";
            selector.style.width = firstButtonRect.width + "px";
        }
    });


}