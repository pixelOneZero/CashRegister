from typing import Dict, List, Tuple
from enum import Enum


class CurrencyDenomination:
    """Represents a currency denomination with value and names"""
    def __init__(self, value_cents: int, singular: str, plural: str):
        self.value_cents = value_cents
        self.singular = singular
        self.plural = plural


class CurrencyConfig:
    """Configuration for a currency system"""
    
    def __init__(self, denominations: List[CurrencyDenomination], locale: str):
        self.denominations = sorted(denominations, key=lambda d: d.value_cents, reverse=True)
        self.locale = locale
    
    def get_denomination_names(self) -> Dict[int, Tuple[str, str]]:
        """Get mapping of value_cents to (singular, plural) names"""
        return {d.value_cents: (d.singular, d.plural) for d in self.denominations}


# US Dollar denominations (values in cents to avoid floating-point issues)
USD_DENOMINATIONS = [
    CurrencyDenomination(10000, "hundred dollar bill", "hundred dollar bills"),
    CurrencyDenomination(5000, "fifty dollar bill", "fifty dollar bills"),
    CurrencyDenomination(2000, "twenty dollar bill", "twenty dollar bills"),
    CurrencyDenomination(1000, "ten dollar bill", "ten dollar bills"),
    CurrencyDenomination(500, "five dollar bill", "five dollar bills"),
    CurrencyDenomination(100, "dollar", "dollars"),
    CurrencyDenomination(25, "quarter", "quarters"),
    CurrencyDenomination(10, "dime", "dimes"),
    CurrencyDenomination(5, "nickel", "nickels"),
    CurrencyDenomination(1, "penny", "pennies"),
]

# Euro denominations (values in cents)
EUR_DENOMINATIONS = [
    CurrencyDenomination(10000, "hundred euro bill", "hundred euro bills"),         # €100
    CurrencyDenomination(5000, "fifty euro bill", "fifty euro bills"),              # €50
    CurrencyDenomination(2000, "twenty euro bill", "twenty euro bills"),            # €20
    CurrencyDenomination(1000, "ten euro bill", "ten euro bills"),                  # €10
    CurrencyDenomination(500, "five euro bill", "five euro bills"),                 # €5
    CurrencyDenomination(200, "two euro coin", "two euro coins"),                   # €2
    CurrencyDenomination(100, "euro", "euros"),                                     # €1
    CurrencyDenomination(20, "twenty cent coin", "twenty cent coins"),              # €0.20
    CurrencyDenomination(10, "ten cent coin", "ten cent coins"),                    # €0.10
    CurrencyDenomination(5, "five cent coin", "five cent coins"),                   # €0.05
    CurrencyDenomination(2, "two cent coin", "two cent coins"),                     # €0.02
    CurrencyDenomination(1, "cent", "cents"),                                       # €0.01
]

CURRENCY_CONFIGS = {
    "en-US": CurrencyConfig(USD_DENOMINATIONS, "en-US"),
    "fr-FR": CurrencyConfig(EUR_DENOMINATIONS, "fr-FR"),
}


def get_currency_config(locale: str) -> CurrencyConfig:
    """Get currency configuration for a locale"""
    if locale not in CURRENCY_CONFIGS:
        raise ValueError(f"Unsupported locale: {locale}")
    return CURRENCY_CONFIGS[locale]
