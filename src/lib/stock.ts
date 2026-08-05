export const LOW_STOCK_THRESHOLD = 5;
export const PRE_ORDER_MAX_QTY = 20;

export function getStockStatus(stockQty: number, isPreOrderFlag: boolean) {
  const isPreOrder = isPreOrderFlag || stockQty <= 0;
  const isLow = !isPreOrder && stockQty <= LOW_STOCK_THRESHOLD;

  return {
    isPreOrder,
    isLow,
    stockQty,
    maxQty: isPreOrder ? PRE_ORDER_MAX_QTY : stockQty,
    label: isPreOrder
      ? "Sob encomenda"
      : isLow
        ? `Últimas ${stockQty} unidades`
        : `Em estoque · ${stockQty} unidades`,
  };
}
