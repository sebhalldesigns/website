/* 
**  sebhalldesigns.com - router.js
*/

const DEFAULT_PAGE = 'home';

const contentContainer = document.getElementById('Content');


function loadPage(page) {

    fetch(`pages/${page}.html`)

    .then(res => {
        if (!res.ok) throw new Error('Page not found');
        return res.text();
    })

    .then(html => {
        contentContainer.innerHTML = html;
        window.scrollTo(0, 0); // Optional: scroll to top

        // Use setTimeout with a delay of 0 to defer SetupCarousels
        setTimeout(() => {
            SetupCarousels();
        }, 0); // Delay of 0 ms pushes the function to the end of the current task queue
    })

    .catch(err => {
        contentContainer.innerHTML = `<h2>404 - Page not found</h2>`;
    });

    HideMenu(); // Hide the menu after loading a page
}


/* Parse current hash */
function getCurrentPage() {
    return window.location.hash.replace(/^#\/?/, '') || DEFAULT_PAGE;
}
  
/* Load correct page on hash change */
window.addEventListener('hashchange', () => {
    const page = getCurrentPage();
    loadPage(page);
});
  
/* Load initial page on DOM ready */
window.addEventListener('DOMContentLoaded', () => {
    const page = getCurrentPage();
    loadPage(page);
});


