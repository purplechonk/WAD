// Replace Text In Header
const checkReplace = document.querySelector('.replace-me');

if (checkReplace !== null) {
  const replace = new ReplaceMe(checkReplace, {
    animation: 'animated fadeIn',
    speed: 2000,
    separator: ',',
    loopCount: 'infinite',
    autoRun: true,
  });
}

// User Scroll For Navbar
function userScroll() {
  const navbar = document.querySelector('.navbar');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('bg-dark');
      navbar.classList.add('border-bottom');
      navbar.classList.add('border-secondary');
      navbar.classList.add('navbar-sticky');
    } else {
      navbar.classList.remove('bg-dark');
      navbar.classList.remove('border-bottom');
      navbar.classList.remove('border-secondary');
      navbar.classList.remove('navbar-sticky');
    }
  });
}

document.addEventListener('DOMContentLoaded', userScroll);

// Video Modal
const videoBtn = document.querySelector('.video-btn');
const videoModal = document.querySelector('#videoModal');
const video = document.querySelector('#video');
let videoSrc;

if (videoBtn !== null) {
  videoBtn.addEventListener('click', () => {
    videoSrc = videoBtn.getAttribute('data-bs-src');
  });
}

if (videoModal !== null) {
  videoModal.addEventListener('shown.bs.modal', () => {
    video.setAttribute(
      'src',
      videoSrc + '?autoplay=1;modestbranding=1;showInfo=0'
    );
  });

  videoModal.addEventListener('hide.bs.modal', () => {
    video.setAttribute('src', videoSrc);
  });
}


// // EVENTS SUBNAV

// window.addEventListener('scroll', function() {
//   var subnav = document.getElementById('subnavbtn');
//   if (window.scrollY > 0) { // Check if scrolled and "Events" was clicked
//     subnav.style.display = 'flex'; // Set display to flex
//     subnav.style.transform = 'translateY(0)'; // Slide down
//     setTimeout(function() {
//       subnav.style.opacity = '1'; // Slowly show the subnav by changing opacity
//     }, 1000); // Small delay for transition effect
//   } 
//  });

// EVENTS SUBNAV (allow multiple selections)

// Select all buttons in the subnav
// const buttons = document.querySelectorAll('.tag-buttons .btn');

// // Add click event listener to each button
// buttons.forEach(button => {
//   button.addEventListener('click', function(event) {
//     event.preventDefault(); // Prevent default link behavior
//     this.classList.toggle('active'); // Toggle the 'active' class to allow multiple selections
//   });
// });





 
// catbtn.addEventListener('click', () => { 
//   showSubnav() 
// }); 

// searchbtn.addEventListener('click', () => { 
//     showSubnav()
// });

//   function showSubnav() {
//     if (subnavbtn.style.display === 'none' || subnavbtn.style.display === '') { 
//       subnavbtn.style.display = 'block'; // Show the div 
//     } else { 
//       subnavbtn.style.display = 'none'; // Hide the div 
//     }  
//   }


  // TRYING THE AIRBNB SCROLLING FILTER THINGY 
  // 1. at the top, the subnav should be displayed but once user 
  // scrolls down, the subnav should be hidden
  // 2. the following functions should allow for user to hide 
  // and unhide the subnav manually even if they are at the top page
  // or otherwise

  // ---------------------------------------------

// const catbtn = document.getElementById("catbtn");
// const searchbtn = document.getElementById("searchbtn");

//   (function (d) {
//     "use strict";
  
//     //lets add the observer element dynamically.
//     var newEl = d.createElement("div");
//     newEl.classList.add("myObserver");
//     var ref = d.querySelector("#subnavfilter");
//     insertBefore(newEl, ref);
//     function insertBefore(el, referenceNode) {
//       referenceNode.parentNode.insertBefore(el, referenceNode);
//     }
  
//     var observer = new IntersectionObserver(
//       function (entries) {
//         if (entries[0].intersectionRatio === 0) {
//           d.querySelector("#subnavfilter").classList.add("hiddensubnav");
//           d.querySelector("#catbtn").classList.remove("changebottom");
//           d.querySelector("#searchbtn").classList.remove("changebottom");
//           //newEl.classList.add("sticky-observer");
//         } else if (entries[0].intersectionRatio === 1) {
//           d.querySelector("#subnavfilter").classList.remove("hiddensubnav");
//           d.querySelector("#catbtn").classList.add("changebottom");
//           d.querySelector("#searchbtn").classList.add("changebottom");
//           //newEl.classList.remove("sticky-observer");
//         }
//       },
//       { threshold: [0, 1] }
//     );
  
