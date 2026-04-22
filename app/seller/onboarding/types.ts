export interface SellerFormData {
  // Step 1 - Personal
  full_name: string;
  email: string;
  phone: string;
  // Step 2 - Business
  business_name: string;
  business_type: string;
  business_category: string;
  store_description: string;
  // Step 3 - Address
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  // Step 4 - KYC
  gstin: string;
  pan_number: string;
  aadhaar_number: string;
  // Step 5 - Bank
  bank_account_name: string;
  bank_account_number: string;
  bank_account_confirm: string;
  bank_ifsc: string;
  bank_name: string;
  bank_branch: string;
  // Step 6 - Pickup
  pickup_address_same: boolean;
  pickup_address: string;
}

export const INITIAL_FORM: SellerFormData = {
  full_name: "", email: "", phone: "",
  business_name: "", business_type: "", business_category: "", store_description: "",
  address_line1: "", address_line2: "", city: "", state: "", pincode: "", country: "India",
  gstin: "", pan_number: "", aadhaar_number: "",
  bank_account_name: "", bank_account_number: "", bank_account_confirm: "",
  bank_ifsc: "", bank_name: "", bank_branch: "",
  pickup_address_same: true, pickup_address: "",
};

export const STEP_TITLES = [
  "Personal Details",
  "Business Information",
  "Business Address",
  "Tax & KYC",
  "Bank Account",
  "Pickup Address",
  "Review & Submit",
];

export const BUSINESS_TYPES = [
  { value: "individual", label: "Individual" },
  { value: "proprietorship", label: "Proprietorship" },
  { value: "partnership", label: "Partnership" },
  { value: "pvt_ltd", label: "Pvt Ltd" },
  { value: "llp", label: "LLP" },
  { value: "other", label: "Other" },
];

export const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa",
  "Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala",
  "Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland",
  "Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura",
  "Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu and Kashmir",
  "Ladakh","Chandigarh","Puducherry","Lakshadweep","Andaman and Nicobar Islands",
];

export function validateStep(step: number, form: SellerFormData): string[] {
  const errors: string[] = [];
  switch (step) {
    case 0:
      if (!form.full_name.trim()) errors.push("Full name is required");
      if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.push("Valid email is required");
      break;
    case 1:
      if (!form.business_name.trim()) errors.push("Business name is required");
      if (!form.business_type) errors.push("Business type is required");
      break;
    case 2:
      if (!form.address_line1.trim()) errors.push("Address line 1 is required");
      if (!form.city.trim()) errors.push("City is required");
      if (!form.state) errors.push("State is required");
      if (!form.pincode || !/^\d{6}$/.test(form.pincode)) errors.push("Valid 6-digit pincode is required");
      break;
    case 3:
      if (form.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gstin))
        errors.push("Invalid GSTIN format");
      if (form.pan_number && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.pan_number))
        errors.push("Invalid PAN format (e.g. ABCDE1234F)");
      if (form.aadhaar_number && !/^\d{12}$/.test(form.aadhaar_number))
        errors.push("Aadhaar must be 12 digits");
      break;
    case 4:
      if (!form.bank_account_name.trim()) errors.push("Account holder name is required");
      if (!form.bank_account_number || !/^\d{9,18}$/.test(form.bank_account_number))
        errors.push("Account number must be 9-18 digits");
      if (form.bank_account_number !== form.bank_account_confirm)
        errors.push("Account numbers do not match");
      if (!form.bank_ifsc || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.bank_ifsc))
        errors.push("Invalid IFSC code format");
      break;
    case 5:
      if (!form.pickup_address_same && !form.pickup_address.trim())
        errors.push("Pickup address is required");
      break;
  }
  return errors;
}
