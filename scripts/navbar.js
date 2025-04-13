/* 
**  sebhalldesigns.com - navbar.js
*/

const NavigationBar = document.getElementById("NavigationBar");
const NavigationToggleButton = document.getElementById("NavigationToggleButton");

HideMenu(); /* Hide the menu on load */

var isMenuOpen = false; /* Track if the menu is open or closed */

function ToggleMenu() {	

    if (isMenuOpen) {
        HideMenu(); /* Hide the menu if it is open */
    } else {
        ShowMenu(); /* Show the menu if it is closed */
    }

    isMenuOpen = !isMenuOpen; /* Toggle the menu state */
}

function ShowMenu() {	

    NavigationBar.classList.add('open');		
    NavigationToggleButton.classList.add('open');	
}

function HideMenu() {
    NavigationBar.classList.remove('open');
    NavigationToggleButton.classList.remove('open');	
}