//     observer.observe(d.querySelector(".myObserver"));
//     catbtn.onclick = function() {
//       if (d.querySelector("#subnavfilter").classList.contains("hiddensubnav")) {
//         d.querySelector("#subnavfilter").classList.remove("hiddensubnav");
//         d.querySelector("#catbtn").classList.add("changebottom");
//         d.querySelector("#searchbtn").classList.add("changebottom");
//       }
//       else {
//         d.querySelector("#subnavfilter").classList.add("hiddensubnav");
//         d.querySelector("#catbtn").classList.remove("changebottom");
//         d.querySelector("#searchbtn").classList.remove("changebottom");

//       }
//     }
    
//     searchbtn.onclick = function() {
//       if (d.querySelector("#subnavfilter").classList.contains("hiddensubnav")) {
//         d.querySelector("#subnavfilter").classList.remove("hiddensubnav");
//         d.querySelector("#searchbtn").classList.add("changebottom");
//         d.querySelector("#catbtn").classList.add("changebottom");
//       }
//       else {
//         d.querySelector("#subnavfilter").classList.add("hiddensubnav");
//         d.querySelector("#searchbtn").classList.remove("changebottom");
//         d.querySelector("#catbtn").classList.remove("changebottom");
//       }
//     }
//   })(document);



// TOGGLING THE FILTER NAVBAR
// --------------------------------------------------------------
// Get the elements
const expandedFilter = document.getElementById('filter-expanded');
const collapsedFilter = document.getElementById('filter-collapsed');

// Function to show expanded and hide collapsed
function showExpanded() {
    expandedFilter.style.visibility = 'visible';
    expandedFilter.style.opacity = '1';
    collapsedFilter.style.visibility = 'hidden';
    collapsedFilter.style.opacity = '0';
}

// Function to show collapsed and hide expanded
function showCollapsed() {
    expandedFilter.style.visibility = 'hidden';
    expandedFilter.style.opacity = '0';
    collapsedFilter.style.visibility = 'visible';
    collapsedFilter.style.opacity = '1';
}

// Initially show expanded only
showExpanded();

// Handle scroll
window.addEventListener('scroll', () => {
    if (window.scrollY > 0) {
        showCollapsed();
    } else {
        showExpanded();
    }
});

// Handle clicks on any element within collapsed filter
collapsedFilter.addEventListener('click', (event) => {
    // Prevent default button behavior
    event.preventDefault();
    // Show expanded filter when collapsed filter is clicked
    showExpanded();
});

// Handle clicks outside expanded filter when scrolled
document.addEventListener('click', (event) => {
    if (window.scrollY > 0) {
        // Check if click is outside expanded filter
        if (!expandedFilter.contains(event.target) && !collapsedFilter.contains(event.target)) {
            showCollapsed();
        }
    }
});

// Prevent expanded filter from closing when clicked
expandedFilter.addEventListener('click', (event) => {
    event.stopPropagation();
});


// FILTER DROPDOWN MULTISELECT
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  const categoriesBtn = document.getElementById('categories-btn');
  const sbpart0 = document.querySelector('.sbpart0');
  const sbpart1 = document.querySelector('.sbpart1');
  const categoriesDropdown = document.getElementById('categories-dropdown');
  const categoryDisplay = document.querySelector('.category-display');
  const categoryOptions = document.querySelectorAll('.category-option');
  
  let selectedCategories = new Set();

  // Toggle dropdown when clicking sbpart0
  sbpart0.addEventListener('click', function(e) {
      // Only toggle if not clicking category options or remove buttons
      if (!categoriesDropdown.contains(e.target)) { 
          e.stopPropagation();
          categoriesDropdown.classList.toggle('active');
      }
  });

  // Handle category selection
