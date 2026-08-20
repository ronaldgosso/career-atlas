/**
 * Maps ISO-3166-1 alpha-2 country codes to local currency symbols and formatted codes.
 */

export interface CurrencyInfo {
    code: string;
    symbol: string;
    name: string;
}

const COUNTRY_CURRENCY_MAP: Record<string, CurrencyInfo> = {
    // East Africa & Africa
    TZ: { code: "TZS", symbol: "TSh", name: "Tanzanian Shilling" },
    KE: { code: "KES", symbol: "KSh", name: "Kenyan Shilling" },
    UG: { code: "UGX", symbol: "USh", name: "Ugandan Shilling" },
    RW: { code: "RWF", symbol: "FRw", name: "Rwandan Franc" },
    ET: { code: "ETB", symbol: "Br", name: "Ethiopian Birr" },
    NG: { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
    ZA: { code: "ZAR", symbol: "R", name: "South African Rand" },
    EG: { code: "EGP", symbol: "E£", name: "Egyptian Pound" },
    MA: { code: "MAD", symbol: "DH", name: "Moroccan Dirham" },
    GH: { code: "GHS", symbol: "GH₵", name: "Ghanaian Cedi" },

    // North America
    US: { code: "USD", symbol: "$", name: "US Dollar" },
    CA: { code: "CAD", symbol: "CA$", name: "Canadian Dollar" },
    MX: { code: "MXN", symbol: "MX$", name: "Mexican Peso" },

    // Europe
    GB: { code: "GBP", symbol: "£", name: "British Pound" },
    DE: { code: "EUR", symbol: "€", name: "Euro" },
    FR: { code: "EUR", symbol: "€", name: "Euro" },
    NL: { code: "EUR", symbol: "€", name: "Euro" },
    IE: { code: "EUR", symbol: "€", name: "Euro" },
    ES: { code: "EUR", symbol: "€", name: "Euro" },
    SE: { code: "SEK", symbol: "kr", name: "Swedish Krona" },
    CH: { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
    PL: { code: "PLN", symbol: "zł", name: "Polish Zloty" },
    EE: { code: "EUR", symbol: "€", name: "Euro" },

    // Asia Pacific
    JP: { code: "JPY", symbol: "¥", name: "Japanese Yen" },
    SG: { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
    IN: { code: "INR", symbol: "₹", name: "Indian Rupee" },
    KR: { code: "KRW", symbol: "₩", name: "South Korean Won" },
    AU: { code: "AUD", symbol: "A$", name: "Australian Dollar" },
    NZ: { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
    HK: { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar" },
    TW: { code: "TWD", symbol: "NT$", name: "New Taiwan Dollar" },
    ID: { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah" },
    PH: { code: "PHP", symbol: "₱", name: "Philippine Peso" },
    TH: { code: "THB", symbol: "฿", name: "Thai Baht" },
    MY: { code: "MYR", symbol: "RM", name: "Malaysian Ringgit" },

    // Middle East
    AE: { code: "AED", symbol: "AED", name: "UAE Dirham" },
    SA: { code: "SAR", symbol: "SAR", name: "Saudi Riyal" },
    QA: { code: "QAR", symbol: "QAR", name: "Qatari Riyal" },
    IL: { code: "ILS", symbol: "₪", name: "Israeli New Shekel" },
    TR: { code: "TRY", symbol: "₺", name: "Turkish Lira" },

    // Latin America
    BR: { code: "BRL", symbol: "R$", name: "Brazilian Real" },
    AR: { code: "ARS", symbol: "AR$", name: "Argentine Peso" },
    CO: { code: "COP", symbol: "COL$", name: "Colombian Peso" },
    CL: { code: "CLP", symbol: "CLP$", name: "Chilean Peso" },
    PE: { code: "PEN", symbol: "S/", name: "Peruvian Sol" },
};

const DEFAULT_CURRENCY: CurrencyInfo = {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
};

/**
 * Returns regional currency information given an ISO country code.
 */
export function getCurrencyForCountry(countryCode?: string): CurrencyInfo {
    if (!countryCode) return DEFAULT_CURRENCY;
    const code = countryCode.trim().toUpperCase();
    return COUNTRY_CURRENCY_MAP[code] || DEFAULT_CURRENCY;
}
