
var selectedButton = null;

function SetupTabBar() {
    const buttons = document.querySelectorAll(".DesignsTabButton");
    const selector = document.querySelector(".DesignsTabButtonSelector");

    buttons.forEach((button, index) => {
        button.addEventListener("click", () => {
            SelectButton(button);
        });
    });

    // Set initial position of the selector based on the first button
    if (buttons.length > 0) {
        SelectButton(buttons[0]);
    }

    window.addEventListener("resize", () => {
        SelectButton(selectedButton);
    });
}

function SelectButton(button) {

    if (button === null) {
        return; // Do nothing if the same button is clicked
    }

    const buttons = document.querySelectorAll(".DesignsTabButton");
    const selector = document.querySelector(".DesignsTabButtonSelector");

    for (const btn of buttons) {
        const buttonTargetContent = document.getElementById(btn.id + "Content");

        if (buttonTargetContent != null && btn === button) {
            buttonTargetContent.hidden = false;
        } else if (buttonTargetContent != null) {
            buttonTargetContent.hidden = true;
        }
    }
    
    const buttonRect = button.getBoundingClientRect();
    const parentRect = button.parentElement.getBoundingClientRect();

    // Calculate the new left position based on the clicked button
    const newLeft = buttonRect.left - parentRect.left + "px";
    selector.style.left = newLeft;
    selector.offsetHeight; // Force reflow
    selector.style.width = buttonRect.width + "px";

    selectedButton = button;
}