/**
 * SMS Gateway Integration for Leeds Connect
 * Optimized for Sri Lankan providers (e.g. Notify.lk)
 */

export async function sendSms(to: string, message: string) {
  const API_KEY = process.env.NOTIFY_API_KEY;
  const USER_ID = process.env.NOTIFY_USER_ID;
  const SENDER_ID = process.env.NOTIFY_SENDER_ID || 'LeedsLIS';

  // Format number: Ensure it starts with 94 (e.g. 071... -> 9471...)
  let formattedTo = to.trim();
  if (formattedTo.startsWith('0')) {
    formattedTo = '94' + formattedTo.slice(1);
  } else if (!formattedTo.startsWith('94')) {
    formattedTo = '94' + formattedTo;
  }

  // Simulation Mode (if no API key)
  if (!API_KEY || API_KEY === 'placeholder') {
    console.log('--- SMS SIMULATION ---');
    console.log(`To: ${formattedTo}`);
    console.log(`Message: ${message}`);
    console.log('----------------------');
    return { success: true, simulated: true };
  }

  try {
    // Notify.lk API structure (Example)
    const response = await fetch(`https://app.notify.lk/api/v1/send?api_key=${API_KEY}&user_id=${USER_ID}&to=${formattedTo}&sender_id=${SENDER_ID}&message=${encodeURIComponent(message)}`);
    const data = await response.json();

    if (data.status === 'success') {
      return { success: true };
    } else {
      console.error('[SMS ERROR]', data);
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error('[SMS CRITICAL FAILURE]', error);
    return { success: false, error: 'Connection failed' };
  }
}
