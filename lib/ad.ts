export const triggerAdPopUp = () => {
  const directLink = process.env.NEXT_PUBLIC_DIRECT_LINK;
  if (!directLink || typeof window === 'undefined') return;

  const LAST_AD_KEY = 'cineby_last_ad_time';
  const now = Date.now();
  const oneHourMs = 60 * 60 * 1000;

  try {
    const lastAdTime = sessionStorage.getItem(LAST_AD_KEY);
    
    // If there's no previous time, or if 1 hour has passed
    if (!lastAdTime || now - parseInt(lastAdTime, 10) >= oneHourMs) {
      window.open(directLink, '_blank', 'noopener,noreferrer');
      sessionStorage.setItem(LAST_AD_KEY, now.toString());
    }
  } catch (e) {
    // Fallback if sessionStorage is restricted (e.g. incognito)
    window.open(directLink, '_blank', 'noopener,noreferrer');
  }
};
