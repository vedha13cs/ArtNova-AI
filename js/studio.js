/**
 * ArtNova AI — Product Studio Module (js/studio.js)
 * 4-Step Interactive Flow:
 * 1. Upload Photo
 * 2. Real-time Image Enhancement
 * 3. AI Description Generator
 * 4. Preview & Publish
 */

document.addEventListener('DOMContentLoaded', () => {
  // Wizard steps
  let currentStep = 1;

  // State
  let imageFiles = {
    original: null,
    enhanced: null,
    selected: 'enhanced'
  };

  let productData = {
    name: '',
    category: 'Jewellery',
    price: '',
    material: '',
    description: ''
  };

  // DOM Elements
  const dropzone = document.getElementById('studio-dropzone');
  const fileInput = document.getElementById('studio-file-input');
  const stepPanels = [
    null,
    document.getElementById('step-1-panel'),
    document.getElementById('step-2-panel'),
    document.getElementById('step-3-panel'),
    document.getElementById('step-4-panel')
  ];

  const wizardSteps = document.querySelectorAll('.wizard-step');
  const stepDividers = document.querySelectorAll('.step-divider');

  // Step 2 elements
  const imgOriginal = document.getElementById('preview-original');
  const imgEnhanced = document.getElementById('preview-enhanced');
  const cardOriginal = document.getElementById('card-original');
  const cardEnhanced = document.getElementById('card-enhanced');

  // Step 3 elements
  const inputName = document.getElementById('prod-name');
  const inputCategory = document.getElementById('prod-category');
  const inputPrice = document.getElementById('prod-price');
  const inputMaterial = document.getElementById('prod-material');
  const textareaDesc = document.getElementById('prod-desc');
  const btnGenAI = document.getElementById('btn-generate-ai');

  // Step 4 elements
  const finalPreviewCard = document.getElementById('final-preview-card');
  const btnPublish = document.getElementById('btn-publish-product');

  // Navigation controller
  function goToStep(step) {
    currentStep = step;

    // Toggle panels
    for (let i = 1; i <= 4; i++) {
      if (stepPanels[i]) {
        stepPanels[i].style.display = i === step ? 'block' : 'none';
      }
    }

    // Update wizard indicators
    wizardSteps.forEach((stepEl, idx) => {
      const stepNum = idx + 1;
      if (stepNum === step) {
        stepEl.className = 'wizard-step active';
      } else if (stepNum < step) {
        stepEl.className = 'wizard-step completed';
      } else {
        stepEl.className = 'wizard-step';
      }
    });

    stepDividers.forEach((divider, idx) => {
      if (idx + 1 < step) {
        divider.classList.add('filled');
      } else {
        divider.classList.remove('filled');
      }
    });

    // Step-specific initialization
    if (step === 4) {
      renderFinalPreview();
    }
  }

  // Handle Image Upload & Canvas Enhancement
  async function handleFileUpload(file) {
    if (!file) return;
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      window.showToast('Please upload a valid JPG, PNG, or WEBP image.', 'error');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      window.showToast('Image file size must be under 8MB.', 'error');
      return;
    }

    window.showToast('Enhancing image lighting and clarity…', 'info');
    
    try {
      const result = await window.ArtNovaAPI.uploadImage(file);
      imageFiles.original = result.original;
      imageFiles.enhanced = result.enhanced;

      if (imgOriginal) imgOriginal.src = result.original;
      if (imgEnhanced) imgEnhanced.src = result.enhanced;

      selectEnhancementVersion('enhanced');
      goToStep(2);
      window.showToast('Enhancement complete!', 'success');
    } catch (e) {
      window.showToast('Error enhancing image: ' + e.message, 'error');
    }
  }

  function selectEnhancementVersion(version) {
    imageFiles.selected = version;
    if (cardOriginal && cardEnhanced) {
      if (version === 'enhanced') {
        cardEnhanced.classList.add('selected');
        cardOriginal.classList.remove('selected');
      } else {
        cardOriginal.classList.add('selected');
        cardEnhanced.classList.remove('selected');
      }
    }
  }

  // Step 1: Drag & Drop
  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length) {
        handleFileUpload(e.target.files[0]);
      }
    });

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('drag-active');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('drag-active');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('drag-active');
      if (e.dataTransfer.files.length) {
        handleFileUpload(e.dataTransfer.files[0]);
      }
    });
  }

  // Step 2: Version selection listeners
  if (cardOriginal) {
    cardOriginal.addEventListener('click', () => selectEnhancementVersion('original'));
  }
  if (cardEnhanced) {
    cardEnhanced.addEventListener('click', () => selectEnhancementVersion('enhanced'));
  }

  // Step 2 Back & Next buttons
  const btnStep2Back = document.getElementById('step-2-back');
  const btnStep2Next = document.getElementById('step-2-next');
  if (btnStep2Back) btnStep2Back.addEventListener('click', () => goToStep(1));
  if (btnStep2Next) btnStep2Next.addEventListener('click', () => goToStep(3));

  // Step 3: AI Generation
  if (btnGenAI) {
    btnGenAI.addEventListener('click', async () => {
      const name = inputName ? inputName.value.trim() : '';
      if (!name) {
        window.showToast('Please enter the product name first.', 'error');
        if (inputName) inputName.focus();
        return;
      }

      btnGenAI.disabled = true;
      btnGenAI.innerHTML = '<span>✨</span> Crafting story…';

      const details = {
        name,
        category: inputCategory ? inputCategory.value : 'Craft',
        material: inputMaterial ? inputMaterial.value : '',
        price: inputPrice ? inputPrice.value : ''
      };

      try {
        const desc = await window.ArtNovaAPI.generateDescription(details);
        if (textareaDesc) {
          textareaDesc.value = desc;
          textareaDesc.classList.add('ai-highlight');
          setTimeout(() => textareaDesc.classList.remove('ai-highlight'), 1000);
        }
        window.showToast('AI artisan description generated!', 'success');
      } catch (err) {
        window.showToast('Failed to generate description: ' + err.message, 'error');
      } finally {
        btnGenAI.disabled = false;
        btnGenAI.innerHTML = '<span>✨</span> Generate AI Description';
      }
    });
  }

  // Step 3 Back & Next
  const btnStep3Back = document.getElementById('step-3-back');
  const btnStep3Next = document.getElementById('step-3-next');

  if (btnStep3Back) btnStep3Back.addEventListener('click', () => goToStep(2));
  if (btnStep3Next) {
    btnStep3Next.addEventListener('click', () => {
      const name = inputName.value.trim();
      const price = inputPrice.value.trim();

      if (!name) {
        window.showToast('Please enter a product title.', 'error');
        inputName.focus();
        return;
      }

      if (!price || Number(price) <= 0) {
        window.showToast('Please enter a valid price.', 'error');
        inputPrice.focus();
        return;
      }

      productData.name = name;
      productData.category = inputCategory.value;
      productData.price = Number(price);
      productData.material = inputMaterial.value.trim();
      productData.description = textareaDesc.value.trim() || `Beautiful handmade ${name} crafted with care.`;

      goToStep(4);
    });
  }

  // Step 4: Render Final Preview
  function renderFinalPreview() {
    if (!finalPreviewCard) return;

    const chosenImage = imageFiles.selected === 'enhanced' ? imageFiles.enhanced : imageFiles.original;

    finalPreviewCard.innerHTML = `
      <div class="product-card" style="box-shadow: var(--shadow-md);">
        <div class="product-image-wrap">
          <img src="${chosenImage}" alt="${productData.name}" />
          <span class="product-category-tag">${productData.category}</span>
        </div>
        <div class="product-body">
          <h3 class="product-title" style="font-size: 1.2rem;">${productData.name}</h3>
          <p class="product-price" style="font-size: 1.4rem;">${window.formatCurrency(productData.price)}</p>
          ${productData.material ? `<p style="font-size: 0.8rem; color: var(--clay); font-weight: 500;">✦ Material: ${productData.material}</p>` : ''}
          <p class="product-desc" style="-webkit-line-clamp: 4; margin-top: 6px;">${productData.description}</p>
        </div>
      </div>
    `;
  }

  // Step 4 Edit & Publish
  const btnStep4Back = document.getElementById('step-4-back');
  if (btnStep4Back) btnStep4Back.addEventListener('click', () => goToStep(3));

  if (btnPublish) {
    btnPublish.addEventListener('click', async () => {
      btnPublish.disabled = true;
      btnPublish.textContent = 'Publishing to catalogue…';

      try {
        const chosenImage = imageFiles.selected === 'enhanced' ? imageFiles.enhanced : imageFiles.original;
        const toSave = {
          ...productData,
          image: chosenImage,
          original: imageFiles.original
        };

        await window.ArtNovaAPI.saveProduct(toSave);
        window.showToast('Product successfully published to your catalogue!', 'success');

        setTimeout(() => {
          window.location.href = 'products.html';
        }, 800);
      } catch (err) {
        window.showToast('Failed to publish: ' + err.message, 'error');
        btnPublish.disabled = false;
        btnPublish.textContent = 'Publish Product';
      }
    });
  }

  // Start at step 1
  goToStep(1);
});
