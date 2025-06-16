    // Configuration - REPLACE WITH ACTUAL STRIPE PAYMENT LINKS
    const PAYMENT_LINKS = {
        'london': '..',
        'athens': '..', 
        'paris': '..',
        'cyclades': '..'
    };

    // Basket functionality
    let basket = [];
    let basketTotal = 0;



    function removeFromBasket(id) {
      basket = basket.filter(item => item.id !== id);
      updateBasketDisplay(); 
  }
  function saveBasket() {
    try {
        localStorage.setItem('bario_basket', JSON.stringify(basket));
    } catch (e) {
        // Fallback if localStorage is not available
        console.warn('Could not save basket to localStorage');
    }
}

// Load basket from localStorage
function loadBasket() {
    try {
        const savedBasket = localStorage.getItem('bario_basket');
        if (savedBasket) {
            basket = JSON.parse(savedBasket);
        }
    } catch (e) {
        // If there's an error, start with empty basket
        basket = [];
        console.warn('Could not load basket from localStorage');
    }
}
    function updateBasketDisplay() {
      const basketCount = document.getElementById('basketCount');
      const basketItems = document.getElementById('basketItems');
      const basketFooter = document.getElementById('basketFooter');
      const basketTotalEl = document.getElementById('basketTotal');
  
      // Update count
      basketCount.textContent = basket.length;
  
      // Update total
      basketTotal = basket.reduce((sum, item) => sum + item.price, 0);
      basketTotalEl.textContent = `£${basketTotal.toFixed(2)}`;
  
      // Update button states for all items
      updateAllButtonStates();
  
      // Update items display
      if (basket.length === 0) {
          basketItems.innerHTML = `
              <div class="empty-basket">
                  <i class="fas fa-shopping-basket" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
                  <p>Your basket is empty</p>
                  <p style="font-size: 0.9rem; margin-top: 0.5rem;">Add some guides to get started!</p>
              </div>
          `;
          basketFooter.style.display = 'none';
      } else {
          basketItems.innerHTML = basket.map(item => `
              <div class="basket-item">
                  <div class="basket-item-info">
                      <div class="basket-item-title">${item.title}</div>
                      <div class="basket-item-price">£${item.price.toFixed(2)}</div>
                  </div>
                  <div style="display: flex; gap: 0.5rem; align-items: center;">
                      <button class="buy-now-btn" onclick="buyIndividualItem('${item.id}')" style="width: auto; padding: 0.5rem 1rem; font-size: 0.8rem; margin: 0;">
                          Buy
                      </button>
                      <button class="remove-item" onclick="removeFromBasket('${item.id}')">
                          <i class="fas fa-trash"></i>
                      </button>
                  </div>
              </div>
          `).join('');
          basketFooter.style.display = 'block';
      }
      
      // Save basket after updating display
      saveBasket();
  }
  function updateAllButtonStates() {
    // Get all add to basket buttons
    const addToBasketButtons = document.querySelectorAll('.add-to-basket-btn');
    
    addToBasketButtons.forEach(button => {
        // Get the guide ID from the onclick attribute
        const onclickAttr = button.getAttribute('onclick');
        const match = onclickAttr.match(/addToBasket\('([^']*)',/);
        
        if (match) {
            const guideId = match[1];
            const isInBasket = basket.some(item => item.id === guideId);
            
            // More robust check for original disabled state
            const originalDisabledAttr = button.getAttribute('data-original-disabled');
            const wasOriginallyDisabled = originalDisabledAttr === 'true' || originalDisabledAttr === true;
            
            // Debug logging - remove this after testing
            console.log(`Button ${guideId}: originalDisabledAttr=${originalDisabledAttr}, wasOriginallyDisabled=${wasOriginallyDisabled}, isInBasket=${isInBasket}`);
            
            if (isInBasket) {
                button.innerHTML = '✓ Added to Basket';
                button.disabled = true;
            } else {
                // Only enable if it wasn't originally disabled
                if (wasOriginallyDisabled) {
                    button.disabled = true;  // Keep disabled if it was originally disabled
                } else {
                    button.disabled = false; // Enable if it was originally enabled
                    button.innerHTML = '<i class="fas fa-plus"></i> Add to Basket';
                }
            }
        }
    });
}


    function toggleBasket() {
        const sidebar = document.getElementById('basketSidebar');
        const overlay = document.querySelector('.basket-overlay');
        
        sidebar.classList.toggle('open');
        overlay.classList.toggle('open');
    }

    function showMessage(message) {
        const messageEl = document.getElementById('successMessage');
        messageEl.textContent = message;
        messageEl.classList.add('show');
        
        setTimeout(() => {
            messageEl.classList.remove('show');
        }, 3000);
    }
// Close basket when clicking outside
document.addEventListener('click', function(event) {
    const basket = document.getElementById('basketSidebar');
    const basketIcon = document.querySelector('.basket-icon');
    const overlay = document.querySelector('.basket-overlay');
    
    // Add error checking
    if (!basket || !basketIcon) {
        return; // Elements don't exist yet
    }
    
    // If basket is open and click is outside basket and not on basket icon
    if (basket.classList.contains('open') && 
        !basket.contains(event.target) && 
        !basketIcon.contains(event.target)) {
        toggleBasket();
    }
});

