import React from 'react';

const UPIPaymentHandler = {
  initiatePayment: (bill, user, showToast) => {
    try {
      // Get user's mess number for the note
      const messNo = user?.mess_no || 'MESS_PAYMENT';
      const amount = bill.amount;
      const billMonth = new Date(bill.month).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      });

      // Create UPI payment URL for Google Pay
      const upiUrl = `upi://pay?pa=your-upi-id@paytm&pn=Mess Management&am=${amount}&cu=INR&tn=Mess Bill ${billMonth} - ${messNo}`;

      // Try to open UPI app (Google Pay, PhonePe, etc.)
      if (window.Telegram?.WebApp) {
        // In Telegram, use openLink
        window.Telegram.WebApp.openLink(upiUrl);
      } else {
        // Fallback for web browsers
        window.location.href = upiUrl;
      }

      // Show instructions to user
      setTimeout(() => {
        showToast(
          `📱 UPI Payment Initiated!\n\nAmount: ₹${amount}\nFor: ${billMonth}\nMess No: ${messNo}\n\nAfter payment, please submit the transaction ID using "Other Payment Methods" button.`, 
          'info'
        );
      }, 1000);

    } catch (error) {
      console.error('UPI payment error:', error);
      showToast('Unable to open UPI app. Please use "Other Payment Methods" option.', 'error');
    }
  }
};

export default UPIPaymentHandler;