categoryOptions.forEach(option => {
    option.addEventListener('click', function(e) {
        e.stopPropagation(); // Stop event from bubbling to sbpart0
        const categoryValue = this.getAttribute('data-value');

        if (categoryValue === 'all') {
            // If "all" is clicked, deselect other options
            selectedCategories.clear();
            categoryOptions.forEach(opt => {
                opt.classList.remove('selected');
            });
            option.classList.add('selected'); // Select only the "all" option
        } else {
            // Toggle individual category
            if (selectedCategories.has(categoryValue)) {
                selectedCategories.delete(categoryValue);
                this.classList.remove('selected');
            } else {
                selectedCategories.add(categoryValue);
                this.classList.add('selected');
            }

            // Check if all options except "all" are selected
            const totalOptions = categoryOptions.length - 1; // Exclude "all"
            if (selectedCategories.size === totalOptions) {
                // Select "all" option and deselect others
                selectedCategories.clear();
                categoryOptions.forEach(opt => opt.classList.remove('selected'));
                document.querySelector('[data-value="all"]').classList.add('selected');
            } else {
                // Ensure "all" is deselected when other options are selected
                document.querySelector('[data-value="all"]').classList.remove('selected');
            }
        }

        // Update display text
        updateCategoryDisplay();
    });

    // Add remove button to each option
    const removeBtn = document.createElement('span');
    removeBtn.classList.add('remove-tag');
    removeBtn.innerHTML = '×';
    removeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const categoryValue = this.parentElement.getAttribute('data-value');
        selectedCategories.delete(categoryValue);
        this.parentElement.classList.remove('selected');
        
        // Ensure "all" is deselected when other options are manually deselected
        document.querySelector('[data-value="all"]').classList.remove('selected');

        updateCategoryDisplay();
    });
    option.appendChild(removeBtn);
});

  // Update category display text
  function updateCategoryDisplay() {
    const allOption = document.querySelector('[data-value="all"]');

    if (selectedCategories.size === 0) {
        categoryDisplay.textContent = 'All categories';
        // Ensure "All" option is highlighted
        allOption.classList.add('selected');
    } else if (selectedCategories.size === 1) {
        categoryDisplay.textContent = `${selectedCategories.size} category`;
        allOption.classList.remove('selected'); // Ensure "All" is deselected
    } else {
        categoryDisplay.textContent = `${selectedCategories.size} categories`;
        allOption.classList.remove('selected'); // Ensure "All" is deselected
    }
  }



  // Close dropdown when clicking outside
  document.addEventListener('click', function(e) {
      if (!categoriesDropdown.contains(e.target) && !sbpart0.contains(e.target)) {
          categoriesDropdown.classList.remove('active');
          console.log('Dropdown closed by clicking outside');
      }
  });

  // Close dropdown when clicking on sbpart1 --> events button and input 
  // ** somehow adding sbart1 under the if loop on top doesnt work lol
  // Function to close dropdown
  const closeDropdown = () => {
    if (categoriesDropdown.classList.contains('active')) {
        categoriesDropdown.classList.remove('active');
        console.log('Dropdown closed');
    }
  };

  // Add click event listener to sbpart1
  sbpart1.addEventListener('click', function(e) {
      console.log('Clicked element:', e.target);
      closeDropdown();
  });


    // DYNAMICALLY CHANGE RESULTS FROM EXPANDED TO COLLAPSED FILTER
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  //CATEGORIES FIRST_________

  // Get additional elements needed for new functionality
  const searchButton1 = document.querySelector('.search-button1');
  const collapsedCategoryBtn = document.querySelector('.filter-collapsed .sbpart3 .category-button');

  searchButton1.addEventListener('click', function(e) {
    closeDropdown();
    console.log('Clicked element:', e.target);

    // Update the collapsed filter button text based on selection
    if (selectedCategories.size === 0) {
        collapsedCategoryBtn.textContent = 'All Categories';
    } else {
        collapsedCategoryBtn.textContent = `${selectedCategories.size} Categories`;
    }

    // Use your existing showCollapsed function to switch views
    showCollapsed();

  });

  // Add click event to collapsed category button to expand again
  collapsedCategoryBtn.addEventListener('click', function(event) {
    // Prevent the default collapsedFilter click behavior
    event.stopPropagation();
    
    // Show expanded filter
    showExpanded();
  });


    //EVENTS NOW_________


  // Get additional elements needed for new functionality
  const searchInput = document.getElementById('search-events'); // Search input field
  const eventButton = document.querySelector('.filter-collapsed .sbpart4 .btn.event-button'); // Event button in collapsed filter

  // Function to handle search and switch from expanded to collapsed filter
  searchButton1.addEventListener('click', function (e) {
    closeDropdown(); // Close any open dropdowns
    console.log('Search button clicked:', e.target);

    // Get the search input value
    const searchedEvent = searchInput.value.trim();

    // Update the collapsed filter button text based on search input
    if (searchedEvent) {
        eventButton.textContent = searchedEvent; // Set the event button text to the searched event
    } else {
        eventButton.textContent = 'All Events'; // Default text if no search input is provided
    }

    // Switch from expanded to collapsed view
    showCollapsed();
    console.log('Switched to collapsed filter with searched event:', searchedEvent);
  });

  //_________________________
  // Ensure typing animation is triggered when clicking anywhere on the search area

  // Helper function to focus the search input and ensure typing animation is visible
  function focusSearchInput() {
    searchInput.focus(); // Focus the search input
    searchInput.classList.add('typing'); // Add a typing class to trigger animation

    // Optional: Remove the animation class after a short delay to reset
    setTimeout(() => searchInput.classList.remove('typing'), 1000);
  }

  // Add event listener to the entire sbpart1 section to focus the search input on click
  sbpart1.addEventListener('click', (e) => {
    console.log('Search area clicked:', e.target);
    focusSearchInput();
  });

  // Ensure the typing animation works when interacting directly with the input
  searchInput.addEventListener('focus', () => {
    searchInput.classList.add('typing'); // Trigger the typing animation
  });

  // Optional: Reset animation when input loses focus (for re-triggering on click)
  searchInput.addEventListener('blur', () => {
    searchInput.classList.remove('typing');
  });


