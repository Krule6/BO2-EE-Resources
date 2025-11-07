
document.addEventListener('DOMContentLoaded', () => {
    const img = document.getElementById('map-img');
    const wrapper = document.querySelector('.map-wrapper');
    const nodesContainer = document.getElementById('nodes-container');
    const preview = document.getElementById('preview');

    const nodes = [
        { id: 'a', x: 16.3, y: 30.5, label: 'Nacht/Pylon', image: 'assets/nacht.png' },
        { id: 'b', x: 78, y: 53.2, label: 'Depot', image: 'assets/depot.png' },
        { id: 'c', x: 21.5, y: 60, label: 'Power', image: 'assets/power.png' },
        { id: 'd', x: 34, y: 55, label: 'Cabin', image: 'assets/cabin.png' },
        { id: 'e', x: 76, y: 36.5, label: 'Bridge', image: 'assets/bridge.png' },
        { id: 'f', x: 56.5, y: 34.6, label: 'Town', image: 'assets/town.png' },
        { id: 'g', x: 54.5, y: 16, label: 'Midway', image: 'assets/midway.png' },
        { id: 'h', x: 60.4, y: 10, label: 'Diner', image: 'assets/diner.png' },
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
            el.className = n.image ? 'node-marker' : 'node-marker static';
            el.title = n.label;
            const left = px + (imgRect.left - wrapperRect.left);
            const top = py + (imgRect.top - wrapperRect.top);
            el.style.left = left + 'px';
            el.style.top = top + 'px';

            if (n.image) {
                el.addEventListener('mouseenter', () => showPreview(n, left, top, px, py, imgRect));
                el.addEventListener('focus', () => showPreview(n, left, top, px, py, imgRect));
                el.addEventListener('mouseleave', hidePreview);
                el.addEventListener('blur', hidePreview);
            }

            nodesContainer.appendChild(el);
        });
    }

    function showPreview(node, left, top, pxOnImage, pyOnImage, imgRect) {
        if (!node.image) return;

        preview.style.width = '300px';
        preview.style.height = '200px';
        preview.style.backgroundImage = `url(${node.image})`;
        preview.style.backgroundSize = 'cover';
        preview.style.backgroundPosition = 'center';

        const previewSize = 300;
        const wrapperRect = wrapper.getBoundingClientRect();
        let previewLeft = left - previewSize / 2;
        let previewTop = top - previewSize / 2;

        previewLeft = Math.max(4, Math.min(previewLeft, wrapperRect.width - previewSize - 4));
        previewTop = Math.max(4, Math.min(previewTop, wrapperRect.height - previewSize - 4));

        preview.style.left = previewLeft + 'px';
        preview.style.top = previewTop + 'px';
        preview.style.display = 'block';
        preview.setAttribute('aria-hidden', 'false');
    }

    function hidePreview() {
        preview.style.display = 'none';
        preview.setAttribute('aria-hidden', 'true');
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

