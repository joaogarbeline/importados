import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

let client: MercadoPagoConfig | null = null;

function getClient() {
  if (!client) {
    client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN!,
      options: { timeout: 5000 },
    });
  }
  return client;
}

export function getMpPreference() {
  return new Preference(getClient());
}

export function getMpPayment() {
  return new Payment(getClient());
}
