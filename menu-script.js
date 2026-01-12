// Simple menu rendering script
document.addEventListener('DOMContentLoaded', function() {
  console.log('Menu script loaded');
  
  // Initialize cart
  let cart = [];
  
  // Function to update cart display
  function updateCart() {
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartTax = document.getElementById('cart-tax');
    const cartTotal = document.getElementById('cart-total');
    
    // Sticky elements
    const stickyCartCount = document.getElementById('sticky-cart-count');
    const stickyCartSubtotal = document.getElementById('sticky-cart-subtotal');
    const stickyCartTax = document.getElementById('sticky-cart-tax');
    const stickyCartTotal = document.getElementById('sticky-cart-total');
    const stickyOrderSummary = document.getElementById('order-summary-sticky');
    
    if (!cartItems || !cartCount || !cartSubtotal || !cartTax || !cartTotal) {
      console.error('Cart elements not found');
      return;
    }
    
    // Clear cart items
    cartItems.innerHTML = '';
    
    // Calculate totals
    let subtotal = 0;
    let itemCount = 0;
    
    cart.forEach((item, index) => {
      // Create cart item element
      const li = document.createElement('li');
      
      const itemInfo = document.createElement('div');
      itemInfo.innerHTML = `<strong>${item.name}</strong> x ${item.quantity} @ $${item.price.toFixed(2)}`;
      
      const itemTotal = document.createElement('div');
      itemTotal.textContent = `$${(item.price * item.quantity).toFixed(2)}`;
      
      const removeButton = document.createElement('button');
      removeButton.className = 'btn-remove-item';
      removeButton.setAttribute('data-index', index);
      removeButton.innerHTML = '<i class="fas fa-times"></i>';
      
      li.appendChild(itemInfo);
      li.appendChild(itemTotal);
      li.appendChild(removeButton);
      
      cartItems.appendChild(li);
      
      // Update totals
      subtotal += item.price * item.quantity;
      itemCount += item.quantity;
    });
    
    // Calculate tax and total
    const taxRate = 0.075; // 7.5%
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    
    // Update display
    cartCount.textContent = itemCount;
    cartSubtotal.textContent = subtotal.toFixed(2);
    cartTax.textContent = tax.toFixed(2);
    cartTotal.textContent = total.toFixed(2);
    
    // Update sticky display if elements exist
    if (stickyCartCount) stickyCartCount.textContent = itemCount;
    if (stickyCartSubtotal) stickyCartSubtotal.textContent = subtotal.toFixed(2);
    if (stickyCartTax) stickyCartTax.textContent = tax.toFixed(2);
    if (stickyCartTotal) stickyCartTotal.textContent = total.toFixed(2);
    
    // Show/hide sticky order summary
    if (stickyOrderSummary) {
      if (itemCount > 0) {
        stickyOrderSummary.style.transform = 'translateY(0)';
        stickyOrderSummary.style.boxShadow = '0 -4px 10px rgba(0,0,0,0.2)';
      } else {
        stickyOrderSummary.style.transform = 'translateY(100%)';
      }
    }
  }
  
  // Get menu data from menu-data.js
  const menuData = window.menuData || [];
  console.log('Menu data:', menuData);
  
  // Function to render menu
  function renderMenu(filterCategory = 'all') {
    const menuContainer = document.getElementById('menu-container');
    if (!menuContainer) {
      console.error('Menu container not found');
      return;
    }
    
    // Clear existing content
    menuContainer.innerHTML = '';
    
    // Filter menu data based on category
    const filteredData = filterCategory === 'all' 
      ? menuData 
      : menuData.filter(category => category.category === filterCategory);
    
    // Render each category
    filteredData.forEach(category => {
      const categorySection = document.createElement('div');
      categorySection.className = 'menu-category';
      
      const categoryHeader = document.createElement('h3');
      categoryHeader.textContent = category.category;
      categorySection.appendChild(categoryHeader);
      
      const itemsContainer = document.createElement('div');
      itemsContainer.className = 'menu-items';
      
      // Render each item in the category
      category.items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'menu-item';
        
        const itemName = document.createElement('span');
        itemName.className = 'item-name';
        itemName.textContent = item.name;
        
        const itemPrice = document.createElement('span');
        itemPrice.className = 'item-price';
        itemPrice.textContent = `$${item.price.toFixed(2)}`;
        
        const addButton = document.createElement('button');
        addButton.className = 'btn btn-sm btn-add-to-cart';
        addButton.setAttribute('data-name', item.name);
        addButton.setAttribute('data-price', item.price);
        
        // Create ripple effect element
        const rippleElement = document.createElement('span');
        rippleElement.className = 'btn-feedback';
        
        // Create button content
        const buttonContent = document.createElement('span');
        buttonContent.innerHTML = '<i class="fas fa-plus"></i> Add';
        
        addButton.appendChild(rippleElement);
        addButton.appendChild(buttonContent);
        
        itemElement.appendChild(itemName);
        itemElement.appendChild(itemPrice);
        itemElement.appendChild(addButton);
        
        itemsContainer.appendChild(itemElement);
      });
      
      categorySection.appendChild(itemsContainer);
      menuContainer.appendChild(categorySection);
    });
  }
  
  // Set up category filter
  const categoryFilter = document.getElementById('category-filter');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', function() {
      renderMenu(this.value);
    });
  }
  
  // Set up search functionality
  const searchInput = document.getElementById('menu-search');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase();
      
      // If search term is empty, just render the menu normally
      if (!searchTerm) {
        renderMenu(categoryFilter ? categoryFilter.value : 'all');
        return;
      }
      
      // Filter menu items based on search term
      const menuContainer = document.getElementById('menu-container');
      if (!menuContainer) return;
      
      menuContainer.innerHTML = '';
      
      // Create search results section
      const searchResults = document.createElement('div');
      searchResults.className = 'menu-category';
      
      const searchHeader = document.createElement('h3');
      searchHeader.textContent = 'Search Results';
      searchResults.appendChild(searchHeader);
      
      const resultsContainer = document.createElement('div');
      resultsContainer.className = 'menu-items';
      
      // Search through all items
      let resultsFound = false;
      
      menuData.forEach(category => {
        category.items.forEach(item => {
          if (item.name.toLowerCase().includes(searchTerm)) {
            resultsFound = true;
            
            const itemElement = document.createElement('div');
            itemElement.className = 'menu-item';
            
            const itemName = document.createElement('span');
            itemName.className = 'item-name';
            itemName.textContent = `${item.name} (${category.category})`;
            
            const itemPrice = document.createElement('span');
            itemPrice.className = 'item-price';
            itemPrice.textContent = `$${item.price.toFixed(2)}`;
            
            const addButton = document.createElement('button');
            addButton.className = 'btn btn-sm btn-add-to-cart';
            addButton.setAttribute('data-name', item.name);
            addButton.setAttribute('data-price', item.price);
            addButton.innerHTML = '<i class="fas fa-plus"></i> Add';
            
            itemElement.appendChild(itemName);
            itemElement.appendChild(itemPrice);
            itemElement.appendChild(addButton);
            
            resultsContainer.appendChild(itemElement);
          }
        });
      });
      
      if (!resultsFound) {
        const noResults = document.createElement('p');
        noResults.textContent = 'No items found matching your search.';
        resultsContainer.appendChild(noResults);
      }
      
      searchResults.appendChild(resultsContainer);
      menuContainer.appendChild(searchResults);
    });
  }
  
  // Initial render
  setTimeout(() => {
    console.log('Initial menu render');
    renderMenu();
    
    // Set up sticky order summary buttons
    const stickyCheckoutBtn = document.getElementById('sticky-checkout-btn');
    const stickyViewCartBtn = document.getElementById('sticky-view-cart-btn');
    
    if (stickyCheckoutBtn) {
      stickyCheckoutBtn.addEventListener('click', function() {
        if (cart.length === 0) {
          alert('Your cart is empty!');
          return;
        }
        
        // Use the same checkout logic as the main checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
          checkoutBtn.click();
        }
      });
    }
    
    if (stickyViewCartBtn) {
      stickyViewCartBtn.addEventListener('click', function() {
        // Scroll to the cart section
        const cartSection = document.querySelector('.menu-section');
        if (cartSection) {
          cartSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  }, 100);
  
  // Set up event listeners for cart functionality
  document.addEventListener('click', function(e) {
    // Add to cart button
    if (e.target.classList.contains('btn-add-to-cart') || e.target.parentElement.classList.contains('btn-add-to-cart') || e.target.parentElement.parentElement.classList.contains('btn-add-to-cart')) {
      // Find the actual button element
      let button;
      if (e.target.classList.contains('btn-add-to-cart')) {
        button = e.target;
      } else if (e.target.parentElement.classList.contains('btn-add-to-cart')) {
        button = e.target.parentElement;
      } else {
        button = e.target.parentElement.parentElement;
      }
      
      const name = button.getAttribute('data-name');
      const price = parseFloat(button.getAttribute('data-price'));
      
      // Add visual feedback
      button.classList.add('clicked');
      button.classList.add('added');
      
      // Change button text temporarily
      const buttonContent = button.querySelector('span:not(.btn-feedback)');
      const originalHTML = buttonContent.innerHTML;
      buttonContent.innerHTML = '<i class="fas fa-check"></i> Added';
      
      // Reset button after animation
      setTimeout(() => {
        button.classList.remove('clicked');
        setTimeout(() => {
          buttonContent.innerHTML = originalHTML;
          button.classList.remove('added');
        }, 1000);
      }, 600);
      
      // Add to cart
      const existingItem = cart.find(item => item.name === name);
      if (existingItem) {
        existingItem.quantity++;
      } else {
        cart.push({ name, price, quantity: 1 });
      }
      
      // Update cart display
      updateCart();
      
      // Scroll to order summary if not visible
      const orderSection = document.querySelector('.menu-section');
      const rect = orderSection.getBoundingClientRect();
      const isVisible = (
        rect.top >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
      );
      
      if (!isVisible) {
        // Add a floating notification
        const notification = document.createElement('div');
        notification.className = 'floating-notification';
        notification.innerHTML = `
          <div class="notification-content">
            <i class="fas fa-shopping-cart"></i>
            <span>${name} added to cart</span>
          </div>
        `;
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
          notification.classList.add('show');
          setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
              document.body.removeChild(notification);
            }, 300);
          }, 2000);
        }, 10);
      }
    }
    
    // Remove from cart button
    if (e.target.classList.contains('btn-remove-item') || e.target.parentElement.classList.contains('btn-remove-item')) {
      const button = e.target.classList.contains('btn-remove-item') ? e.target : e.target.parentElement;
      const index = parseInt(button.getAttribute('data-index'));
      
      // Remove from cart
      cart.splice(index, 1);
      
      // Update cart display
      updateCart();
    }
  });
  
  // Set up clear cart button
  const clearCartBtn = document.getElementById('clear-cart-btn');
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', function() {
      if (cart.length === 0) return;
      
      if (confirm('Are you sure you want to clear your cart?')) {
        cart = [];
        updateCart();
      }
    });
  }
  
  // Modal functionality
  const modal = document.getElementById('checkout-modal');
  const confirmationModal = document.getElementById('confirmation-modal');
  const closeModalBtn = document.getElementById('close-modal');
  const cancelOrderBtn = document.getElementById('cancel-order');
  const submitOrderBtn = document.getElementById('submit-order');
  const onlineOrderForm = document.getElementById('online-order-form');
  const pickupTimeSelect = document.getElementById('pickup-time');
  const customTimeContainer = document.getElementById('custom-time-container');
  const customPickupTime = document.getElementById('custom-pickup-time');
  const closeConfirmationBtn = document.getElementById('close-confirmation-btn');
  const closeConfirmationXBtn = document.getElementById('close-confirmation');
  
  // Function to open checkout modal
  function openModal() {
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
  }
  
  // Function to close checkout modal
  function closeModal() {
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = ''; // Restore scrolling
    }
  }
  
  // Function to open confirmation modal
  function openConfirmationModal() {
    if (confirmationModal) {
      confirmationModal.style.display = 'flex';
      document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
  }
  
  // Function to close confirmation modal
  function closeConfirmationModal() {
    if (confirmationModal) {
      confirmationModal.style.display = 'none';
      document.body.style.overflow = ''; // Restore scrolling
      
      // Clear the cart after successful order
      cart = [];
      updateCart();
    }
  }
  
  // Set up modal event listeners
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
  }
  
  if (cancelOrderBtn) {
    cancelOrderBtn.addEventListener('click', closeModal);
  }
  
  // Handle custom pickup time
  if (pickupTimeSelect) {
    pickupTimeSelect.addEventListener('change', function() {
      if (this.value === 'custom') {
        customTimeContainer.style.display = 'block';
        customPickupTime.required = true;
      } else {
        customTimeContainer.style.display = 'none';
        customPickupTime.required = false;
      }
    });
  }

  // Handle payment method toggle
  const paymentOnline = document.getElementById('payment-online');
  const paymentInstore = document.getElementById('payment-instore');
  const paymentInfoOnline = document.getElementById('payment-info-online');
  const paymentInfoInstore = document.getElementById('payment-info-instore');
  const submitOrderBtnRef = document.getElementById('submit-order');

  function updatePaymentMethodUI() {
    const isOnline = paymentOnline && paymentOnline.checked;

    // Update info boxes
    if (paymentInfoOnline) paymentInfoOnline.style.display = isOnline ? 'block' : 'none';
    if (paymentInfoInstore) paymentInfoInstore.style.display = isOnline ? 'none' : 'block';

    // Update button text and style
    if (submitOrderBtnRef) {
      if (isOnline) {
        submitOrderBtnRef.innerHTML = '<i class="fas fa-credit-card"></i> Pay & Place Order';
        submitOrderBtnRef.style.background = 'linear-gradient(135deg, #7A9B76 0%, #96B591 100%)';
      } else {
        submitOrderBtnRef.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Order';
        submitOrderBtnRef.style.background = 'linear-gradient(135deg, #C46036 0%, #E07B4F 100%)';
      }
    }

    // Update radio button styling
    if (paymentOnline && paymentOnline.parentElement) {
      paymentOnline.parentElement.style.borderColor = isOnline ? '#7A9B76' : '#ddd';
      paymentOnline.parentElement.style.backgroundColor = isOnline ? '#f0f7ef' : '#fff';
    }
    if (paymentInstore && paymentInstore.parentElement) {
      paymentInstore.parentElement.style.borderColor = isOnline ? '#ddd' : '#C46036';
      paymentInstore.parentElement.style.backgroundColor = isOnline ? '#fff' : '#FFF8F0';
    }
  }

  if (paymentOnline) {
    paymentOnline.addEventListener('change', updatePaymentMethodUI);
  }
  if (paymentInstore) {
    paymentInstore.addEventListener('change', updatePaymentMethodUI);
  }

  // Handle confirmation modal close
  if (closeConfirmationBtn) {
    closeConfirmationBtn.addEventListener('click', closeConfirmationModal);
  }
  
  if (closeConfirmationXBtn) {
    closeConfirmationXBtn.addEventListener('click', closeConfirmationModal);
  }
  
  // Close modal when clicking outside the modal content
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeModal();
      }
    });
  }
  
  // Close confirmation modal when clicking outside
  if (confirmationModal) {
    confirmationModal.addEventListener('click', function(e) {
      if (e.target === confirmationModal) {
        closeConfirmationModal();
      }
    });
  }
  
  // Close modals with Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      if (modal && modal.classList.contains('active')) {
        closeModal();
      }
      if (confirmationModal && confirmationModal.style.display === 'flex') {
        closeConfirmationModal();
      }
    }
  });
  
  // Set up checkout button
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function() {
      if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
      }
      
      // Calculate totals
      let subtotal = 0;
      const orderItemsContainer = document.getElementById('modal-order-items');
      
      // Clear previous items
      if (orderItemsContainer) {
        orderItemsContainer.innerHTML = '';
        
        // Add each item to the modal
        cart.forEach(item => {
          const itemTotal = item.price * item.quantity;
          subtotal += itemTotal;
          
          const orderItem = document.createElement('div');
          orderItem.className = 'order-item';
          orderItem.innerHTML = `
            <span>${item.name} x ${item.quantity}</span>
            <span>$${itemTotal.toFixed(2)}</span>
          `;
          
          orderItemsContainer.appendChild(orderItem);
        });
      }
      
      // Calculate tax and total
      const taxRate = 0.075; // 7.5% for Geneva
      const tax = subtotal * taxRate;
      const total = subtotal + tax;
      
      // Update modal with totals
      document.getElementById('modal-subtotal').textContent = `$${subtotal.toFixed(2)}`;
      document.getElementById('modal-tax').textContent = `$${tax.toFixed(2)}`;
      document.getElementById('modal-total').textContent = `$${total.toFixed(2)}`;
      
      // Open the modal
      openModal();
    });
  }
  
  // Handle order submission with Email
  if (submitOrderBtn) {
    submitOrderBtn.addEventListener('click', async function(e) {
      e.preventDefault();

      // Validate form - with null checks
      const customerNameEl = document.getElementById('customer-name');
      const customerPhoneEl = document.getElementById('customer-phone');
      const customerEmailEl = document.getElementById('customer-email');
      const pickupTimeEl = document.getElementById('pickup-time');
      const orderNotesEl = document.getElementById('order-notes');

      if (!customerNameEl || !customerPhoneEl || !customerEmailEl || !pickupTimeEl || !orderNotesEl) {
        alert('Form error: Please refresh the page and try again.');
        console.error('Missing form elements:', {
          customerName: !!customerNameEl,
          customerPhone: !!customerPhoneEl,
          customerEmail: !!customerEmailEl,
          pickupTime: !!pickupTimeEl,
          orderNotes: !!orderNotesEl
        });
        return;
      }

      const customerName = customerNameEl.value.trim();
      const customerPhone = customerPhoneEl.value.trim();
      const customerEmail = customerEmailEl.value.trim();
      const pickupTime = pickupTimeEl.value;
      const orderNotes = orderNotesEl.value.trim();

      // Basic validation
      if (!customerName) {
        alert('Please enter your name');
        return;
      }

      if (!customerPhone) {
        alert('Please enter your phone number');
        return;
      }

      if (!customerEmail) {
        alert('Please enter your email address');
        return;
      }

      if (!pickupTime) {
        alert('Please select a pickup time');
        return;
      }

      if (pickupTime === 'custom' && !document.getElementById('custom-pickup-time').value) {
        alert('Please specify a pickup time');
        return;
      }

      if (cart.length === 0) {
        alert('Your cart is empty');
        return;
      }

      // Check which payment method is selected
      const paymentMethodEl = document.querySelector('input[name="payment-method"]:checked');
      const paymentMethod = paymentMethodEl ? paymentMethodEl.value : 'online';
      const isPayingOnline = paymentMethod === 'online';

      // Disable submit button to prevent double submission
      submitOrderBtn.disabled = true;
      submitOrderBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

      try {
        // Get formatted pickup time
        let formattedPickupTime;
        if (pickupTime === 'asap') {
          formattedPickupTime = 'As soon as possible (20-30 min)';
        } else if (pickupTime === 'custom') {
          formattedPickupTime = document.getElementById('custom-pickup-time').value;
        } else {
          const timeMap = {
            '30min': 'In 30 minutes',
            '45min': 'In 45 minutes',
            '60min': 'In 1 hour'
          };
          formattedPickupTime = timeMap[pickupTime] || pickupTime;
        }

        if (isPayingOnline) {
          // ===== PAY ONLINE: Redirect to Stripe Checkout =====
          console.log('💳 Processing online payment via Stripe...');

          // Build items array for Stripe (price in cents)
          const items = cart.map(item => ({
            name: item.name,
            price: Math.round(item.price * 100),
            quantity: item.quantity
          }));

          // Build customer object
          const customer = {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            pickup_time: formattedPickupTime,
            order_notes: orderNotes || ''
          };

          // Get API base URL from config
          const apiBaseUrl = window.APP_CONFIG?.API_BASE_URL || '';
          console.log('🔄 Creating Stripe checkout session...');
          console.log('📦 API URL:', `${apiBaseUrl}/api/create-checkout-session`);

          // Call create-checkout-session API
          const response = await fetch(`${apiBaseUrl}/api/create-checkout-session`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ items, customer })
          });

          const responseText = await response.text();
          let result;
          try {
            result = JSON.parse(responseText);
          } catch (parseError) {
            console.error('❌ Failed to parse response:', parseError);
            throw new Error('Invalid response from server');
          }

          if (!response.ok) {
            throw new Error(result.error || `HTTP ${response.status}: Failed to create checkout session`);
          }

          if (!result.url) {
            throw new Error('No checkout URL received from server');
          }

          // Save cart to localStorage before redirect (for cancel recovery)
          localStorage.setItem('sistersCafeCart', JSON.stringify(cart));

          // Redirect to Stripe Checkout
          console.log('🚀 Redirecting to Stripe Checkout...');
          window.location.href = result.url;

        } else {
          // ===== PAY AT PICKUP: Send email notification via EmailJS =====
          console.log('🏪 Processing pay-at-pickup order via EmailJS...');

          // Calculate totals
          let subtotal = 0;
          cart.forEach(item => {
            subtotal += item.price * item.quantity;
          });
          const tax = subtotal * 0.075;
          const total = subtotal + tax;

          // Format order items for email
          const orderItemsHTML = cart.map(item =>
            `<li style="margin-bottom: 8px; padding: 8px; background-color: #f9f9f9; border-radius: 4px;">
              <strong>${item.name}</strong> x ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}
            </li>`
          ).join('');

          const orderItemsText = cart.map(item =>
            `${item.name} x ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}`
          ).join('\n');

          // Generate order number
          const orderNumber = 'SC' + Date.now().toString().slice(-8);

          // Prepare email content using EmailJS
          const emailParams = {
            to_email: 'sisterscafe28@gmail.com',
            from_name: customerName,
            customer_name: customerName,
            customer_phone: customerPhone,
            customer_email: customerEmail,
            pickup_time: formattedPickupTime,
            order_notes: orderNotes || 'None',
            order_number: orderNumber,
            invoice_number: 'INV-' + orderNumber,
            order_items_html: orderItemsHTML,
            order_items_text: orderItemsText,
            subtotal: subtotal.toFixed(2),
            tax: tax.toFixed(2),
            tax_label: 'Tax (7.5%)',
            total: total.toFixed(2),
            order_date: new Date().toLocaleString(),
            delivery_address: 'Pickup at Sisters Cafe',
            payment_status: '💵 PAY AT PICKUP',
            fees_label: 'Fees',
            fees: '0.00',
            tip: '0.00',
            discount_label: 'Discount',
            discount: '0.00'
          };

          // Send emails using EmailJS
          const SERVICE_ID = 'service_4x3qqp1';
          const CAFE_TEMPLATE_ID = 'template_u05esja';
          const CUSTOMER_TEMPLATE_ID = 'template_9uaylhv';

          if (typeof emailjs !== 'undefined') {
            console.log('📤 Sending order notifications...');

            // Email 1: Send order notification to Sisters Cafe
            await emailjs.send(SERVICE_ID, CAFE_TEMPLATE_ID, emailParams);
            console.log('✅ Order notification sent to Sisters Cafe!');

            // Email 2: Send confirmation to customer
            const customerParams = { ...emailParams, to_email: customerEmail };
            await emailjs.send(SERVICE_ID, CUSTOMER_TEMPLATE_ID, customerParams);
            console.log('✅ Confirmation sent to customer!');
          } else {
            console.log('📧 EmailJS not loaded. Order details:', emailParams);
          }

          // Close checkout modal
          closeModal();

          // Show confirmation modal
          const orderNumberEl = document.getElementById('order-number');
          const confNameEl = document.getElementById('conf-name');
          const confTimeEl = document.getElementById('conf-time');
          const confTotalEl = document.getElementById('conf-total');

          if (orderNumberEl) orderNumberEl.textContent = orderNumber;
          if (confNameEl) confNameEl.textContent = customerName;
          if (confTimeEl) confTimeEl.textContent = formattedPickupTime;
          if (confTotalEl) confTotalEl.textContent = '$' + total.toFixed(2) + ' (Pay at pickup)';

          openConfirmationModal();

          // Clear the cart
          cart = [];
          updateCart();

          // Reset form
          document.getElementById('online-order-form').reset();
        }

      } catch (error) {
        console.error('Order error:', error);
        alert('Sorry, there was an error processing your order. Please try again or call us at (402) 759-4144.');

        // Re-enable submit button
        submitOrderBtn.disabled = false;
        const isOnline = document.getElementById('payment-online')?.checked;
        if (isOnline) {
          submitOrderBtn.innerHTML = '<i class="fas fa-credit-card"></i> Pay & Place Order';
        } else {
          submitOrderBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Order';
        }
      }
    });
  }
  
  // Set up order calculator
  const calculateBtn = document.getElementById('calculate-btn');
  const useCartTotalBtn = document.getElementById('use-cart-total-btn');
  
  // Function to update calculator results
  function updateCalculatorResults(subtotal, peopleCount, tipPercentage) {
    const tax = subtotal * 0.075; // 7.5% tax
    const tip = subtotal * (tipPercentage / 100);
    const total = subtotal + tax + tip;
    const perPerson = total / peopleCount;
    
    document.getElementById('calc-subtotal').textContent = subtotal.toFixed(2);
    document.getElementById('calc-tax').textContent = tax.toFixed(2);
    document.getElementById('calc-tip').textContent = tip.toFixed(2);
    document.getElementById('calc-total').textContent = total.toFixed(2);
    document.getElementById('calc-per-person').textContent = perPerson.toFixed(2);
  }
  
  // Calculate button event listener
  if (calculateBtn) {
    calculateBtn.addEventListener('click', function() {
      const peopleCount = parseFloat(document.getElementById('people-count').value) || 1;
      const avgMealCost = parseFloat(document.getElementById('avg-meal-cost').value) || 10;
      const tipPercentage = parseFloat(document.getElementById('tip-percentage').value) || 15;
      
      const subtotal = peopleCount * avgMealCost;
      updateCalculatorResults(subtotal, peopleCount, tipPercentage);
      
      // Scroll to results if not visible
      const calculatorResult = document.getElementById('calculation-result');
      calculatorResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }
  
  // Use Cart Total button event listener
  if (useCartTotalBtn) {
    useCartTotalBtn.addEventListener('click', function() {
      // Calculate current cart subtotal
      let subtotal = 0;
      cart.forEach(item => {
        subtotal += item.price * item.quantity;
      });
      
      if (subtotal === 0) {
        alert('Your cart is empty! Add some items first.');
        return;
      }
      
      // Update the average meal cost input with the cart subtotal
      const peopleCount = parseFloat(document.getElementById('people-count').value) || 1;
      const tipPercentage = parseFloat(document.getElementById('tip-percentage').value) || 15;
      
      // Update the average meal cost field with the cart subtotal divided by people
      document.getElementById('avg-meal-cost').value = (subtotal / peopleCount).toFixed(2);
      
      // Update calculator results
      updateCalculatorResults(subtotal, peopleCount, tipPercentage);
      
      // Scroll to results if not visible
      const calculatorResult = document.getElementById('calculation-result');
      calculatorResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }
  
  // Add a link to the calculator in the sticky footer
  const stickyCalculateBtn = document.createElement('button');
  stickyCalculateBtn.className = 'btn';
  stickyCalculateBtn.style.backgroundColor = '#8b2c00';
  stickyCalculateBtn.style.color = 'white';
  stickyCalculateBtn.innerHTML = '<i class="fas fa-calculator"></i> Calculator';
  
  stickyCalculateBtn.addEventListener('click', function() {
    const calculatorSection = document.querySelector('.calculator-section');
    if (calculatorSection) {
      calculatorSection.scrollIntoView({ behavior: 'smooth' });
    }
  });
  
  // Add the calculator button to the sticky footer
  const orderSummaryActions = document.querySelector('.order-summary-actions');
  if (orderSummaryActions) {
    orderSummaryActions.appendChild(stickyCalculateBtn);
  }
});