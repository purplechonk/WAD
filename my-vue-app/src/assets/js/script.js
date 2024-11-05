// // Replace Text In Header
// const checkReplace = document.querySelector('.replace-me');

// if (checkReplace !== null) {
//   const replace = new ReplaceMe(checkReplace, {
//     animation: 'animated fadeIn',
//     speed: 2000,
//     separator: ',',
//     loopCount: 'infinite',
//     autoRun: true,
//   });
// }

// User Scroll For Navbar
// function userScroll() {
//   const navbar = document.querySelector('.navbar');

//   window.addEventListener('scroll', () => {
//     if (window.scrollY > 50) {
//       navbar.classList.add('bg-dark');
//       navbar.classList.add('border-bottom');
//       navbar.classList.add('border-secondary');
//       navbar.classList.add('navbar-sticky');
//     } else {
//       navbar.classList.remove('bg-dark');
//       navbar.classList.remove('border-bottom');
//       navbar.classList.remove('border-secondary');
//       navbar.classList.remove('navbar-sticky');
//     }
//   });
// }

// document.addEventListener('DOMContentLoaded', userScroll);

// // Video Modal
// const videoBtn = document.querySelector('.video-btn');
// const videoModal = document.querySelector('#videoModal');
// const video = document.querySelector('#video');
// let videoSrc;

// if (videoBtn !== null) {
//   videoBtn.addEventListener('click', () => {
//     videoSrc = videoBtn.getAttribute('data-bs-src');
//   });
// }

// if (videoModal !== null) {
//   videoModal.addEventListener('shown.bs.modal', () => {
//     video.setAttribute(
//       'src',
//       videoSrc + '?autoplay=1;modestbranding=1;showInfo=0'
//     );
//   });

//   videoModal.addEventListener('hide.bs.modal', () => {
//     video.setAttribute('src', videoSrc);
//   });
// }


// // EVENTS SUBNAV

// window.addEventListener('scroll', function() {
//   var subnav = document.getElementById('subnav');
//   if (window.scrollY > 0) { // Check if scrolled and "Events" was clicked
//     subnav.style.display = 'flex'; // Set display to flex
//     subnav.style.transform = 'translateY(0)'; // Slide down
//     setTimeout(function() {
//       subnav.style.opacity = '1'; // Slowly show the subnav by changing opacity
//     }, 1000); // Small delay for transition effect
//   } 
//  });

// // EVENTS SUBNAV (allow multiple selections)

// // Select all buttons in the subnav
// const buttons = document.querySelectorAll('.subnav a.btn');

// // Add click event listener to each button
// buttons.forEach(button => {
//   button.addEventListener('click', function(event) {
//     event.preventDefault(); // Prevent default link behavior
//     this.classList.toggle('active'); // Toggle the 'active' class to allow multiple selections
//   });
// });

