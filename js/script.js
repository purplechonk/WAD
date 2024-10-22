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
const buttons = document.querySelectorAll('.tag-buttons .btn');

// Add click event listener to each button
buttons.forEach(button => {
  button.addEventListener('click', function(event) {
    event.preventDefault(); // Prevent default link behavior
    this.classList.toggle('active'); // Toggle the 'active' class to allow multiple selections
  });
});





 
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

const catbtn = document.getElementById("catbtn");
const searchbtn = document.getElementById("searchbtn");

  (function (d) {
    "use strict";
  
    //lets add the observer element dynamically.
    var newEl = d.createElement("div");
    newEl.classList.add("myObserver");
    var ref = d.querySelector("#subnavfilter");
    insertBefore(newEl, ref);
    function insertBefore(el, referenceNode) {
      referenceNode.parentNode.insertBefore(el, referenceNode);
    }
  
    var observer = new IntersectionObserver(
      function (entries) {
        if (entries[0].intersectionRatio === 0) {
          d.querySelector("#subnavfilter").classList.add("hiddensubnav");
          //newEl.classList.add("sticky-observer");
        } else if (entries[0].intersectionRatio === 1) {
          d.querySelector("#subnavfilter").classList.remove("hiddensubnav");
          //newEl.classList.remove("sticky-observer");
        }
      },
      { threshold: [0, 1] }
    );
  
    observer.observe(d.querySelector(".myObserver"));
    catbtn.onclick = function() {
      if (d.querySelector("#subnavfilter").classList.contains("hiddensubnav")) {
        d.querySelector("#subnavfilter").classList.remove("hiddensubnav");
      }
      else {
        d.querySelector("#subnavfilter").classList.add("hiddensubnav");
      }
    }
    
    searchbtn.onclick = function() {
      if (d.querySelector("#subnavfilter").classList.contains("hiddensubnav")) {
        d.querySelector("#subnavfilter").classList.remove("hiddensubnav");
      }
      else {
        d.querySelector("#subnavfilter").classList.add("hiddensubnav");
      }
    }
  })(document);


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
