# 🧪 Testing Guide - Business Profit Tracker

## Quick Start Testing

### Prerequisites
1. MongoDB running
2. Backend seeded with 4 users
3. Both backend and frontend running

---

## Test Scenario: Complete Payment Cycle

### 👤 Users (after seeding):
- **User A**: rahul@business.com (Seller)
- **User B**: priya@business.com (Receiver 1)
- **User C**: amit@business.com (Receiver 2)
- **User D**: sneha@business.com (Receiver 3)

---

## 📋 Step-by-Step Test

### PHASE 1: Setup (User A)

1. **Login as User A**
   - Email: rahul@business.com
   - Password: temp123
   - Change password on first login

2. **Create a Project**
   - Click "New Project" button
   - Name: "Winter Jackets 2026"
   - Add description
   - Upload image
   - Set total products: 10

3. **Add a Product**
   - Go to project detail page
   - Click "Add Product"
   - Upload jacket image
   - Cost Price: ₹600
   - Target Price: ₹1000
   - Submit

---

### PHASE 2: Sell Product (User A)

4. **Mark Product as Sold**
   - Click "Mark as Sold" on the product
   - Confirm seller: Rahul
   - Selling Price: ₹1000
   - Submit

5. **Verify Initial State**
   - ✅ User A's total profit: +₹250 (25% of ₹1000)
   - ✅ Dashboard shows 3 payment obligations
   - ✅ Other users show receivables from User A

---

### PHASE 3: View Revenue (User A)

6. **Check Revenue Page**
   - Click hamburger menu (☰)
   - Select "My Revenue"
   - Select "Winter Jackets 2026"
   - **Verify**: Total shows ₹250 (not ₹1000)
   - **Verify**: Product breakdown shows ₹250 for the jacket

---

### PHASE 4: View Payment Obligations (User A)

7. **Check Payment Due**
   - Click hamburger menu (☰)
   - Select "Payment Due"
   - Select "Winter Jackets 2026"
   - **Verify**: Jacket card shows:
     - ✅ Jacket image and code
     - ✅ Selling price: ₹1000
     - ✅ Three member cards (Priya, Amit, Sneha)
     - ✅ Each shows ₹250 due
     - ✅ "Mark as Paid" button for each

---

### PHASE 5: Manual Payment (Real World)

8. **Transfer Money (Outside App)**
   - User A sends ₹250 to User B via UPI/Bank
   - *This happens outside the application*

---

### PHASE 6: Mark Payment (User A)

9. **Mark as Paid in App**
   - In Payment Due → Winter Jackets project
   - Find Priya's card
   - Click **"Mark as Paid"** button
   - **Verify**: Button changes to "Awaiting Verification"
   - Toast: "Payment notification sent to member"

---

### PHASE 7: Verify Payment (User B)

10. **Login as User B**
    - Logout from User A
    - Login as priya@business.com
    - Password: temp123 (or changed password)

11. **Check Revenue Verification**
    - Click hamburger menu (☰)
    - Select "Revenue Verification"
    - Select "Winter Jackets 2026"
    - **Verify**: Jacket card shows:
      - ✅ Jacket image and code
      - ✅ Sold by: Rahul
      - ✅ Sale Price: ₹1000
      - ✅ Your Share (25%): ₹250
      - ✅ **"Verify Payment Received"** button (highlighted)

12. **Verify the Payment**
    - Click **"Verify Payment Received"**
    - **Verify**:
      - ✅ User B's total profit: +₹250
      - ✅ Toast: "Payment verified successfully"
      - ✅ Card disappears from verification list

---

### PHASE 8: Confirm Clearance (User A)

13. **Login back as User A**
    - Go to Payment Due → Winter Jackets
    - **Verify**: Priya's card now shows "Paid & Verified" (green)
    - **Verify**: User A's total profit still ₹250
    - **Verify**: 2 remaining obligations (Amit, Sneha)

---

### PHASE 9: Repeat for Remaining Members

14. **Pay User C (Amit)**
    - Mark as paid
    - Login as Amit
    - Verify payment
    - Check clearance

15. **Pay User D (Sneha)**
    - Mark as paid
    - Login as Sneha
    - Verify payment
    - Check clearance

---

## ✅ Final Verification

### User A (Rahul - Seller)
- Total Profit: ₹250
- Payments Due: 0 (all cleared)
- Payments Receivable: 0

### User B (Priya)
- Total Profit: ₹250
- Payments Due: 0
- Payments Receivable: 0

