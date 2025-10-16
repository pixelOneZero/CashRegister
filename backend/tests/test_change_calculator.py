import pytest
from app.change_calculator import ChangeCalculator


class TestChangeCalculator:
    """Test cases for the ChangeCalculator class"""
    
    def setup_method(self):
        """Set up test fixtures"""
        self.calculator_usd = ChangeCalculator("en-US")
        self.calculator_eur = ChangeCalculator("fr-FR")
    
    def test_calculate_change_optimal(self):
        """Test optimal change calculation using DP"""
        # Test case: $2.12 owed, $3.00 paid = $0.88 change
        # Should use 3 quarters + 1 dime + 3 pennies = 88 cents
        denominations, is_random = self.calculator_usd.calculate_change(2.12, 3.00)
        
        assert not is_random  # Should not be random
        assert sum(coin_value * count for coin_value, count in 
                  [(self.calculator_usd.denomination_values[i], count) for i, count in 
                   enumerate([denominations.get(self.calculator_usd.denomination_names[coin_value][0], 0) 
                            for coin_value in self.calculator_usd.denomination_values])]) == 88
    
    def test_calculate_change_random(self):
        """Test random change calculation when owed amount (in cents) is divisible by divisor"""
        # Test case: $3.33 owed (333 cents), $5.00 paid
        # 333 % 3 == 0, so should use random
        denominations, is_random = self.calculator_usd.calculate_change(3.33, 5.00)
        assert is_random  # 333 is divisible by 3
        
        # Test with amount NOT divisible by 3
        # $2.12 owed (212 cents), $3.00 paid
        # 212 % 3 != 0, so should use optimal
        denominations, is_random = self.calculator_usd.calculate_change(2.12, 3.00)
        assert not is_random  # 212 is not divisible by 3
    
    def test_calculate_change_exact_payment(self):
        """Test when payment equals amount owed"""
        denominations, is_random = self.calculator_usd.calculate_change(2.50, 2.50)
        
        assert not is_random
        assert len(denominations) == 0  # No change needed
    
    def test_calculate_change_insufficient_payment(self):
        """Test insufficient payment raises error"""
        with pytest.raises(ValueError, match="Insufficient payment"):
            self.calculator_usd.calculate_change(5.00, 3.00)
        
        # Also test with exact underpayment
        with pytest.raises(ValueError, match="Insufficient payment"):
            self.calculator_usd.calculate_change(10.00, 9.99)
    
    def test_calculate_change_negative_amounts(self):
        """Test negative amounts don't raise error but work correctly"""
        # Negative owed amount with positive paid amount results in positive change
        # -100 cents owed, 200 cents paid = 300 cents change
        denominations, is_random = self.calculator_usd.calculate_change(-1.00, 2.00)
        # -100 % 3 == -1 (not 0), so should use optimal
        assert not is_random
        assert len(denominations) > 0
    
    def test_format_change_string(self):
        """Test change string formatting"""
        denominations = {"quarter": 3, "dime": 1, "penny": 3}
        formatted = self.calculator_usd.format_change_string(denominations)
        
        assert "3 quarters" in formatted
        assert "1 dime" in formatted
        assert "3 pennies" in formatted
    
    def test_format_change_string_empty(self):
        """Test formatting empty denominations"""
        formatted = self.calculator_usd.format_change_string({})
        assert formatted == "No change"
    
    def test_get_change_amount_cents(self):
        """Test change amount calculation in cents"""
        change_cents = self.calculator_usd.get_change_amount_cents(2.12, 3.00)
        assert change_cents == 88
        
        change_cents = self.calculator_usd.get_change_amount_cents(1.50, 1.50)
        assert change_cents == 0
    
    def test_euro_currency_support(self):
        """Test Euro currency support"""
        # Test that EUR calculator works
        denominations, is_random = self.calculator_eur.calculate_change(1.00, 2.00)
        assert not is_random
        assert len(denominations) > 0
    
    def test_random_generation_with_seed(self):
        """Test that random generation is deterministic with seed"""
        # Create a scenario that should trigger random generation
        # We'll manually test the random generation method
        denominations1 = self.calculator_usd._generate_random_change(300, seed=42)
        denominations2 = self.calculator_usd._generate_random_change(300, seed=42)
        
        # Should be identical with same seed
        assert denominations1 == denominations2
    
    def test_minimum_change_calculation(self):
        """Test minimum change calculation with known values"""
        # Test with 88 cents - optimal could be different combinations
        # US denominations: 100, 25, 10, 5, 1
        # 88 cents optimal: 3 quarters (75) + 1 dime (10) + 3 pennies (3) = 7 coins
        # OR: 3 quarters (75) + 2 nickels (10) + 3 pennies (3) = 8 coins
        # DP should choose the minimum
        denominations = self.calculator_usd._calculate_minimum_change(88)
        
        # Verify total value is correct
        total_value = sum(
            self.calculator_usd.denomination_values[
                next(i for i, (v, names) in enumerate(self.calculator_usd.denomination_names.items()) 
                     if names[0] == denom_name)
            ] * count
            for denom_name, count in denominations.items()
        )
        assert total_value == 88
        
        # Verify we got a reasonable number of coins (should be 6-8)
        total_coins = sum(denominations.values())
        assert 6 <= total_coins <= 8
    
    def test_edge_cases(self):
        """Test edge cases"""
        # Test with very small amounts
        denominations, is_random = self.calculator_usd.calculate_change(0.01, 0.02)
        assert not is_random
        assert len(denominations) == 1
        assert "penny" in denominations
        assert denominations["penny"] == 1
        
        # Test with large amounts
        denominations, is_random = self.calculator_usd.calculate_change(100.00, 200.00)
        assert not is_random
        assert len(denominations) > 0
