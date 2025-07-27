@echo off
REM PetPilot CRUD Operations Test Suite for Windows
REM This script runs comprehensive tests for all CRUD operations across UI, API, and Database layers

echo 🧪 PetPilot CRUD Operations Test Suite
echo ======================================

set total_tests=0
set passed_tests=0
set failed_tests=0

echo.
echo 📋 UI Layer CRUD Tests
echo ----------------------------------------

echo.
echo 🔄 Testing ProfileScreen CRUD Operations
echo Running: ProfileScreen Tests
echo Description: Tests user profile READ, UPDATE, DELETE operations and validation
call npm test -- --testPathPattern="ProfileScreen.test.tsx" --verbose --coverage=false
if %errorlevel% equ 0 (
    echo ✅ ProfileScreen Tests - PASSED
    set /a passed_tests+=1
) else (
    echo ❌ ProfileScreen Tests - FAILED
    set /a failed_tests+=1
)
set /a total_tests+=1

echo.
echo 🐕 Testing PetsScreen CRUD Operations
echo Running: PetsScreen Tests
echo Description: Tests pet CREATE, READ, UPDATE, DELETE operations with validation
call npm test -- --testPathPattern="PetsScreen.test.tsx" --verbose --coverage=false
if %errorlevel% equ 0 (
    echo ✅ PetsScreen Tests - PASSED
    set /a passed_tests+=1
) else (
    echo ❌ PetsScreen Tests - FAILED
    set /a failed_tests+=1
)
set /a total_tests+=1

echo.
echo 📅 Testing BookingsScreen CRUD Operations
echo Running: BookingsScreen Tests
echo Description: Tests booking CREATE, READ, UPDATE ^(cancel^) operations with validation
call npm test -- --testPathPattern="BookingsScreen.test.tsx" --verbose --coverage=false
if %errorlevel% equ 0 (
    echo ✅ BookingsScreen Tests - PASSED
    set /a passed_tests+=1
) else (
    echo ❌ BookingsScreen Tests - FAILED
    set /a failed_tests+=1
)
set /a total_tests+=1

echo.
echo 📋 Testing BookingDetailsScreen CRUD Operations
echo Running: BookingDetailsScreen Tests
echo Description: Tests booking details READ, UPDATE ^(cancel^), CREATE ^(reviews^) operations
call npm test -- --testPathPattern="BookingDetailsScreen.test.tsx" --verbose --coverage=false
if %errorlevel% equ 0 (
    echo ✅ BookingDetailsScreen Tests - PASSED
    set /a passed_tests+=1
) else (
    echo ❌ BookingDetailsScreen Tests - FAILED
    set /a failed_tests+=1
)
set /a total_tests+=1

echo.
echo 🏥 Testing MedicalHistoryModal CRUD Operations
echo Running: MedicalHistoryModal Tests
echo Description: Tests medical record CREATE, READ, DELETE operations
call npm test -- --testPathPattern="MedicalHistoryModal.test.tsx" --verbose --coverage=false
if %errorlevel% equ 0 (
    echo ✅ MedicalHistoryModal Tests - PASSED
    set /a passed_tests+=1
) else (
    echo ❌ MedicalHistoryModal Tests - FAILED
    set /a failed_tests+=1
)
set /a total_tests+=1

echo.
echo 📋 Integration Layer Tests
echo ----------------------------------------

echo.
echo 🔗 Testing End-to-End CRUD Workflows
echo Running: E2E Integration Tests
echo Description: Tests complete CRUD workflows across multiple screens
call npm test -- --testPathPattern="e2e-crud-flows.test.tsx" --verbose --coverage=false
if %errorlevel% equ 0 (
    echo ✅ E2E Integration Tests - PASSED
    set /a passed_tests+=1
) else (
    echo ❌ E2E Integration Tests - FAILED
    set /a failed_tests+=1
)
set /a total_tests+=1

echo.
echo 📋 API Layer CRUD Tests
echo ----------------------------------------

echo.
echo 🌐 Testing API CRUD Operations
echo Running: API Tests
echo Description: Tests all API endpoints for pets, bookings, users, reviews with validation
call npm test -- --testPathPattern="api-crud-operations.test.ts" --verbose --coverage=false
if %errorlevel% equ 0 (
    echo ✅ API Tests - PASSED
    set /a passed_tests+=1
) else (
    echo ❌ API Tests - FAILED
    set /a failed_tests+=1
)
set /a total_tests+=1

echo.
echo 📋 Database Layer CRUD Tests
echo ----------------------------------------

echo.
echo 🗄️ Testing Database CRUD Operations
echo Running: Database Tests
echo Description: Tests all database operations, transactions, migrations, and constraints
call npm test -- --testPathPattern="database-crud-operations.test.ts" --verbose --coverage=false
if %errorlevel% equ 0 (
    echo ✅ Database Tests - PASSED
    set /a passed_tests+=1
) else (
    echo ❌ Database Tests - FAILED
    set /a failed_tests+=1
)
set /a total_tests+=1

echo.
echo 📋 Comprehensive Test Coverage Report
echo ----------------------------------------

echo.
echo 📊 Generating Coverage Report...
call npm test -- --coverage --watchAll=false

echo.
echo 📋 CRUD Operations Test Summary
echo ----------------------------------------

echo.
echo 📈 Test Results Summary:
echo =========================
echo Total Test Suites: %total_tests%
echo Passed: %passed_tests%
echo Failed: %failed_tests%

if %failed_tests% equ 0 (
    echo.
    echo 🎉 ALL CRUD OPERATIONS TESTS PASSED! 🎉
    echo ✅ UI Layer: All screens have proper CRUD operations
    echo ✅ API Layer: All endpoints handle CRUD correctly
    echo ✅ Database Layer: All operations work with proper validation
    echo ✅ Integration: End-to-end workflows function properly
    exit /b 0
) else (
    echo.
    echo ❌ SOME TESTS FAILED!
    echo Please review the failed tests and fix issues before deployment.
    exit /b 1
)