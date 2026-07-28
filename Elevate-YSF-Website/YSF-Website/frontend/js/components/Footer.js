export default {
  name: 'SiteFooter',
  template: `
    <footer class="site-footer">
      <div class="container">
        <h2>More Than A Game</h2>
        <p>Empowering students to the next level through sports and fellowship.</p>
        <div class="socials">
          <a href="https://www.facebook.com/profile.php?id=61580589479621" target="_blank" rel="noopener" aria-label="Facebook">
            <i class="fab fa-facebook"></i>
          </a>
          <a href="https://www.instagram.com/elevate.ysf/" target="_blank" rel="noopener" aria-label="Instagram">
            <i class="fab fa-instagram"></i>
          </a>
        </div>
        <p class="footer-fine">&copy; {{ year }} Elevate YSF &mdash; Youth Sports Fellowship. All rights reserved.</p>
      </div>
    </footer>
  `,
  data() {
    return { year: new Date().getFullYear() };
  },
};
