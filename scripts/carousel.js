
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

        // State variable to track if a smooth scroll is in progress
        let isScrolling = false;
        let scrollTimeout = null; // To track the scroll end timeout

        // --- Auto-play variables ---
        let autoPlayInterval = null;
        const autoPlayDelay = 5000; // Time in milliseconds before auto-advancing (e.g., 5 seconds)

        // Function to start auto-play
        function startAutoPlay() {
            stopAutoPlay(); // Clear any existing interval first
            autoPlayInterval = setInterval(() => {
                // Trigger the next item scroll
                showNextItem(); // Use a dedicated function for advancing
            }, autoPlayDelay);
        }

        // Function to stop auto-play
        function stopAutoPlay() {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
        }
        // --- End Auto-play variables and functions ---


        // Function to scroll to a specific position with clamping, wrapping, and snapping
        function scrollToPosition(targetScrollLeft) {
            const containerWidth = container.offsetWidth;
            const scrollWidth = container.scrollWidth;
            const maxScrollLeft = scrollWidth - containerWidth;

            let finalScrollLeft = targetScrollLeft;

            // Handle wrapping for next button when at the end
            if (targetScrollLeft > maxScrollLeft && container.scrollLeft >= maxScrollLeft - 1) {
                 finalScrollLeft = 0; // Wrap to the beginning
            }
            // Handle wrapping for previous button when at the beginning
            else if (targetScrollLeft < 0 && container.scrollLeft <= 1) {
                 finalScrollLeft = maxScrollLeft; // Wrap to the end
            } else {
                // Clamp the scroll position within the valid range if not wrapping
                 finalScrollLeft = Math.max(0, Math.min(maxScrollLeft, targetScrollLeft));
            }

            // --- Snap to the nearest item boundary after initial calculation ---
            let closestScrollLeft = 0;
            let minDiff = Infinity;

             if (carouselItems.length > 0) {
                for (let i = 0; i < carouselItems.length; i++) {
                    const item = carouselItems[i];
                    const itemOffsetLeft = item.offsetLeft;

                    const diff = Math.abs(finalScrollLeft - itemOffsetLeft);

                    if (diff < minDiff) {
                        minDiff = diff;
                        closestScrollLeft = itemOffsetLeft;
                    }
                     const tempContainerWidth = container.offsetWidth; // Get width inside loop
                     if (itemOffsetLeft > finalScrollLeft + tempContainerWidth + 10) {
                         break;
                     }
                }
                 finalScrollLeft = closestScrollLeft;

                 // Re-clamp the snapped position to ensure it's within the overall scroll bounds
                 finalScrollLeft = Math.max(0, Math.min(maxScrollLeft, finalScrollLeft));

             } else {
                 finalScrollLeft = 0; // Default to 0 if no items
             }
            // --- End Snap Logic ---


            // If the target position is the same as the current position, do nothing
            if (Math.abs(finalScrollLeft - container.scrollLeft) < 1) {
                 if (!isScrolling) {
                     prevButton.disabled = false;
                     nextButton.disabled = false;
                 }
                return;
            }


            // Set scrolling state and disable buttons
            isScrolling = true;
            prevButton.disabled = true;
            nextButton.disabled = true;


            // Use smooth scrolling
            container.scrollTo({
                left: finalScrollLeft,
                behavior: 'smooth'
            });

            // The scroll event listener will handle resetting isScrolling and re-enabling buttons
             // It also handles updating the index estimation based on the final scroll position.
        }


        // --- Dedicated functions for advancing/retreating (used by buttons and auto-play) ---
         function showNextItem() {
             // Recalculate item width and gap for accurate scroll amount
            const itemWidth = carouselItems[0]?.offsetWidth || 0;
             const computedGap = parseFloat(getComputedStyle(carouselSlides).gap.split(' ')[0]) || 0;
            const itemScrollAmount = itemWidth + computedGap;

            const targetScrollLeft = container.scrollLeft + itemScrollAmount;
            scrollToPosition(targetScrollLeft);
         }

         function showPrevItem() {
             // Recalculate item width and gap
             const itemWidth = carouselItems[0]?.offsetWidth || 0;
             const computedGap = parseFloat(getComputedStyle(carouselSlides).gap.split(' ')[0]) || 0;
             const itemScrollAmount = itemWidth + computedGap;

             const targetScrollLeft = container.scrollLeft - itemScrollAmount;
             scrollToPosition(targetScrollLeft);
         }
        // --- End Dedicated functions ---


        // Event listener for the Next button - Scroll by one item width + gap
        nextButton.addEventListener('click', () => {
            if (isScrolling) {
                return;
            }
            stopAutoPlay(); // Stop auto-play on user interaction
            showNextItem(); // Use the dedicated function
            // Auto-play will restart after scrolling stops (handled in scroll event)
        });

        // Event listener for the Previous button - Scroll by one item width + gap
        prevButton.addEventListener('click', () => {
            if (isScrolling) {
                return;
            }
            stopAutoPlay(); // Stop auto-play on user interaction
            showPrevItem(); // Use the dedicated function
             // Auto-play will restart after scrolling stops (handled in scroll event)
        });

        // Listen for user scrolling and the end of smooth scrolling
        container.addEventListener('scroll', () => {
            stopAutoPlay(); // Stop auto-play immediately on any scroll

            // Clear the previous timeout for detecting scroll end
            clearTimeout(scrollTimeout);

            // Set a new timeout to detect the end of scrolling
            scrollTimeout = setTimeout(() => {
                // Scrolling has likely stopped
                isScrolling = false;
                prevButton.disabled = false;
                nextButton.disabled = false;

                // Update the stored scroll position
                container.dataset.currentScrollLeft = container.scrollLeft;

                // Re-estimate the closest index after scrolling stops
                 if (carouselItems.length > 0) {
                      let closestIndex = 0;
                      let minDiff = Infinity;
                      const computedGap = parseFloat(getComputedStyle(carouselSlides).gap.split(' ')[0]) || 0;

                      for(let i = 0; i < carouselItems.length; i++) {
                          const item = carouselItems[i];
                          const itemOffsetLeft = item.offsetLeft;

                          const diff = Math.abs(container.scrollLeft - itemOffsetLeft);

                          if (diff < minDiff) {
                              minDiff = diff;
                              closestIndex = i;
                          }
                           const tempContainerWidth = container.offsetWidth; // Get width inside loop
                           if (itemOffsetLeft > container.scrollLeft + tempContainerWidth + 10) {
                               break;
                           }
                      }
                     container.dataset.currentSlideIndex = closestIndex;
                  } else {
                       container.dataset.currentSlideIndex = 0;
                  }

                startAutoPlay(); // Restart auto-play after scrolling stops

            }, 150); // Adjust timeout duration as needed

             // While scrolling, you could update UI elements here if needed
        });

        // --- Optional: Pause auto-play on mouseover/focus ---
         container.addEventListener('mouseenter', stopAutoPlay);
         container.addEventListener('mouseleave', startAutoPlay);
         // Also consider 'focusin' and 'focusout' for keyboard navigation/accessibility
         container.addEventListener('focusin', stopAutoPlay);
         container.addEventListener('focusout', startAutoPlay);
        // --- End Optional ---


        // Initial setup when the page loads or content is loaded
        // Apply the stored scroll position directly (no smooth behavior on initial load)
         const initialScrollLeft = parseFloat(container.dataset.currentScrollLeft || '0');
         container.scrollLeft = initialScrollLeft;
         container.dataset.currentScrollLeft = container.scrollLeft; // Store the actual initial position

         // Initial button state: enabled by default, will be disabled by scrollToPosition if called
         prevButton.disabled = false;
         nextButton.disabled = false;

         // Initial index estimation
         if (carouselItems.length > 0) {
              const containerWidth = container.offsetWidth;
              const computedGap = parseFloat(getComputedStyle(carouselSlides).gap.split(' ')[0]) || 0;

              let closestIndex = 0;
              let minDiff = Infinity;
              for(let i = 0; i < carouselItems.length; i++) {
                  const item = carouselItems[i];
                  const itemOffsetLeft = item.offsetLeft;

                  const diff = Math.abs(container.scrollLeft - itemOffsetLeft);

                  if (diff < minDiff) {
                      minDiff = diff;
                      closestIndex = i;
                  }
                   const tempContainerWidth = container.offsetWidth; // Get width inside loop
                   if (itemOffsetLeft > container.scrollLeft + tempContainerWidth + 10) {
                       break;
                   }
              }
             container.dataset.currentSlideIndex = closestIndex;
         } else {
              container.dataset.currentSlideIndex = 0;
         }


        // ResizeObserver to handle layout changes and re-clamp scroll/update index
        new ResizeObserver(() => {
             stopAutoPlay(); // Stop auto-play during resize

             const containerWidth = container.offsetWidth;
             const scrollWidth = container.scrollWidth;
             const maxScrollLeft = scrollWidth - containerWidth;
             let currentScrollLeft = container.scrollLeft;

             const clampedScrollLeft = Math.max(0, Math.min(maxScrollLeft, currentScrollLeft));

             // If clamping changed the position, scroll to the clamped position smoothly
             if (Math.abs(clampedScrollLeft - currentScrollLeft) > 1) {
                  container.scrollTo({
                     left: clampedScrollLeft,
                     behavior: 'smooth'
                  });
             }
             container.dataset.currentScrollLeft = container.scrollLeft;


             // Re-estimate index after resize
             const computedGap = parseFloat(getComputedStyle(carouselSlides).gap.split(' ')[0]) || 0;
              let closestIndex = 0;
              let minDiff = Infinity;
              for(let i = 0; i < carouselItems.length; i++) {
                  const item = carouselItems[i];
                  const itemOffsetLeft = item.offsetLeft;
                  const diff = Math.abs(container.scrollLeft - itemOffsetLeft);
                  if (diff < minDiff) {
                      minDiff = diff;
                      closestIndex = i;
                  }
                   const tempContainerWidth = container.offsetWidth; // Get width inside loop
                   if (itemOffsetLeft > container.scrollLeft + tempContainerWidth + 10) {
                       break;
                   }
              }
             container.dataset.currentSlideIndex = closestIndex;

             // Auto-play will be restarted after resize finishes and scrolling (if any) stops
         }).observe(container);

        // --- Start auto-play initially ---
        startAutoPlay();
        // --- End Start auto-play ---

    });
}
