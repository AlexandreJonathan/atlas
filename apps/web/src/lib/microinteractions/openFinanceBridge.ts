import { openFinanceEvents } from "../../modules/open-finance/utils/events";
import { triggerMicrointeraction } from "./dispatch";

let started = false;

/**
 * Ponte opcional: eventos de domínio Open Finance → microinterações.
 * Sem I/O externo; só escuta o bus local (ex.: Pix recebido).
 */
export function startOpenFinanceMicrointeractionBridge(): () => void {
  if (started) {
    return () => undefined;
  }
  started = true;

  const offPix = openFinanceEvents.on("onPixReceived", ({ amount, counterpartName }) => {
    triggerMicrointeraction("money_in", {
      title: "Pix recebido",
      message: counterpartName ? `De ${counterpartName}` : "Pix recebido",
      amount,
      target: ".atlas-wealth-hero",
    });
  });

  return () => {
    offPix();
    started = false;
  };
}
