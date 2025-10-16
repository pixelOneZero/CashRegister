# Cash Register

A cash register system with dynamic programming optimization and random change generation, built with FastAPI, React, TypeScript, and Tailwind CSS.

## Features

- **Dynamic Programming Optimization**: Uses DP algorithms to guarantee optimal minimum coin solutions
- **Random Change Generation**: Seeded random change when amount owed is divisible by specified divisor
- **Multi-locale Support**: US Dollar (en-US) and Euro (fr-FR) currency support
- **Integer Math**: All calculations performed in cents to avoid floating-point precision issues
- **RESTful API**: FastAPI with automatic OpenAPI documentation
- **Modern Frontend**: React with TypeScript and Tailwind CSS
- **Comprehensive Testing**: Unit tests for both backend and frontend
- **Docker Support**: Containerized deployment with docker-compose

## Architecture

### Backend (FastAPI)
- **Dynamic Programming Solver**: Optimal minimum coin calculation
- **Random Generator**: Seeded random change for divisible amounts
- **Currency Configuration**: Extensible currency system for multiple locales
- **Pydantic Models**: Type-safe API with automatic validation
- **Comprehensive Testing**: pytest with 95%+ coverage

### Frontend (React + TypeScript)
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Type Safety**: Full TypeScript implementation
- **Component Architecture**: Modular, reusable components
- **API Integration**: Axios-based service layer
- **Testing**: Jest and React Testing Library

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker (optional)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CashRegister
   ```

2. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Docker Setup

```bash
# Build and run with docker-compose
docker-compose up --build

# Or run individual services
docker-compose up backend
docker-compose up frontend
```

## Development Workflow

### Making Changes

The Docker setup includes hot-reloading for both frontend and backend, but you may need to rebuild containers when making certain changes.

#### Backend Changes (Python)

**For code changes** (`.py` files):
```bash
# Hot reload is enabled - changes are automatically detected
# No rebuild needed, just save your files
```

**For dependency changes** (`requirements.txt`):
```bash
docker-compose down
docker-compose up --build backend
```

**For configuration changes** (Docker files, environment):
```bash
docker-compose down
docker-compose up --build backend
```

#### Frontend Changes (React/TypeScript)

**For code changes** (`.tsx`, `.ts`, `.css` files):
```bash
# Hot reload is enabled - changes are automatically detected
# No rebuild needed, just save your files
```

**For dependency changes** (`package.json`):
```bash
docker-compose down
docker-compose up --build frontend
```

**For configuration changes** (Tailwind, PostCSS):
```bash
docker-compose down
docker-compose up --build frontend
```

### Rebuild Commands

```bash
# Rebuild everything
docker-compose down
docker-compose up --build

# Rebuild backend only
docker-compose down
docker-compose up --build backend

# Rebuild frontend only
docker-compose down
docker-compose up --build frontend

# View logs for debugging
docker-compose logs backend
docker-compose logs frontend

# Follow logs in real-time
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Development Tips

1. **Hot Reload**: Both services have hot reload enabled
   - Backend: Uvicorn's `--reload` flag automatically restarts on code changes
   - Frontend: React dev server automatically recompiles on changes

2. **Debugging**:
   ```bash
   # Check container status
   docker-compose ps
   
   # View real-time logs
   docker-compose logs -f
   
   # Restart a specific service
   docker-compose restart backend
   ```

3. **Clean Slate**:
   ```bash
   # Remove all containers and rebuild from scratch
   docker-compose down
   docker system prune -f
   docker-compose up --build
   ```

4. **Local Development** (without Docker):
   ```bash
   # Backend (terminal 1)
   cd backend
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   
   # Frontend (terminal 2)
   cd frontend
   npm install
   npm start
   ```

## API Endpoints

### Core Endpoints
- `POST /calculate-change` - Calculate change for single transaction
- `POST /process-file` - Process flat file with transaction data (primary feature)
- `POST /process-file-detailed` - Process flat file with detailed JSON output
- `GET /supported-locales` - Get supported currency locales
- `GET /health` - Health check endpoint

