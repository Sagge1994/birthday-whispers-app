import { Contact } from '@/hooks/useContacts';

/**
 * Get the appropriate message for a contact based on the year
 * Priority: yearly_messages[year] > custom_message > default message
 */
export const getContactMessage = (contact: Contact, year?: number): string => {
  const currentYear = year || new Date().getFullYear();
  const defaultMessage = `Grattis på födelsedagen! 🎉 Hoppas du får en fantastisk dag! 🎂`;
  
  // Try to get yearly message for the specific year
  if (contact.yearly_messages && contact.yearly_messages[currentYear.toString()]) {
    return contact.yearly_messages[currentYear.toString()];
  }
  
  // Fall back to custom message
  if (contact.custom_message) {
    return contact.custom_message;
  }
  
  // Default message
  return defaultMessage;
};

/**
 * Get the year when the birthday occurs (handles year transitions)
 */
export const getBirthdayYear = (birthdayString: string): number => {
  const today = new Date();
  const birthday = new Date(birthdayString);
  const currentYear = today.getFullYear();
  
  // Set birthday to current year
  birthday.setFullYear(currentYear);
  
  // If birthday has passed this year, return next year
  if (birthday < today) {
    return currentYear + 1;
  }
  
  return currentYear;
};