document.addEventListener('DOMContentLoaded', function() {
  const menuToggle = document.getElementById('menu-toggle');
  const sideMenu = document.getElementById('side-menu');

  menuToggle.addEventListener('click', function() {
    sideMenu.classList.toggle('open');
  });

  // 如果點擊選單外的區域，也可以關閉選單 (可選)
  document.addEventListener('click', function(event) {
    if (!sideMenu.contains(event.target) && !menuToggle.contains(event.target) && sideMenu.classList.contains('open')) {
      sideMenu.classList.remove('open');
    }
  });
});