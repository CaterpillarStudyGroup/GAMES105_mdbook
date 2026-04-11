// Save and restore sidebar scroll position across page loads
(function() {
    const SIDEBAR_STORAGE_KEY = 'sidebar-scroll-position';

    function saveScrollPosition() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sessionStorage.setItem(SIDEBAR_STORAGE_KEY, sidebar.scrollTop.toString());
        }
    }

    function restoreScrollPosition() {
        const scrollPosition = sessionStorage.getItem(SIDEBAR_STORAGE_KEY);
        if (scrollPosition !== null) {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.scrollTop = parseFloat(scrollPosition);
            }
        }
    }

    // Wait for full page load (including images, styles, etc.)
    window.addEventListener('load', function() {
        restoreScrollPosition();

        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.addEventListener('click', function(e) {
                const link = e.target.closest('a');
                if (link && link.getAttribute('href') && !link.getAttribute('href').startsWith('#')) {
                    saveScrollPosition();
                }
            });
        }
    });
})();