//____________________________________________


  




  


  







//  this works, but i want a new design

// const categoriesBtn = document.getElementById('categories-btn');
// const categoriesDropdown = document.getElementById('categories-dropdown');
// const categoryDisplay = document.querySelector('.category-display');
// const checkboxes = document.querySelectorAll('.category-checkbox');

// // Toggle dropdown
// categoriesBtn.addEventListener('click', (e) => {
//     e.stopPropagation();
//     categoriesDropdown.classList.toggle('active');
// });

// // Close dropdown when clicking outside
// document.addEventListener('click', (e) => {
//     if (!categoriesDropdown.contains(e.target) && !categoriesBtn.contains(e.target)) {
//         categoriesDropdown.classList.remove('active');
//     }
// });

// // Handle checkbox changes
// checkboxes.forEach(checkbox => {
//     checkbox.addEventListener('change', updateSelectedCategories);
// });

// // Update the display text based on selections
// function updateSelectedCategories() {
//     const selectedCategories = Array.from(checkboxes)
//         .filter(cb => cb.checked)
//         .map(cb => cb.nextElementSibling.textContent);

//     if (selectedCategories.length === 0) {
//         categoryDisplay.textContent = 'Choose categories';
//     } else if (selectedCategories.length === 1) {
//         categoryDisplay.textContent = selectedCategories[0];
//     } else {
//         categoryDisplay.textContent = `${selectedCategories.length} categories selected`;
//     }
// }

// // Prevent dropdown from closing when clicking inside
// categoriesDropdown.addEventListener('click', (e) => {
//     e.stopPropagation();
// });

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


// // Get the elements
// const expandedFilter = document.getElementById('filter-expanded');
// const collapsedFilter = document.getElementById('filter-collapsed');
// const collapsedButtons = collapsedFilter.querySelectorAll('.btn');

// // Initially hide collapsed filter
// collapsedFilter.style.display = 'none';

// // Handle scroll
// let isExpanded = true;
// window.addEventListener('scroll', () => {
//     if (window.scrollY > 50) {
//         if (isExpanded) {
//             expandedFilter.style.display = 'none';
//             collapsedFilter.style.display = 'flex';
//             isExpanded = false;
//         }
//     } else {
//         if (!isExpanded) {
//             expandedFilter.style.display = 'flex';
//             collapsedFilter.style.display = 'none';
//             isExpanded = true;
//         }
//     }
// });

// // Handle clicks on collapsed filter buttons and its container divs
// collapsedFilter.querySelectorAll('.sbpart3, .sbpart4, .search-button2').forEach(element => {
//   element.addEventListener('click', (e) => {
//       e.preventDefault();
//       e.stopPropagation();
//       console.log('Collapsed filter clicked'); // Debug log
//       expandedFilter.style.display = 'flex';
//       collapsedFilter.style.display = 'none';
//       isExpanded = true;
//   });
// });

// // Handle clicks outside expanded filter
// document.addEventListener('click', (e) => {
//   if (window.scrollY > 0 && isExpanded) {
//       if (!expandedFilter.contains(e.target) && !collapsedFilter.contains(e.target)) {
//           console.log('Outside click detected'); // Debug log
//           expandedFilter.style.display = 'none';
//           collapsedFilter.style.display = 'flex';
//           isExpanded = false;
//       }
//   }
// });

// // Prevent clicks inside expanded filter from closing it
// expandedFilter.addEventListener('click', (e) => {
//   e.stopPropagation();
// });

// // Add additional check for the search button in collapsed view
// const searchButton2 = document.querySelector('.search-button2');
// if (searchButton2) {
//   searchButton2.addEventListener('click', (e) => {
//       e.preventDefault();
//       e.stopPropagation();
//       console.log('Search button clicked'); // Debug log
//       expandedFilter.style.display = 'flex';
//       collapsedFilter.style.display = 'none';
//       isExpanded = true;
//   });
// }

