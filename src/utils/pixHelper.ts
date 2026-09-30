export const generatePixPayload = (pixKey: string, name = 'Igreja', city = 'Cidade', amount: any = null): string => {
    if (!pixKey) return '';
    const sanitize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
    const safeName = sanitize(name || 'IGREJA').substring(0, 25);
    const safeCity = sanitize(city || 'CIDADE').substring(0, 15);
    const safeKey = pixKey.trim();
    const payloadFormat = "000201"; const pointOfInitiation = "010211";
    const merchantAccountGui = "0014br.gov.bcb.pix"; const merchantAccountKey = "01" + safeKey.length.toString().padStart(2, '0') + safeKey;
    const merchantAccountInfo = merchantAccountGui + merchantAccountKey; const merchantAccountBlock = "26" + merchantAccountInfo.length.toString().padStart(2, '0') + merchantAccountInfo;
    const merchantCategoryCode = "52040000"; const transactionCurrency = "5303986";
    let transactionAmountBlock = "";
    if (amount && parseFloat(amount) > 0) {
        const amountStr = parseFloat(amount).toFixed(2);
        transactionAmountBlock = "54" + amountStr.length.toString().padStart(2, '0') + amountStr;
    }
    const countryCode = "5802BR"; const merchantNameBlock = "59" + safeName.length.toString().padStart(2, '0') + safeName; const merchantCityBlock = "60" + safeCity.length.toString().padStart(2, '0') + safeCity;
    const additionalDataField = "0504GIPP"; const additionalDataBlock = "62" + additionalDataField.length.toString().padStart(2, '0') + additionalDataField;
    const payloadToCrc = payloadFormat + pointOfInitiation + merchantAccountBlock + merchantCategoryCode + transactionCurrency + transactionAmountBlock + countryCode + merchantNameBlock + merchantCityBlock + additionalDataBlock + "6304";
    let crc = 0xFFFF;
    for (let i = 0; i < payloadToCrc.length; i++) {
        crc ^= payloadToCrc.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) { if ((crc & 0x8000) !== 0) crc = (crc << 1) ^ 0x1021; else crc = crc << 1; }
    }
    let hex = (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
    return payloadToCrc + hex;
};

export default generatePixPayload;
