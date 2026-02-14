export const getPriceInfo = (product = {}) => {
    const originalPrice = Number(product.originalPrice ?? product.price ?? 0);
    const salePrice = Number(product.salePrice ?? product.discountPrice ?? product.price ?? 0);
    const hasDiscount = originalPrice > 0 && salePrice > 0 && salePrice < originalPrice;
    const discountRate = hasDiscount
        ? Math.floor(((originalPrice - salePrice) / originalPrice) * 100)
        : 0;

    return {
        originalPrice,
        salePrice: hasDiscount ? salePrice : originalPrice,
        hasDiscount,
        discountRate
    };
};
