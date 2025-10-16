from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse
from typing import List
import uvicorn
import csv
import io

from .models import Locale
from .change_calculator import ChangeCalculator

app = FastAPI(
    title="Cash Register API",
    description="A cash register system with dynamic programming optimization for minimum change and random change generation based on divisor with no remainder.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Cash Register API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}



@app.get("/supported-locales")
async def get_supported_locales():
    """Get list of supported currency locales"""
    return {
        "locales": [locale.value for locale in Locale],
        "default": Locale.EN_US.value
    }


@app.post("/process-file", response_class=PlainTextResponse)
async def process_flat_file(
    file: UploadFile = File(...),
    locale: str = Form("en-US"),
    divisor: int = Form(3)
):
    """
    Process a flat file with transaction data
    
    Expected file format:
    - Each line: "amount_owed,amount_paid"
    - Example: "2.13,3.00"
    - Multiple lines supported
    
    Returns formatted change strings, one per line
    """
    try:
        content = await file.read()
        file_content = content.decode('utf-8')
        lines = file_content.strip().split('\n')
        results = []
        calculator = ChangeCalculator(locale)
        
        for line_num, line in enumerate(lines, 1):
            line = line.strip()
            if not line:
                continue
                
            try:
                parts = line.split(',')
                if len(parts) != 2:
                    results.append(f"Line {line_num}: Invalid format - expected 'amount_owed,amount_paid'")
                    continue
                
                amount_owed = float(parts[0].strip())
                amount_paid = float(parts[1].strip())
                
                if amount_paid < amount_owed:
                    results.append(f"Line {line_num}: Insufficient payment")
                    continue
                
                change_cents = calculator.get_change_amount_cents(amount_owed, amount_paid)
                
                if change_cents == 0:
                    results.append("No change")
                    continue
                
                denominations, is_random = calculator.calculate_change(
                    amount_owed, amount_paid, divisor
                )
                
                formatted_change = calculator.format_change_string(denominations)
                results.append(formatted_change)
                
            except ValueError as e:
                results.append(f"Line {line_num}: Invalid number format - {str(e)}")
            except Exception as e:
                results.append(f"Line {line_num}: Error - {str(e)}")
        
        return '\n'.join(results)
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"File processing error: {str(e)}")


@app.post("/process-file-detailed")
async def process_flat_file_detailed(
    file: UploadFile = File(...),
    locale: str = Form("en-US"),
    divisor: int = Form(3)
):
    """
    Process a flat file with detailed results
    
    Returns structured data with change calculations for each line
    """
    try:
        content = await file.read()
        file_content = content.decode('utf-8')
        lines = file_content.strip().split('\n')
        results = []
        calculator = ChangeCalculator(locale)
        
        for line_num, line in enumerate(lines, 1):
            line = line.strip()
            if not line:
                continue
                
            try:
                parts = line.split(',')
                if len(parts) != 2:
                    results.append({
                        "line_number": line_num,
                        "input": line,
                        "error": "Invalid format - expected 'amount_owed,amount_paid'",
                        "success": False
                    })
                    continue
                
                amount_owed = float(parts[0].strip())
                amount_paid = float(parts[1].strip())
                
                if amount_paid < amount_owed:
                    results.append({
                        "line_number": line_num,
                        "input": line,
                        "error": "Insufficient payment",
                        "success": False
                    })
                    continue
                
                change_cents = calculator.get_change_amount_cents(amount_owed, amount_paid)
                
                if change_cents == 0:
                    results.append({
                        "line_number": line_num,
                        "input": line,
                        "change_amount": 0.0,
                        "change_cents": 0,
                        "formatted_change": "No change",
                        "denominations": {},
                        "is_random": False,
                        "success": True
                    })
                    continue
                
                denominations, is_random = calculator.calculate_change(
                    amount_owed, amount_paid, divisor
                )
                
                formatted_change = calculator.format_change_string(denominations)
                
                results.append({
                    "line_number": line_num,
                    "input": line,
                    "change_amount": change_cents / 100.0,
                    "change_cents": change_cents,
                    "formatted_change": formatted_change,
                    "denominations": denominations,
                    "is_random": is_random,
                    "success": True
                })
                
            except ValueError as e:
                results.append({
                    "line_number": line_num,
                    "input": line,
                    "error": f"Invalid number format - {str(e)}",
                    "success": False
                })
            except Exception as e:
                results.append({
                    "line_number": line_num,
                    "input": line,
                    "error": f"Error - {str(e)}",
                    "success": False
                })
        
        return {
            "total_lines": len(lines),
            "processed_lines": len([r for r in results if r.get("success", False)]),
            "error_lines": len([r for r in results if not r.get("success", False)]),
            "results": results
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"File processing error: {str(e)}")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
