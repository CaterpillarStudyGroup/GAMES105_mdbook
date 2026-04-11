// Save and restore sidebar scroll position across page loads
(function() {
    const SIDEBAR_STORAGE_KEY = 'sidebar-scroll-position';
    const SCROLL_THRESHOLD = 50; // pixels from active item to trigger scroll

    // Save scroll position before navigating
    function saveScrollPosition() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sessionStorage.setItem(SIDEBAR_STORAGE_KEY, sidebar.scrollTop.toString());
        }
    }

    // Restore scroll position on page load
    function restoreScrollPosition() {
        const scrollPosition = sessionStorage.getItem(SIDEBAR_STORAGE_KEY);
        if (scrollPosition !== null) {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.scrollTop = parseFloat(scrollPosition);
            }
            sessionStorage.removeItem(SIDEBAR_STORAGE_KEY);
        } else {
            // If no saved position, scroll to active section
            requestAnimationFrame(() => {
                const activeItem = document.querySelector('#sidebar .active');
                if (activeItem) {
                    activeItem.scrollIntoView({ block: 'center', behavior: 'auto' });
                }
            });
        }
    }

    // Set up event listeners
    window.addEventListener('DOMContentLoaded', function() {
        // Restore scroll position after DOM is ready
        restoreScrollPosition();

        // Save scroll position when clicking sidebar links
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.addEventListener('click', function(e) {
                if (e.target.tagName === 'A' && e.target.href) {
                    saveScrollPosition();
                }
            }, { passive: true });
        }
    });
})();