// Prevent basket from closing when clicking inside it
// document.addEventListener('DOMContentLoaded', function() {
//     const basketSidebar = document.getElementById('basketSidebar');
//     if (basketSidebar) {
//         basketSidebar.addEventListener('click', function(event) {
//             event.stopPropagation();
//         });
//     }
// });
  
// Initialize basket on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, starting initialization...');
    
    // FIRST: Save original button states BEFORE loading basket or doing anything
    const addToBasketButtons = document.querySelectorAll('.add-to-basket-btn');
    console.log(`Found ${addToBasketButtons.length} add-to-basket buttons`);
    
    if (addToBasketButtons.length === 0) {
        console.warn('No .add-to-basket-btn buttons found! Check your HTML.');
        return;
    }
    
    addToBasketButtons.forEach((button, index) => {
        // Save the truly original disabled state from HTML as string
        const originalDisabled = button.disabled;
        button.setAttribute('data-original-disabled', originalDisabled.toString());
        
        // Debug logging - remove this after testing
        console.log(`Button ${index}: disabled=${originalDisabled}, saved as="${originalDisabled.toString()}", onclick="${button.getAttribute('onclick')}"`);
    });
    
    // THEN load saved basket
    loadBasket();
    console.log('Loaded basket:', basket);
    
    // THEN update display (this will respect the saved original states)
    updateBasketDisplay();
    
    // Add smooth scrolling for any anchor links - with error checking
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    console.log('Initialization complete');
});

function setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    } else {
        // Don't manually change button state here - let updateBasketDisplay handle it
        // updateBasketDisplay() will be called after adding to basket and will set correct state
    }
}


  // Enhanced add to basket with visual feedback
function addToBasket(id, title, price) {
    // Check if item already exists
    const existingItem = basket.find(item => item.id === id);
    if (existingItem) {
        showMessage('This guide is already in your basket!', 'warning');
        return;
    }

    // Find the button that was clicked
    const button = document.querySelector(`.add-to-basket-btn[onclick*="addToBasket('${id}',"]`);
    
    if (button) {
        // Visual feedback
        setButtonLoading(button, true);
        
        setTimeout(() => {
            // Add to basket
            basket.push({ id, title, price });
            updateBasketDisplay(); // This will save and update button states
            showMessage('Guide added to basket!', 'success');
            setButtonLoading(button, false);
        }, 500);
    } else {
        // Fallback if button not found
        basket.push({ id, title, price });
        updateBasketDisplay();
        showMessage('Guide added to basket!', 'success');
    }
}
  // Enhanced message function with types
  function showMessage(message, type = 'success') {
      const messageEl = document.getElementById('successMessage');
      messageEl.textContent = message;
      
      // Change color based on type
      if (type === 'warning') {
          messageEl.style.background = 'var(--gold-dark)';
      } else if (type === 'error') {
          messageEl.style.background = '#e74c3c';
      } else {
          messageEl.style.background = 'var(--light-green)';
      }
      
      messageEl.classList.add('show');
      
      setTimeout(() => {
          messageEl.classList.remove('show');
      }, 3000);
  }



  // Handle keyboard navigation
  document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape') {
          const basket = document.getElementById('basketSidebar');
          if (basket.classList.contains('open')) {
              toggleBasket();
          }
      }
  });

  // Add to basket with Enter key support
  document.addEventListener('keydown', function(event) {
      if (event.key === 'Enter' && event.target.classList.contains('add-to-basket-btn')) {
          event.target.click();
      }
  });

  // Prevent double-clicks on payment buttons
  let isProcessingPayment = false;

  function handlePaymentClick(callback) {
      if (isProcessingPayment) {
          showMessage('Please wait, processing your request...', 'warning');
          return;
      }
      
      isProcessingPayment = true;
      callback();
      
      // Reset after 2 seconds
      setTimeout(() => {
          isProcessingPayment = false;
      }, 2000);
  }

  // Update buy buttons to prevent double clicks
  document.querySelectorAll('.buy-now-btn').forEach(button => {
      button.addEventListener('click', function(e) {
          e.preventDefault();
          const href = this.getAttribute('href');
          
          handlePaymentClick(() => {
              if (validatePaymentLink(href)) {
                  window.open(href, '_blank', 'noopener,noreferrer');
              } else {
                  showMessage('Payment link not available. Please try again.', 'error');
              }
          });
      });
  });


// Track basket interactions - ADD SAFETY CHECKS
const originalAddToBasket = addToBasket;
addToBasket = function(id, title, price) {
    // Only track if trackEvent function exists
    if (typeof trackEvent === 'function') {
        trackEvent('add_to_basket', { item_id: id, item_name: title, price: price });
    }
    return originalAddToBasket.call(this, id, title, price);
};

const originalRemoveFromBasket = removeFromBasket;
removeFromBasket = function(id) {
    // Only track if trackEvent function exists
    if (typeof trackEvent === 'function') {
        trackEvent('remove_from_basket', { item_id: id });
    }
    return originalRemoveFromBasket.call(this, id);
};