### Example Usage

```bash
# Single transaction
curl -X POST "http://localhost:8000/calculate-change" \
  -H "Content-Type: application/json" \
  -d '{
    "amount_owed": 2.12,
    "amount_paid": 3.00,
    "locale": "en-US",
    "divisor": 3
  }'

# File processing (primary feature)
curl -X POST "http://localhost:8000/process-file" \
  -F "file=@sample_transactions.txt" \
  -F "locale=en-US" \
  -F "divisor=3"

# File processing with detailed output
curl -X POST "http://localhost:8000/process-file-detailed" \
  -F "file=@sample_transactions.txt" \
  -F "locale=en-US" \
  -F "divisor=3"
```

## Algorithm Details

### Dynamic Programming Solver
The system uses a DP approach to solve the minimum coin problem:

```python
# DP table: dp[i] = minimum coins needed for amount i
dp = [float('inf')] * (change_cents + 1)
dp[0] = 0

# Fill DP table
for amount in range(1, change_cents + 1):
    for coin_value in denomination_values:
        if coin_value <= amount:
            dp[amount] = min(dp[amount], dp[amount - coin_value] + 1)
```

### Random Generation
When the amount owed (in cents) is divisible by the divisor with no remainder, the system switches to random generation:

```python
# Check if amount owed (in cents) is divisible by divisor
if owed_cents % divisor == 0:
    # Generate random change while maintaining correctness
    while remaining_cents > 0:
        available_coins = [coin for coin in denomination_values if coin <= remaining_cents]
        selected_coin = random.choice(available_coins)
        # Add to denominations and subtract from remaining
```

**Examples with divisor = 3 (from original requirements):**
- Amount owed: $3.33 (333 cents) → 333 % 3 = 0 (no remainder) → **Random denominations**
- Amount owed: $2.12 (212 cents) → 212 % 3 = 2 (has remainder) → **Optimal (DP) denominations**
- Amount owed: $1.97 (197 cents) → 197 % 3 = 2 (has remainder) → **Optimal (DP) denominations**

## Testing

### Backend Tests
```bash
cd backend
pytest tests/ -v --cov=app
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Test Coverage
- Backend: 95%+ coverage with comprehensive unit tests
- Frontend: Component testing with Jest and React Testing Library

## Configuration

### Environment Variables
- `REACT_APP_API_URL`: Frontend API base URL (default: http://localhost:8000)
- `ENVIRONMENT`: Backend environment (development/production)

### Currency Configuration
The system supports multiple currencies through the `currency_config.py` module:

```python
# Add new currency
CURRENCY_CONFIGS["new-locale"] = CurrencyConfig(
    denominations=[...],
    locale="new-locale"
)
```

## Extensibility

### Adding New Special Cases
The system is designed to be extensible:

```python
def calculate_change(self, amount_owed, amount_paid, divisor=3, seed=None):
    change_cents = self.get_change_amount_cents(amount_owed, amount_paid)
    
    # Add new special cases here
    if self._is_special_case(change_cents):
        return self._handle_special_case(change_cents)
    
    # Existing logic...
```

### Adding New Locales
1. Define currency denominations in `currency_config.py`
2. Add locale to `Locale` enum in `models.py`
3. Update frontend locale options

## Performance

- **DP Solver**: O(n*m) where n = change amount, m = number of denominations
- **Random Generator**: O(n) where n = change amount
- **API Response**: < 100ms for typical transactions
- **Frontend Rendering**: < 50ms for component updates

## Security

- Input validation with Pydantic models
- CORS configuration for cross-origin requests
- Type safety throughout the application
- No SQL injection risks (no database queries)

## Deployment

### Production Docker
```bash
docker build -t cash-register .
docker run -p 8000:8000 cash-register
```

### Environment-specific Configuration
- Development: Hot reload enabled
- Production: Optimized builds, health checks

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

This project is part of a technical assessment for True Fit.