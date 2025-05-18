
function SetupCarousels() {
    console.log("SetupCarousels called");
    const carouselContainers = document.querySelectorAll('.CarouselContainer');

    carouselContainers.forEach(container => {
        console.log("CarouselContainer found");
        const carouselSlides = container.querySelector('.CarouselSlides');
        const carouselItems = carouselSlides.querySelectorAll('.CarouselItem');
        const prevButton = container.parentElement.querySelector('.carousel-button-prev');
        const nextButton = container.parentElement.querySelector('.carousel-button-next');

        if (!carouselSlides || !prevButton || !nextButton || carouselItems.length === 0) {
            console.warn("Skipping carousel setup due to missing elements or no items:", container);
             if (prevButton) prevButton.style.display = 'none';
             if (nextButton) nextButton.style.display = 'none';
            return;
        }

        // Initialize and store the current translation amount for this carousel
        let currentTranslate = parseFloat(container.dataset.currentTranslate || '0');
        container.dataset.currentTranslate = currentTranslate;

        // Function to apply a specific translation amount, with clamping
        function applyTranslation(translation) {
             // Recalculate dimensions as they might change on window resize
            const itemWidth = carouselItems[0]?.offsetWidth || 0;
            const itemMarginRight = carouselItems[0] ? parseInt(getComputedStyle(carouselItems[0]).marginRight) : 0;
            const itemTotalWidth = itemWidth + itemMarginRight;
            const totalSlidesWidth = carouselItems.length * itemTotalWidth;
            const containerWidth = container.offsetWidth;

            // Calculate the maximum possible translation to the left (most negative value)
            const maxLeftTranslate = containerWidth - totalSlidesWidth;
            const minTranslate = 0; // Most positive allowed (no translation)

            // Clamp the translation to ensure it's within bounds
            const clampedTranslate = Math.max(maxLeftTranslate, translation);
            const finalTranslate = Math.min(minTranslate, clampedTranslate);

            carouselSlides.style.transform = `translateX(${finalTranslate}px)`;

            // Update the stored translation amount
            container.dataset.currentTranslate = finalTranslate;

            // Optional: Update the data-current-slide-index based on the translation amount
            if (itemTotalWidth > 0) {
                 const closestIndex = Math.round(-finalTranslate / itemTotalWidth);
                 container.dataset.currentSlideIndex = Math.max(0, Math.min(carouselItems.length - 1, closestIndex));
            } else {
                 container.dataset.currentSlideIndex = 0;
            }
        }

        // Event listener for the Next button
        nextButton.addEventListener('click', () => {
            const currentTranslate = parseFloat(container.dataset.currentTranslate);

            // Recalculate dimensions for accurate check
            const itemWidth = carouselItems[0]?.offsetWidth || 0;
            const itemMarginRight = carouselItems[0] ? parseInt(getComputedStyle(carouselItems[0]).marginRight) : 0;
            const itemTotalWidth = itemWidth + itemMarginRight;
            const totalSlidesWidth = carouselItems.length * itemTotalWidth;
            const containerWidth = container.offsetWidth;
            const maxLeftTranslate = containerWidth - totalSlidesWidth;

            let targetTranslate;

            // Check if we are already at the end (within a small tolerance for floating point issues)
            if (Math.abs(currentTranslate - maxLeftTranslate) < 1) {
                 // If at the end, wrap around to the beginning
                 targetTranslate = 0;
            } else {
                 // Calculate the translation for the next item's left edge
                 const translateByItem = currentTranslate - itemTotalWidth;

                 // If scrolling by one item width would go past the end,
                 // scroll exactly to the end instead.
                 targetTranslate = Math.max(translateByItem, maxLeftTranslate);
            }

            applyTranslation(targetTranslate);
        });

        // Event listener for the Previous button
        prevButton.addEventListener('click', () => {
            const currentTranslate = parseFloat(container.dataset.currentTranslate);

             // Recalculate dimensions for accurate check
             const itemWidth = carouselItems[0]?.offsetWidth || 0;
             const itemMarginRight = carouselItems[0] ? parseInt(getComputedStyle(carouselItems[0]).marginRight) : 0;
             const itemTotalWidth = itemWidth + itemMarginRight;
             const totalSlidesWidth = carouselItems.length * itemTotalWidth; // Needed for maxLeftTranslate in wrap
             const containerWidth = container.offsetWidth; // Needed for maxLeftTranslate in wrap
             const maxLeftTranslate = containerWidth - totalSlidesWidth; // Needed for wrap


            let targetTranslate;

            // Check if we are already at the beginning (translation is 0)
            if (Math.abs(currentTranslate - 0) < 1) {
                 // If at the beginning, wrap around to the end
                 targetTranslate = maxLeftTranslate;
            } else {
                 // Calculate the translation for the previous item's left edge
                 const translateByItem = currentTranslate + itemTotalWidth;

                 // Ensure we don't scroll past the beginning (translation cannot be positive)
                 targetTranslate = Math.min(translateByItem, 0);
            }

            applyTranslation(targetTranslate);
        });

        // Initial display: Apply the stored translation or start at the beginning
        applyTranslation(currentTranslate);
        // Ensure the index is also initialized correctly based on the initial translation
        if (carouselItems.length > 0 && (carouselItems[0]?.offsetWidth || 0) > 0) {
            const itemTotalWidth = (carouselItems[0].offsetWidth || 0) + parseInt(getComputedStyle(carouselItems[0]).marginRight);
             const closestIndex = Math.round(-currentTranslate / itemTotalWidth);
             container.dataset.currentSlideIndex = Math.max(0, Math.min(carouselItems.length - 1, closestIndex));
         } else {
              container.dataset.currentSlideIndex = 0;
         }

        // Optional: Add a resize observer to re-apply translation on window resize
        // to ensure correct clamping if container/item sizes change.
        new ResizeObserver(() => {
            applyTranslation(parseFloat(container.dataset.currentTranslate || '0'));
        }).observe(container);
    });
}
