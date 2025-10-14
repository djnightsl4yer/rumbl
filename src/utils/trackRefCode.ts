export const trackRefCode = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const refCode = urlParams.get('ref');

  if (!refCode) return;

  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const apiUrl = `${supabaseUrl}/functions/v1/track-ambassador`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ref: refCode,
        referrer: document.referrer || 'direct',
        userAgent: navigator.userAgent,
      }),
    });

    if (response.ok) {
      console.log(`Tracked click for ambassador: ${refCode}`);
    } else {
      const error = await response.json();
      console.warn('Failed to track ref code:', error);
    }
  } catch (error) {
    console.error('Error tracking ref code:', error);
  }
};
