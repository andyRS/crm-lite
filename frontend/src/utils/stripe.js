import { loadStripe } from '@stripe/stripe-js';

// Inicializar Stripe con la clave pública
let stripePromise;

const getStripe = () => {
  if (!stripePromise) {
    // La clave pública se obtiene del backend o se usa la del .env
    // Para producción, debes cargarla desde el backend
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_tu_clave_publica');
  }
  return stripePromise;
};

export default getStripe;
