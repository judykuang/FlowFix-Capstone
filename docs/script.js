//Homepage functionality

document.addEventListener("DOMContentLoaded", function () {
  // Smooth scrolling for navigation links, only for in-page
  const navLinks = document.querySelectorAll('a[href^="#"]');
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      const targetSection = document.querySelector(targetId);
      if (targetSection) {
        targetSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  //button handling, **IMPLEMENTATION BELOW @Leilamoumou**
  const ctaButtons = document.querySelectorAll(".btn[data-href]");

  ctaButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const destination = this.getAttribute("data-href");
      if (destination) {
        window.location.href = destination;
      }
      // TODO: Add functionality to route once backend is connected
    });
  });
});

/* Chat bubble toggles */
const chat_bubble = document.getElementById("chat_bubble");
const chat_window = document.getElementById("chat_window");
const close_chat = document.getElementById("close_chat");
//chat bubble front-end user functionality :3
if (chat_bubble && chat_window) {
  chat_bubble.addEventListener("click", function () {
    chat_window.style.display =
      chat_window.style.display === "none" ? "block" : "none";
  });
  /*hamborg menu*/
  const hamburger = document.getElementById("hamburger");
  const mainNav = document.querySelector(".main-nav");
  if (hamburger && mainNav) {
    hamburger.addEventListener("click", function () {
      mainNav.classList.toggle("open");
    });
  }
}

if (close_chat && chat_window) {
  close_chat.addEventListener("click", function () {
    chat_window.style.display = "none";
  });
}

// Modal Functionality
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
btn.onclick = function() {
  modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

//Dark mode Toggle function, actual implementation still needed
// const themeToggle = document.getElementById("themeToggle");
// if (themeToggle) {
//   themeToggle.addEventListener("click", function () {
//     const html = document.documentElement;
//     const isDark = html.getAttribute("data-theme") === "dark";
//     html.setAttribute("data-theme", isDark ? "light" : "dark");
//     this.textContent = isDark ? "Dark Mode" : "Light Mode";
//   });
// }

//Dark Mode Toggle Function with Icon Swapping
// const themeToggle = document.getElementById("themeToggle");

// if (themeToggle)
// {
//   themeToggle.addEventListener("click", function()
//   {
//     const html = document.documentElement;
//     const themeIcon = this.querySelector("img");

//     // Checks if webpage is currently in Dark Mode
//     const isDark = html.getAttribute("data-theme") === "dark";

//     if (isDark)
//     {
//       // If webpage is in dark mode, switch to light mode
//       html.setAttribute("data-theme", "light");
//       themeIcon.src = "dark-mode.png";
//       themeIcon.alt = "Switch to Dark Mode"; // Alternative Text for greater accessibility
//     }
//     else
//     {
//       // If webpage is in light mode, switch to dark mode
//       html.setAttribute("data-theme", "dark");
//       themeIcon.src = "light-mode.png";
//       themeIcon.alt = "Switch to Light Mode"; // Alternative Text for greater accessibility
//     }
//   });
// }

// Light & Dark Mode Toggle with Local Storage that saves user's choice
const themeToggle = document.getElementById("themeToggle");

if (themeToggle) 
{
  const html = document.documentElement;
  const themeIcon = themeToggle.querySelector("img");

  const updateIcon = (isDark) => {
    themeIcon.src = isDark ? "light-mode.png" : "dark-mode.png";
    themeIcon.alt = isDark ? "Switch to Light Mode" : "Switch to Dark Mode";
  };

  const currentThemeDark = html.getAttribute("data-theme") === "dark";
  updateIcon(currentThemeDark);

  // On click, toggle between the themes & store the current theme in local storage
  themeToggle.addEventListener("click", function() {
    const isDark = html.getAttribute("data-theme") === "dark";
    const newTheme = isDark ? "light" : "dark";
    html.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateIcon(!isDark);
  });
}