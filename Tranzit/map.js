document.addEventListener('DOMContentLoaded', () => {
    const img = document.getElementById('map-img');
    const wrapper = document.querySelector('.map-wrapper');
    const nodesContainer = document.getElementById('nodes-container');
    const preview = document.getElementById('preview');

    const nodes = [
        { id: 'a', x: 16.3, y: 30.5, label: 'Nacht/Pylon', video: 'assets/nacht.mp4' },
        { id: 'b', x: 78, y: 53.2, label: 'Depot', video: 'assets/depot.mp4' },
        { id: 'c', x: 21.5, y: 60, label: 'Power', video: 'assets/power.mp4' },
        { id: 'd', x: 34, y: 55, label: 'Cabin', video: 'assets/cabin.mp4' },
        { id: 'e', x: 76, y: 36.5, label: 'Bridge', video: 'assets/bridge.mp4' },
        { id: 'f', x: 56.5, y: 34.6, label: 'Town', video: 'assets/town.mp4' },
        { id: 'g', x: 54.5, y: 16, label: 'Midway', video: 'assets/midway.mp4' },
        { id: 'h', x: 60.4, y: 10, label: 'Diner', video: 'assets/diner.mp4' },
        { id: 'i', x: 53.35, y: 81.5, label: 'bleh' },
    ];

    function placeNodes() {
        nodesContainer.innerHTML = '';

        const imgRect = img.getBoundingClientRect();
        const wrapperRect = wrapper.getBoundingClientRect();

        nodes.forEach(n => {
            const px = (n.x / 100) * imgRect.width;
            const py = (n.y / 100) * imgRect.height;

            const el = document.createElement('button');
            el.className = n.video ? 'node-marker' : 'node-marker static';
            el.title = n.label;
            const left = px + (imgRect.left - wrapperRect.left);
            const top = py + (imgRect.top - wrapperRect.top);
            el.style.left = left + 'px';
            el.style.top = top + 'px';

            if (n.video) {
                el.addEventListener('mouseenter', () => showPreview(n, left, top, px, py, imgRect));
                el.addEventListener('focus', () => showPreview(n, left, top, px, py, imgRect));
                el.addEventListener('mouseleave', hidePreview);
                el.addEventListener('blur', hidePreview);
            }

            nodesContainer.appendChild(el);
        });
    }

    function showPreview(node, left, top) {
        if (!node.video) return;

        
        preview.innerHTML = '';
        const video = document.createElement('video');
        video.src = node.video;
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'contain';
        preview.appendChild(video);

        const previewW = preview.clientWidth || 500;
        const previewH = preview.clientHeight || 500;
        const wrapperRect = wrapper.getBoundingClientRect();

        let previewLeft = left - previewW / 2;
        let previewTop = top - previewH / 2;

        previewLeft = Math.max(4, Math.min(previewLeft, wrapperRect.width - previewW - 4));
        previewTop = Math.max(4, Math.min(previewTop, wrapperRect.height - previewH - 4));

        preview.style.left = previewLeft + 'px';
        preview.style.top = previewTop + 'px';
        preview.style.display = 'block';
        preview.setAttribute('aria-hidden', 'false');
    }

    function hidePreview() {
        preview.style.display = 'none';
        preview.setAttribute('aria-hidden', 'true');
        preview.innerHTML = '';
    }

    if (img.complete) {
        placeNodes();
    } else {
        img.addEventListener('load', placeNodes);
    }

    window.addEventListener('resize', () => {
        placeNodes();
        hidePreview();
    });
});
