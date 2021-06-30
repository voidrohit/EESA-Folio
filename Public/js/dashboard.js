
const navSlide = () => {
    const burger = document.querySelector('.material-icons');
    const nav = document.querySelector('.header');
  
    burger.addEventListener('click', () => {
        nav.classList.toggle('nav-active');
        burger.classList.toggle('toggle');
    });
  
  }
  
  navSlide();
