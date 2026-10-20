/**
 * ArtNova AI — Auth & Shop Creation Module (js/auth.js)
 * Supports creating your own independent artisan shop with custom slug and WhatsApp number.
 */

document.addEventListener('DOMContentLoaded', () => {
  const loginTab = document.getElementById('tab-login');
  const signupTab = document.getElementById('tab-signup');
  const authForm = document.getElementById('auth-form');
  const signupFields = document.querySelectorAll('.signup-only');
  const submitBtn = document.getElementById('auth-submit-btn');
  const formTitle = document.getElementById('auth-title');
  const formSubtitle = document.getElementById('auth-subtitle');
  const errorBox = document.getElementById('auth-error');
  const shopNameInput = document.getElementById('input-shopname');
  const slugPreview = document.getElementById('slug-preview');
  const togglePassBtn = document.getElementById('toggle-password');
  const passwordInput = document.getElementById('input-password');

  let mode = 'login'; // 'login' or 'signup'

  function setMode(newMode) {
    mode = newMode;
    if (errorBox) errorBox.style.display = 'none';

    if (mode === 'signup') {
      if (loginTab) loginTab.classList.remove('active');
      if (signupTab) signupTab.classList.add('active');
      signupFields.forEach(el => el.style.display = 'block');
      if (formTitle) formTitle.textContent = 'Open Your Own Shop';
      if (formSubtitle) formSubtitle.textContent = 'Create your unique storefront in 30 seconds';
      if (submitBtn) submitBtn.textContent = 'Create Shop & Open Dashboard';
    } else {
      if (signupTab) signupTab.classList.remove('active');
      if (loginTab) loginTab.classList.add('active');
      signupFields.forEach(el => el.style.display = 'none');
      if (formTitle) formTitle.textContent = 'Welcome Back!';
      if (formSubtitle) formSubtitle.textContent = 'Log in to your account';
      if (submitBtn) submitBtn.textContent = 'Login';
    }
  }

  if (loginTab && signupTab) {
    loginTab.addEventListener('click', () => setMode('login'));
    signupTab.addEventListener('click', () => setMode('signup'));
  }

  // Live slug preview generator
  if (shopNameInput && slugPreview) {
    shopNameInput.addEventListener('input', (e) => {
      const slug = e.target.value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'your-shop';
      slugPreview.textContent = `shop.html?seller=${slug}`;
    });
  }

  // Toggle password visibility
  if (togglePassBtn && passwordInput) {
    togglePassBtn.addEventListener('click', () => {
      const isPass = passwordInput.getAttribute('type') === 'password';
      passwordInput.setAttribute('type', isPass ? 'text' : 'password');
    });
  }

  // Form Submit
  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (errorBox) errorBox.style.display = 'none';
      submitBtn.disabled = true;

      try {
        if (mode === 'signup') {
          const ownerName = document.getElementById('input-name').value.trim();
          const shopName = shopNameInput.value.trim();
          const location = (document.getElementById('input-location') ? document.getElementById('input-location').value.trim() : '') || 'India';
          const phone = document.getElementById('input-phone').value.trim();
          const email = document.getElementById('input-email').value.trim();

          if (!shopName || !ownerName) {
            throw new Error('Please enter your name and shop name.');
          }

          // Create brand new shop in the reactive store
          const newShop = window.Store.createShop({
            ownerName,
            shopName,
            location,
            phone: phone || '919876543210',
            email
          });

          window.showToast(`Congratulations! "${newShop.shopName}" has been created.`, 'success');
        } else {
          // In login mode, log in as active shop
          const emailOrUser = document.getElementById('input-email').value.trim().toLowerCase();
          const shops = window.Store.getAllShops();
          const matched = shops.find(s => s.email.toLowerCase() === emailOrUser || s.slug === emailOrUser || s.shopName.toLowerCase().includes(emailOrUser));
          
          if (matched) {
            window.Store.setActiveShopId(matched.id);
            window.showToast(`Welcome back to ${matched.shopName}!`, 'success');
          } else {
            window.showToast(`Signed in to active shop!`, 'success');
          }
        }

        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 700);

      } catch (err) {
        if (errorBox) {
          errorBox.textContent = err.message || 'Authentication error. Please try again.';
          errorBox.style.display = 'block';
        }
        submitBtn.disabled = false;
      }
    });
  }
});
