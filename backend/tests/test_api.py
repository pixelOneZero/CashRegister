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
    
