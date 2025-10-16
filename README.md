# Cash Register

A cash register system that processes flat files containing transaction data and calculates optimal change using dynamic programming, with random denomination generation for specific cases.

## The Problem

Creative Cash Draw Solutions wants a system that:
- Accepts flat file input (CSV format: `amount_owed,amount_paid`)
- Returns minimum change using optimal denominations
- **Special twist**: When amount owed is divisible by 3, randomly generate change denominations

## Quick Start

### Docker (Recommended)

```bash
docker-compose up --build
```

Then access:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### Manual Setup

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

## How It Works

### Input Format

Create a text file with one transaction per line:
```
2.12,3.00
1.97,2.00
3.33,5.00
```

### Output Format

The system returns formatted change strings:
```
3 quarters,1 dime,3 pennies
3 pennies
1 dollar,1 quarter,6 nickels,12 pennies  ← Random (333 % 3 == 0)
```

### Random vs Optimal Logic

- **Random**: When `owed_cents % divisor == 0` (no remainder)
- **Optimal**: When `owed_cents % divisor != 0` (has remainder)

**Examples with divisor = 3:**
- $3.33 (333 cents) → 333 % 3 = 0 → **Random**
- $2.12 (212 cents) → 212 % 3 = 2 → **Optimal**
- $1.97 (197 cents) → 197 % 3 = 2 → **Optimal**

## API Usage

### Process File (Simple)
```bash
curl -X POST "http://localhost:8000/process-file" \
  -F "file=@sample_transactions.txt" \
  -F "locale=en-US" \
  -F "divisor=3"
```

### Process File (Detailed JSON)
```bash
curl -X POST "http://localhost:8000/process-file-detailed" \
  -F "file=@sample_transactions.txt" \
  -F "locale=en-US" \
  -F "divisor=3"
```

## Testing

**Backend:**
```bash
cd backend
python -m pytest tests/ -v
```

**Frontend:**
```bash
cd frontend
npm test -- --watchAll=false
```

## Extensibility

### Changing the Random Divisor
The divisor is configurable via API parameter (default: 3). Change it to any integer ≥ 1.

### Adding New Special Cases
The modular `ChangeCalculator` class makes it easy to add new logic:
```python
if owed_cents % divisor == 0:
    return self._generate_random_change(change_cents, seed), True
# Add more conditions here for other special cases
```

### Supporting New Countries
Add currency configurations in `backend/app/currency_config.py`:
```python
CURRENCY_CONFIGS = {
    "en-US": CurrencyConfig(...),  # US Dollar
    "fr-FR": CurrencyConfig(...),  # Euro
    "ja-JP": CurrencyConfig(...),  # Add new locale
}
```

## Technology Stack

- **Backend**: FastAPI, Python 3.11, Pydantic, pytest
- **Frontend**: React, TypeScript, Tailwind CSS, Jest
- **Deployment**: Docker, docker-compose
- **Algorithm**: Dynamic Programming for optimal solutions

## Project Structure

```
CashRegister/
├── backend/
│   ├── app/
│   │   ├── main.py              # API endpoints
│   │   ├── change_calculator.py # DP & random algorithms
│   │   ├── currency_config.py   # Currency definitions
│   │   └── models.py            # Pydantic models
│   ├── tests/                   # Backend tests
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   └── __tests__/           # Frontend tests
│   └── package.json
├── docker-compose.yml
└── Dockerfile
```

## License

This project is part of a technical assessment.
