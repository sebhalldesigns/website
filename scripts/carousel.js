
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

             // Ensure items exist before trying to access offsetLeft
             if (carouselItems.length > 0) {
                for (let i = 0; i < carouselItems.length; i++) {
                    const item = carouselItems[i];
                    // item.offsetLeft gives the position of the item's left edge
                    // relative to the start of the offsetParent (the flex container)
                    const itemOffsetLeft = item.offsetLeft;

                    const diff = Math.abs(finalScrollLeft - itemOffsetLeft);

                    if (diff < minDiff) {
                        minDiff = diff;
                        closestScrollLeft = itemOffsetLeft;
                    }
                    // Optimization: if itemOffsetLeft is significantly past the target, no need to check further
                    // Add tolerance
                     if (itemOffsetLeft > finalScrollLeft + containerWidth + 10) {
                         break;
                     }
                }
                 // Use the closest item's offsetLeft as the final snapped scroll position
                 finalScrollLeft = closestScrollLeft;

                 // Re-clamp the snapped position to ensure it's within the overall scroll bounds
                 finalScrollLeft = Math.max(0, Math.min(maxScrollLeft, finalScrollLeft));

             } else {
                 finalScrollLeft = 0; // Default to 0 if no items
             }
            // --- End Snap Logic ---


            // If the target position is the same as the current position, do nothing
            // This prevents unnecessary scrolls and helps with button responsiveness
            if (Math.abs(finalScrollLeft - container.scrollLeft) < 1) { // Add a small tolerance
                // Ensure buttons are enabled if no scrolling is happening
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


        // Event listener for the Next button - Scroll by one item width + gap
        nextButton.addEventListener('click', () => {
            // If already scrolling, ignore the click
            if (isScrolling) {
                return;
            }

             // Recalculate item width and gap for accurate scroll amount
            const itemWidth = carouselItems[0]?.offsetWidth || 0;
             // Get the computed horizontal gap (split handles potential "Xpx Ypx" format)
             const computedGap = parseFloat(getComputedStyle(carouselSlides).gap.split(' ')[0]) || 0;
            const itemScrollAmount = itemWidth + computedGap;

            const targetScrollLeft = container.scrollLeft + itemScrollAmount;
            scrollToPosition(targetScrollLeft);
        });

        // Event listener for the Previous button - Scroll by one item width + gap
        prevButton.addEventListener('click', () => {
             // If already scrolling, ignore the click
            if (isScrolling) {
                return;
            }

             // Recalculate item width and gap for accurate scroll amount
            const itemWidth = carouselItems[0]?.offsetWidth || 0;
             const computedGap = parseFloat(getComputedStyle(carouselSlides).gap.split(' ')[0]) || 0;
            const itemScrollAmount = itemWidth + computedGap;

            const targetScrollLeft = container.scrollLeft - itemScrollAmount;
            scrollToPosition(targetScrollLeft);
        });

        // Listen for user scrolling and the end of smooth scrolling
        container.addEventListener('scroll', () => {
            // Clear the previous timeout
            clearTimeout(scrollTimeout);

            // Set a new timeout to detect the end of scrolling
            // This timeout duration determines how long after the last 'scroll' event
            // we consider the scrolling to have stopped.
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
                           // Optimization
                           const containerWidth = container.offsetWidth;
                           if (itemOffsetLeft > container.scrollLeft + containerWidth + 10) {
                               break;
                           }
                      }
                     container.dataset.currentSlideIndex = closestIndex;
                  } else {
                       container.dataset.currentSlideIndex = 0;
                  }

            }, 150); // Adjust timeout duration as needed (e.g., 150ms is often reliable)

             // While scrolling, you could update UI elements here if needed
             // For example, changing button opacity based on scroll position.
        });

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
             const containerWidth = container.offsetWidth;
             const scrollWidth = container.scrollWidth;
             const maxScrollLeft = scrollWidth - containerWidth;
             let currentScrollLeft = container.scrollLeft;

             // Clamp the current scroll position if it's out of bounds after resize
             const clampedScrollLeft = Math.max(0, Math.min(maxScrollLeft, currentScrollLeft));

             // If clamping changed the position, scroll to the clamped position smoothly
             // (This might trigger the scroll event listener)
             if (Math.abs(clampedScrollLeft - currentScrollLeft) > 1) { // Use tolerance
                  container.scrollTo({
                     left: clampedScrollLeft,
                     behavior: 'smooth'
                  });
             }
             // Update the stored scroll position regardless
             container.dataset.currentScrollLeft = container.scrollLeft;


             // Re-estimate index after resize (using the actual current scrollLeft)
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

             // Re-evaluate button states based on new scroll position and maxScrollLeft if not looping
             // If looping, buttons are always enabled.
         }).observe(container);


    });
}