### User C (Amit)
- Total Profit: ₹250
- Payments Due: 0
- Payments Receivable: 0

### User D (Sneha)
- Total Profit: ₹250
- Payments Due: 0
- Payments Receivable: 0

**Total Distributed**: ₹1000 (₹250 × 4 members) ✅

---

## 🎯 Test Cases

### Test Case 1: Profit Calculation
**Input**: Sell product for ₹1000
**Expected**: Seller gets ₹250 immediately
**Actual**: _____________
**Status**: ⬜ Pass ⬜ Fail

### Test Case 2: Payment Due Display
**Input**: After selling product
**Expected**: Shows 3 members × ₹250 each
**Actual**: _____________
**Status**: ⬜ Pass ⬜ Fail

### Test Case 3: Payment Notification
**Input**: Click "Mark as Paid"
**Expected**: Button changes to "Awaiting Verification"
**Actual**: _____________
**Status**: ⬜ Pass ⬜ Fail

### Test Case 4: Payment Verification
**Input**: Receiver clicks "Verify"
**Expected**: +₹250 to receiver's profit
**Actual**: _____________
**Status**: ⬜ Pass ⬜ Fail

### Test Case 5: Revenue Display
**Input**: View "My Revenue" page
**Expected**: Shows only 25% share per product
**Actual**: _____________
**Status**: ⬜ Pass ⬜ Fail

### Test Case 6: Debt Clearance
**Input**: Payment verified
**Expected**: Removed from both dues and receivables
**Actual**: _____________
**Status**: ⬜ Pass ⬜ Fail

---

## 🐛 Common Issues & Solutions

### Issue 1: "Verify Payment" button not showing
**Cause**: Seller hasn't marked as paid yet
**Solution**: Seller must click "Mark as Paid" first

### Issue 2: Revenue shows ₹1000 instead of ₹250
**Cause**: Using wrong calculation
**Solution**: Check productController.js - should be `sharePerMember`

### Issue 3: Payment cleared but profit not updated
**Cause**: Approval flow not completed
**Solution**: Both mark-as-paid AND verify must happen

### Issue 4: Menu not appearing
**Cause**: JavaScript not loading
**Solution**: Check browser console, refresh page

---

## 📊 Visual Verification Checklist

### Dashboard
- [ ] Hamburger menu icon visible top-right
- [ ] Member cards show correct balances
- [ ] Projects grid displays correctly

### Payment Due Page
- [ ] Projects list shows active projects
- [ ] Product cards show jacket details
- [ ] Member cards show payment status
- [ ] Buttons work (Mark as Paid)

### Revenue Verification Page
- [ ] Projects list shows active projects
- [ ] Product cards show seller info
- [ ] Share amount calculated correctly
- [ ] Verify button appears when needed

### My Revenue Page
- [ ] Total revenue box prominent
- [ ] Shows only user's 25% share
- [ ] Product breakdown accurate
- [ ] Real-time number animations

---

## 🚀 Performance Testing

### Load Test
1. Create 10 projects
2. Add 50 products total
3. Sell 30 products
4. Verify page loads < 2 seconds

### Stress Test
1. Rapid clicking on buttons
2. Multiple tabs open
3. Concurrent user actions
4. Check for race conditions

---

## 📱 Mobile Testing

### Responsive Design
- [ ] Menu works on mobile
- [ ] Cards stack properly
- [ ] Buttons accessible
- [ ] Text readable
- [ ] Images optimized

### Touch Interactions
- [ ] Buttons have adequate touch targets
- [ ] Scrolling smooth
- [ ] Modals work properly
- [ ] Forms usable

---

## 🔐 Security Testing

### Authentication
- [ ] Can't access pages without login
- [ ] Token expires correctly
- [ ] Logout clears session
- [ ] Password change works

### Authorization
- [ ] Can only verify own receivables
- [ ] Can only mark own dues as paid
- [ ] Can't modify other users' data

---

## 📈 Success Metrics

- ✅ 100% revenue distributed (₹1000 = 4 × ₹250)
- ✅ Zero discrepancies in accounting
- ✅ All payments verified through 2-step process
- ✅ UI responsive and intuitive
- ✅ No errors in browser console

---

**Last Updated**: January 29, 2026
**Test Environment**: Development
**Tester**: _____________
**Date Tested**: _____________
**Overall Status**: ⬜ Pass ⬜ Fail ⬜ Partial
