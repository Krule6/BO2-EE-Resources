
(function () {
    function onReady() { document.body.classList.add('ready'); }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onReady);
    } else {
        onReady();
    }
})();

