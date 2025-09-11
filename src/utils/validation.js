// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation (at least 8 characters)
export const validatePassword = (password) => {
  return password.length >= 8;
};

// URL validation
export const validateURL = (url) => {
  try {
    // Add protocol if missing
    let testUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      testUrl = 'https://' + url;
    }
    new URL(testUrl);
    return true;
  } catch {
    return false;
  }
};

// Phone number validation (US format)
export const validatePhone = (phone) => {
  const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  return phoneRegex.test(phone);
};

// ZIP code validation
export const validateZipCode = (zip) => {
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(zip);
};

// Credit card validation (basic)
export const validateCardNumber = (cardNumber) => {
  const cleaned = cardNumber.replace(/\s/g, '');
  return cleaned.length >= 13 && cleaned.length <= 19 && /^\d+$/.test(cleaned);
};

// Expiry date validation (MM/YY)
export const validateExpiryDate = (expiry) => {
  const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
  if (!expiryRegex.test(expiry)) return false;
  
  const [month, year] = expiry.split('/');
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;
  
  const expYear = parseInt(year);
  const expMonth = parseInt(month);
  
  if (expYear < currentYear) return false;
  if (expYear === currentYear && expMonth < currentMonth) return false;
  
  return true;
};

// CVV validation
export const validateCVV = (cvv) => {
  return /^\d{3,4}$/.test(cvv);
};