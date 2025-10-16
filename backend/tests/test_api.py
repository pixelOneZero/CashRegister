import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


class TestAPI:
    """Test cases for the FastAPI endpoints"""
    
    def test_root_endpoint(self):
        """Test root endpoint returns API information"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data
        assert data["message"] == "Cash Register API"
    
    def test_health_check(self):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
    
    def test_calculate_change_success(self):
        """Test successful change calculation"""
        request_data = {
            "amount_owed": 2.12,
            "amount_paid": 3.00,
            "locale": "en-US",
            "divisor": 3
        }
        
        response = client.post("/calculate-change", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "change_amount" in data
        assert "change_cents" in data
        assert "denominations" in data
        assert "formatted_change" in data
        assert "is_random" in data
        assert "locale" in data
        
        assert data["change_amount"] == 0.88
        assert data["change_cents"] == 88
        assert data["locale"] == "en-US"
        assert isinstance(data["is_random"], bool)
    
    def test_calculate_change_insufficient_payment(self):
        """Test insufficient payment returns error"""
        request_data = {
            "amount_owed": 5.00,
            "amount_paid": 3.00,
            "locale": "en-US",
            "divisor": 3
        }
        
        response = client.post("/calculate-change", json=request_data)
        # API validates and returns 400 for insufficient payment
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert "Insufficient payment" in data["detail"]
    
    def test_calculate_change_exact_payment(self):
        """Test exact payment returns no change"""
        request_data = {
            "amount_owed": 2.50,
            "amount_paid": 2.50,
            "locale": "en-US",
            "divisor": 3
        }
        
        response = client.post("/calculate-change", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["change_amount"] == 0.0
        assert data["change_cents"] == 0
        assert data["formatted_change"] == "No change"
        assert not data["is_random"]
    
    def test_calculate_change_euro_locale(self):
        """Test Euro locale support"""
        request_data = {
            "amount_owed": 1.00,
            "amount_paid": 2.00,
            "locale": "fr-FR",
            "divisor": 3
        }
        
        response = client.post("/calculate-change", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["locale"] == "fr-FR"
        assert data["change_amount"] == 1.00
        assert data["change_cents"] == 100
    
    def test_get_supported_locales(self):
        """Test supported locales endpoint"""
        response = client.get("/supported-locales")
        assert response.status_code == 200
        
        data = response.json()
        assert "locales" in data
        assert "default" in data
        assert "en-US" in data["locales"]
        assert "fr-FR" in data["locales"]
        assert data["default"] == "en-US"
    
    def test_invalid_locale(self):
        """Test invalid locale handling"""
        request_data = {
            "amount_owed": 2.12,
            "amount_paid": 3.00,
            "locale": "invalid-locale",
            "divisor": 3
        }
        
        response = client.post("/calculate-change", json=request_data)
        # Should handle gracefully or return appropriate error
        assert response.status_code in [200, 400, 422]
    
    def test_negative_amounts(self):
        """Test negative amounts handling"""
        request_data = {
            "amount_owed": -1.00,
            "amount_paid": 2.00,
            "locale": "en-US",
            "divisor": 3
        }
        
        response = client.post("/calculate-change", json=request_data)
        # Should validate and reject negative amounts
        assert response.status_code in [400, 422]
    
    def test_missing_required_fields(self):
        """Test missing required fields"""
        request_data = {
            "amount_owed": 2.12,
            # Missing amount_paid
            "locale": "en-US",
            "divisor": 3
        }
        
        response = client.post("/calculate-change", json=request_data)
        assert response.status_code == 422  # Validation error
    
    def test_large_numbers(self):
        """Test handling of large numbers"""
        request_data = {
            "amount_owed": 1000.00,
            "amount_paid": 2000.00,
            "locale": "en-US",
            "divisor": 3
        }
        
        response = client.post("/calculate-change", json=request_data)
        assert response.status_code == 200
        
        data = response.json()
        assert data["change_amount"] == 1000.00
        assert data["change_cents"] == 100000
