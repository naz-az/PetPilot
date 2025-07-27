#!/bin/bash

# PetPilot CRUD Operations Test Suite
# This script runs comprehensive tests for all CRUD operations across UI, API, and Database layers

echo "🧪 PetPilot CRUD Operations Test Suite"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print section headers
print_section() {
    echo -e "\n${BLUE}📋 $1${NC}"
    echo "----------------------------------------"
}

# Function to run test suite and capture results
run_test_suite() {
    local test_name="$1"
    local test_pattern="$2"
    local description="$3"
    
    echo -e "${YELLOW}Running: $test_name${NC}"
    echo "Description: $description"
    
    if npm test -- --testPathPattern="$test_pattern" --verbose --coverage=false; then
        echo -e "${GREEN}✅ $test_name - PASSED${NC}"
        return 0
    else
        echo -e "${RED}❌ $test_name - FAILED${NC}"
        return 1
    fi
}

# Initialize test results
total_tests=0
passed_tests=0
failed_tests=0

print_section "UI Layer CRUD Tests"

# Test ProfileScreen CRUD
echo -e "\n🔄 Testing ProfileScreen CRUD Operations"
if run_test_suite "ProfileScreen Tests" "ProfileScreen.test.tsx" "Tests user profile READ, UPDATE, DELETE operations and validation"; then
    ((passed_tests++))
else
    ((failed_tests++))
fi
((total_tests++))

# Test PetsScreen CRUD
echo -e "\n🐕 Testing PetsScreen CRUD Operations"
if run_test_suite "PetsScreen Tests" "PetsScreen.test.tsx" "Tests pet CREATE, READ, UPDATE, DELETE operations with validation"; then
    ((passed_tests++))
else
    ((failed_tests++))
fi
((total_tests++))

# Test BookingsScreen CRUD
echo -e "\n📅 Testing BookingsScreen CRUD Operations"
if run_test_suite "BookingsScreen Tests" "BookingsScreen.test.tsx" "Tests booking CREATE, READ, UPDATE (cancel) operations with validation"; then
    ((passed_tests++))
else
    ((failed_tests++))
fi
((total_tests++))

# Test BookingDetailsScreen CRUD
echo -e "\n📋 Testing BookingDetailsScreen CRUD Operations"
if run_test_suite "BookingDetailsScreen Tests" "BookingDetailsScreen.test.tsx" "Tests booking details READ, UPDATE (cancel), CREATE (reviews) operations"; then
    ((passed_tests++))
else
    ((failed_tests++))
fi
((total_tests++))

# Test MedicalHistoryModal CRUD
echo -e "\n🏥 Testing MedicalHistoryModal CRUD Operations"
if run_test_suite "MedicalHistoryModal Tests" "MedicalHistoryModal.test.tsx" "Tests medical record CREATE, READ, DELETE operations"; then
    ((passed_tests++))
else
    ((failed_tests++))
fi
((total_tests++))

print_section "Integration Layer Tests"

# Test End-to-End Integration
echo -e "\n🔗 Testing End-to-End CRUD Workflows"
if run_test_suite "E2E Integration Tests" "e2e-crud-flows.test.tsx" "Tests complete CRUD workflows across multiple screens"; then
    ((passed_tests++))
else
    ((failed_tests++))
fi
((total_tests++))

print_section "API Layer CRUD Tests"

# Test API Operations
echo -e "\n🌐 Testing API CRUD Operations"
if run_test_suite "API Tests" "api-crud-operations.test.ts" "Tests all API endpoints for pets, bookings, users, reviews with validation"; then
    ((passed_tests++))
else
    ((failed_tests++))
fi
((total_tests++))

print_section "Database Layer CRUD Tests"

# Test Database Operations
echo -e "\n🗄️ Testing Database CRUD Operations"
if run_test_suite "Database Tests" "database-crud-operations.test.ts" "Tests all database operations, transactions, migrations, and constraints"; then
    ((passed_tests++))
else
    ((failed_tests++))
fi
((total_tests++))

print_section "Comprehensive Test Coverage Report"

# Generate coverage report
echo -e "\n📊 Generating Coverage Report..."
npm test -- --coverage --watchAll=false

print_section "CRUD Operations Test Summary"

echo -e "\n📈 Test Results Summary:"
echo "========================="
echo -e "Total Test Suites: $total_tests"
echo -e "${GREEN}Passed: $passed_tests${NC}"
echo -e "${RED}Failed: $failed_tests${NC}"

if [ $failed_tests -eq 0 ]; then
    echo -e "\n${GREEN}🎉 ALL CRUD OPERATIONS TESTS PASSED! 🎉${NC}"
    echo -e "${GREEN}✅ UI Layer: All screens have proper CRUD operations${NC}"
    echo -e "${GREEN}✅ API Layer: All endpoints handle CRUD correctly${NC}"
    echo -e "${GREEN}✅ Database Layer: All operations work with proper validation${NC}"
    echo -e "${GREEN}✅ Integration: End-to-end workflows function properly${NC}"
    exit 0
else
    echo -e "\n${RED}❌ SOME TESTS FAILED!${NC}"
    echo -e "${RED}Please review the failed tests and fix issues before deployment.${NC}"
    exit 1
fi