// --------------------------

// // Handle clicks on collapsed filter buttons
// collapsedButtons.forEach(button => {
//     button.addEventListener('click', (e) => {
//         e.stopPropagation(); // Prevent click from immediately triggering document click
//         expandedFilter.style.display = 'flex';
//         collapsedFilter.style.display = 'none';
//         isExpanded = true;
//     });
// });

// // Handle clicks outside expanded filter
// document.addEventListener('click', (e) => {
//     if (window.scrollY > 0) { // Only handle outside clicks when scrolled
//         if (!expandedFilter.contains(e.target)) {
//             expandedFilter.style.display = 'none';
//             collapsedFilter.style.display = 'flex';
//             isExpanded = false;
//         }
//     }
// });

// // Prevent clicks inside expanded filter from closing it
// expandedFilter.addEventListener('click', (e) => {
//     e.stopPropagation();
// });

  //LOCK IN DATA FROM CATEGORY(S) SELECTED BY USER 
  // if cat 1 & 2 is selected, all cards with cat 1 and cat 2
  // inclusive will be selected even if they are in other cats 
  // too.
  // and display the corresponding cards 
  // when populating with data from database, make sure to change
  // data-tags for each data (for now is just hard coding)


//   var 
//   mContainer = $("#mnsry_container"),
//     filterButton = $(".button");
//     params = {
//             itemSelector: ".item",
//             filtersGroupSelector:".filters"
//     };

// $(window).load(function() { 

//   // Do mansonry with filtering 
//   mContainer.multipleFilterMasonry(params);
  
//   // Show articles with fadein
//   mContainer.find(".item").animate({
//     "opacity":1
//     }, 1200);

//   // Change the filtering button(label) status 
//   filterButton.find("input").change(function(){
//     $(this).parent().toggleClass("active");
//   });
  
// });



//   document.addEventListener("DOMContentLoaded", function () {
//     const postBlocksContainer = document.querySelector(".posts-container");
//     const tagButtons = document.querySelectorAll(".tag-buttons");
//     const loadMoreButton = document.getElementById("loadMoreButton");
//     const postBlocks = document.querySelectorAll(".post");
//     console.log(postBlocks);

//     let selectedTag = "all"; // Initially, "all" tag is selected
//     let currentPage = 1;
//     const itemsPerPage = 3;

//     function filterPostsByTag(tag) {
//         selectedTag = tag;
//         currentPage = 1; // Reset current page when changing tags

//         // Clear existing posts in the container
//         postBlocksContainer.innerHTML = '';

//         const filteredPostBlocks = Array.from(postBlocks).filter((block) => {
//             const tags = block.getAttribute("data-tags").split(",");
//             console.log(tags);
//             return selectedTag === "all" || tags.includes(selectedTag);
//         });

//         showPostsForPage(currentPage, filteredPostBlocks);
//         updateLoadMoreButton(filteredPostBlocks);
//     }

//     function showPostsForPage(pageNumber, postBlocks) {
//         const startIndex = (pageNumber - 1) * itemsPerPage;
//         const endIndex = Math.min(startIndex + itemsPerPage, postBlocks.length);

//         for (let i = startIndex; i < endIndex; i++) {
//             postBlocksContainer.appendChild(postBlocks[i].cloneNode(true));
//         }
//     }

//     function updateLoadMoreButton(filteredPostBlocks) {
//         const visiblePostCount = filteredPostBlocks.length;

//         if (visiblePostCount <= currentPage * itemsPerPage) {
//             loadMoreButton.style.display = "none";
//         } else {
//             loadMoreButton.style.display = "block";
//         }
//     }

//     function loadMorePosts() {
//         currentPage++;
//         const filteredPostBlocks = Array.from(postBlocks).filter((block) => {
//             const tags = block.getAttribute("data-tags").split(",");
//             return selectedTag === "all" || tags.includes(selectedTag);
//         });

//         showPostsForPage(currentPage, filteredPostBlocks);
//         updateLoadMoreButton(filteredPostBlocks);
//     }

//     tagButtons.forEach((button) => {
//         button.addEventListener("click", () => {
//             tagButtons.forEach((btn) => btn.classList.remove("active"));
//             button.classList.add("active");
//             const tag = button.getAttribute("data-tag");
//             filterPostsByTag(tag);
//         });
//     });

//     loadMoreButton.addEventListener("click", loadMorePosts);

//     // Initial setup
//     filterPostsByTag(selectedTag);
// });

