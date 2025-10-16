import random
from typing import Dict, List, Tuple
from .currency_config import get_currency_config, CurrencyConfig


class ChangeCalculator:
    """Handles change calculation using dynamic programming and random generation"""
    
    def __init__(self, locale: str = "en-US"):
        self.currency_config = get_currency_config(locale)
        self.denomination_values = [d.value_cents for d in self.currency_config.denominations]
        self.denomination_names = self.currency_config.get_denomination_names()
    
    def calculate_change(self, amount_owed: float, amount_paid: float, 
                        divisor: int = 3, seed: int = None) -> Tuple[Dict[str, int], bool]:
        """
        Calculate change using DP for minimum coins or random generation
        
        Args:
            amount_owed: Amount owed by customer
            amount_paid: Amount paid by customer  
            divisor: Divisor for random change generation
            seed: Random seed for deterministic results
            
        Returns:
            Tuple of (denominations_dict, is_random)
        """
        owed_cents = int(round(amount_owed * 100))
        paid_cents = int(round(amount_paid * 100))
        change_cents = paid_cents - owed_cents
        
        if change_cents < 0:
            raise ValueError("Insufficient payment")
        if change_cents == 0:
            return {}, False
        
        # Use random generation if owed amount (in cents) is divisible by divisor
        # Otherwise use optimal DP solution
        if owed_cents % divisor == 0:
            return self._generate_random_change(change_cents, seed), True
        else:
            return self._calculate_minimum_change(change_cents), False
    
    def _calculate_minimum_change(self, change_cents: int) -> Dict[str, int]:
        """Calculate minimum number of coins using dynamic programming"""
        dp = [float('inf')] * (change_cents + 1)
        dp[0] = 0
        coin_used = [-1] * (change_cents + 1)
        
        # Build DP table
        for amount in range(1, change_cents + 1):
            for i, coin_value in enumerate(self.denomination_values):
                if coin_value <= amount and dp[amount - coin_value] + 1 < dp[amount]:
                    dp[amount] = dp[amount - coin_value] + 1
                    coin_used[amount] = i
        
        if dp[change_cents] == float('inf'):
            raise ValueError(f"Cannot make change for {change_cents} cents")
        
        # Reconstruct the optimal solution
        denominations = {}
        amount = change_cents
        while amount > 0:
            coin_index = coin_used[amount]
            coin_value = self.denomination_values[coin_index]
            coin_name = self.denomination_names[coin_value][0]
            denominations[coin_name] = denominations.get(coin_name, 0) + 1
            amount -= coin_value
        
        return denominations
    
    def _generate_random_change(self, change_cents: int, seed: int = None) -> Dict[str, int]:
        """Generate random change that adds up to the correct amount"""
        if seed is not None:
            random.seed(seed)
        
        denominations = {}
        remaining_cents = change_cents
        
        while remaining_cents > 0:
            available_coins = [coin for coin in self.denomination_values if coin <= remaining_cents]
            
            if not available_coins:
                smallest_coin = min(self.denomination_values)
                if smallest_coin <= remaining_cents:
                    available_coins = [smallest_coin]
                else:
                    break
            
            selected_coin = random.choice(available_coins)
            coin_name = self.denomination_names[selected_coin][0]
            denominations[coin_name] = denominations.get(coin_name, 0) + 1
            remaining_cents -= selected_coin
        
        # Verify correctness
        total_calculated = sum(coin_value * count for coin_value, count in 
                             [(self.denomination_values[i], count) for i, count in 
                              enumerate([denominations.get(self.denomination_names[coin_value][0], 0) 
                                       for coin_value in self.denomination_values])])
        
        if total_calculated != change_cents:
            return self._calculate_minimum_change(change_cents)
        
        return denominations
    
    def format_change_string(self, denominations: Dict[str, int]) -> str:
        """Format denominations into human-readable string"""
        if not denominations:
            return "No change"
        
        parts = []
        for coin_name, count in denominations.items():
            if count == 1:
                parts.append(f"1 {coin_name}")
            else:
                coin_value = next(value for value, (singular, plural) in self.denomination_names.items() 
                                if singular == coin_name)
                plural_name = self.denomination_names[coin_value][1]
                parts.append(f"{count} {plural_name}")
        
        return ",".join(parts)
    
    def get_change_amount_cents(self, amount_owed: float, amount_paid: float) -> int:
        """Get change amount in cents"""
        owed_cents = int(round(amount_owed * 100))
        paid_cents = int(round(amount_paid * 100))
        return paid_cents - owed_cents
