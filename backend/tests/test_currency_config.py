import pytest
from app.currency_config import get_currency_config, CurrencyConfig, USD_DENOMINATIONS, EUR_DENOMINATIONS


class TestCurrencyConfig:
    """Test cases for currency configuration"""
    
    def test_get_currency_config_usd(self):
        """Test getting USD currency configuration"""
        config = get_currency_config("en-US")
        
        assert isinstance(config, CurrencyConfig)
        assert config.locale == "en-US"
        assert len(config.denominations) > 0
        
        # Check that denominations are sorted by value (descending)
        values = [d.value_cents for d in config.denominations]
        assert values == sorted(values, reverse=True)
    
    def test_get_currency_config_eur(self):
        """Test getting EUR currency configuration"""
        config = get_currency_config("fr-FR")
        
        assert isinstance(config, CurrencyConfig)
        assert config.locale == "fr-FR"
        assert len(config.denominations) > 0
        
        # Check that denominations are sorted by value (descending)
        values = [d.value_cents for d in config.denominations]
        assert values == sorted(values, reverse=True)
    
    def test_get_currency_config_invalid_locale(self):
        """Test invalid locale raises error"""
        with pytest.raises(ValueError, match="Unsupported locale"):
            get_currency_config("invalid-locale")
    
    def test_usd_denominations(self):
        """Test USD denominations structure"""
        assert len(USD_DENOMINATIONS) > 0
        
        # Check that all denominations have required attributes
        for denomination in USD_DENOMINATIONS:
            assert hasattr(denomination, 'value_cents')
            assert hasattr(denomination, 'singular')
            assert hasattr(denomination, 'plural')
            assert denomination.value_cents > 0
            assert len(denomination.singular) > 0
            assert len(denomination.plural) > 0
    
    def test_eur_denominations(self):
        """Test EUR denominations structure"""
        assert len(EUR_DENOMINATIONS) > 0
        
        # Check that all denominations have required attributes
        for denomination in EUR_DENOMINATIONS:
            assert hasattr(denomination, 'value_cents')
            assert hasattr(denomination, 'singular')
            assert hasattr(denomination, 'plural')
            assert denomination.value_cents > 0
            assert len(denomination.singular) > 0
            assert len(denomination.plural) > 0
    
    def test_denomination_values(self):
        """Test that denomination values are reasonable"""
        # USD denominations
        usd_values = [d.value_cents for d in USD_DENOMINATIONS]
        assert min(usd_values) == 1  # Penny
        assert max(usd_values) == 10000  # $100 bill
        
        # EUR denominations
        eur_values = [d.value_cents for d in EUR_DENOMINATIONS]
        assert min(eur_values) == 1  # Cent
        assert max(eur_values) == 10000  # €100 bill
    
    def test_denomination_names(self):
        """Test denomination name mapping"""
        config = get_currency_config("en-US")
        names = config.get_denomination_names()
        
        assert isinstance(names, dict)
        assert len(names) == len(config.denominations)
        
        # Check that all denominations have name mappings
        for denomination in config.denominations:
            assert denomination.value_cents in names
            singular, plural = names[denomination.value_cents]
            assert singular == denomination.singular
            assert plural == denomination.plural
    
    def test_currency_differences(self):
        """Test that USD and EUR have different denominations"""
        usd_config = get_currency_config("en-US")
        eur_config = get_currency_config("fr-FR")
        
        # Should have different number of denominations
        assert len(usd_config.denominations) != len(eur_config.denominations)
        
        # Should have different values
        usd_values = [d.value_cents for d in usd_config.denominations]
        eur_values = [d.value_cents for d in eur_config.denominations]
        assert usd_values != eur_values
    
    def test_denomination_sorting(self):
        """Test that denominations are properly sorted"""
        config = get_currency_config("en-US")
        values = [d.value_cents for d in config.denominations]
        
        # Should be sorted in descending order
        assert values == sorted(values, reverse=True)
        
        # No duplicate values
        assert len(values) == len(set(values))
    
    def test_currency_config_immutability(self):
        """Test that currency config maintains its integrity"""
        config = get_currency_config("en-US")
        original_locale = config.locale
        original_denominations_count = len(config.denominations)
        
        # Get config again to verify it's consistently created
        config2 = get_currency_config("en-US")
        assert config2.locale == original_locale
        assert len(config2.denominations) == original_denominations_count
        
        # Verify the config has the expected structure
        assert hasattr(config, 'locale')
        assert hasattr(config, 'denominations')
        assert hasattr(config, 'get_denomination_names')
