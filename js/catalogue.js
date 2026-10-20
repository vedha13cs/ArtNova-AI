/**
 * ArtNova AI — Catalogue Module (js/catalogue.js)
 * Generates shareable catalogue link, WhatsApp broadcast shortcut, and phone settings.
 */

document.addEventListener('DOMContentLoaded', () => {
  const urlDisplay = document.getElementById('catalogue-link-display');
  const btnCopy = document.getElementById('btn-copy-link');
  const btnOpen = document.getElementById('btn-open-catalogue');
  const btnShareWhatsapp = document.getElementById('btn-share-whatsapp');
  const inputPhone = document.getElementById('catalogue-phone-input');
  const btnSavePhone = document.getElementById('btn-save-phone');

  function updateCatalogueView() {
    const user = window.Store.getUser();
    const currentOrigin = window.location.origin;
    const cataloguePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/')) + '/shop.html';
    const fullUrl = `${currentOrigin}${cataloguePath}?seller=${user.slug}`;

    if (urlDisplay) {
      urlDisplay.textContent = fullUrl;
    }

    if (btnCopy) {
      btnCopy.onclick = () => {
        window.copyToClipboard(fullUrl, 'Shareable catalogue link copied!');
      };
    }

    if (btnOpen) {
      btnOpen.href = fullUrl;
      btnOpen.target = '_blank';
    }

    if (btnShareWhatsapp) {
      const shareText = encodeURIComponent(`🌸 Discover my handmade artisanal catalogue at ${user.shopName}! View latest collections & order directly: ${fullUrl}`);
      btnShareWhatsapp.href = `https://wa.me/?text=${shareText}`;
      btnShareWhatsapp.target = '_blank';
    }

    if (inputPhone && user.phone) {
      inputPhone.value = user.phone;
    }
  }

  // Save phone number for WhatsApp customer ordering
  if (btnSavePhone && inputPhone) {
    btnSavePhone.addEventListener('click', () => {
      const phone = inputPhone.value.trim().replace(/\D/g, '');
      if (phone.length < 8) {
        window.showToast('Please enter a valid phone number with country code (e.g. 919876543210).', 'error');
        return;
      }

      const user = window.Store.getUser();
      user.phone = phone;
      window.Store.saveUser(user);
      window.showToast('WhatsApp ordering phone number saved!', 'success');
    });
  }

  updateCatalogueView();

  window.Store.on(() => {
    updateCatalogueView();
  });
});
