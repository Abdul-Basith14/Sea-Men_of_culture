# 🎯 Business Profit Tracker - System Flow Diagrams

## 📊 Revenue Distribution Model

```
PRODUCT SOLD FOR ₹1000
═══════════════════════════════════════════════════════════════════

┌─────────────┐
│   SELLER    │  Immediately receives: ₹250 (25%)
│   (User A)  │  Owes to others: 3 × ₹250 = ₹750
└─────────────┘
      │
      │ Revenue Split (₹1000 ÷ 4)
      │
      ├──────────────┬──────────────┬──────────────┐
      │              │              │              │
      ▼              ▼              ▼              ▼
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│ User A  │    │ User B  │    │ User C  │    │ User D  │
│ (Seller)│    │         │    │         │    │         │
├─────────┤    ├─────────┤    ├─────────┤    ├─────────┤
│ ₹250 ✅ │    │ ₹250 ⏳ │    │ ₹250 ⏳ │    │ ₹250 ⏳ │
│Immediate│    │ Pending │    │ Pending │    │ Pending │
└─────────┘    └─────────┘    └─────────┘    └─────────┘

✅ = Already in profit
⏳ = Awaiting payment & verification
```

---

## 🔄 Two-Step Payment Workflow

```
┌──────────────────────────────────────────────────────────────────┐
│                    PAYMENT VERIFICATION CYCLE                     │
└──────────────────────────────────────────────────────────────────┘

STEP 1: PRODUCT SOLD
═══════════════════════════════════════════════════════════════════
User A sells jacket for ₹1000

  DATABASE CHANGES:
  ┌─────────────────────────────────────────────────────────────┐
  │ Product:                                                     │
  │   status: 'not_sold' → 'sold'                               │
  │   sellingPrice: 1000                                        │
  │   soldBy: User A                                            │
  │                                                              │
  │ User A:                                                      │
  │   totalProfit: +250                                         │
  │   paymentsDue: [{toMember: B, amount: 250},                │
  │                 {toMember: C, amount: 250},                │
  │                 {toMember: D, amount: 250}]                │
  │                                                              │
  │ User B, C, D:                                               │
  │   paymentsReceivable: [{fromMember: A, amount: 250}]       │
  │                                                              │
  │ Transaction:                                                 │
  │   payments: [                                               │
  │     {from: A, to: B, amount: 250, status: 'pending'},     │
  │     {from: A, to: C, amount: 250, status: 'pending'},     │
  │     {from: A, to: D, amount: 250, status: 'pending'}      │
  │   ]                                                          │
  └─────────────────────────────────────────────────────────────┘


STEP 2: SELLER MARKS AS PAID (Manual Payment Happened)
═══════════════════════════════════════════════════════════════════
User A transfers ₹250 to User B via UPI/Bank
Then clicks "Mark as Paid" in the app

  USER A ACTIONS:
  ┌──────────────────────┐
  │ Menu → Payment Due   │
  │ Select Project       │
  │ Find User B's card   │
  │ Click "Mark as Paid" │
  └──────────────────────┘
           │
           ▼
  DATABASE CHANGES:
  ┌─────────────────────────────────────────────────────────────┐
  │ User B:                                                      │
  │   pendingPaymentApprovals: [{                               │
  │     fromMember: A,                                          │
  │     amount: 250,                                            │
  │     requestedAt: NOW                                        │
  │   }]                                                         │
  │                                                              │
  │ Transaction (A→B payment):                                  │
  │   status: 'pending' → 'approval_requested'                 │
  │   requestedDate: NOW                                        │
  └─────────────────────────────────────────────────────────────┘


STEP 3: RECEIVER VERIFIES PAYMENT
═══════════════════════════════════════════════════════════════════
User B checks bank account, confirms ₹250 received
Then clicks "Verify Payment Received" in the app

  USER B ACTIONS:
  ┌──────────────────────────────────┐
  │ Menu → Revenue Verification      │
  │ Select Project                   │
  │ See jacket card from User A      │
  │ Click "Verify Payment Received"  │
  └──────────────────────────────────┘
           │
           ▼
  DATABASE CHANGES:
  ┌─────────────────────────────────────────────────────────────┐
  │ User B:                                                      │
  │   totalProfit: +250                                         │
  │   paymentsReceivable: [remove {fromMember: A, amount: 250}]│
  │   pendingPaymentApprovals: [remove approval from A]        │
  │                                                              │
  │ User A:                                                      │
  │   paymentsDue: [remove {toMember: B, amount: 250}]         │
  │                                                              │
  │ Transaction (A→B payment):                                  │
  │   status: 'approval_requested' → 'paid'                    │
  │   paidDate: NOW                                             │
  └─────────────────────────────────────────────────────────────┘


FINAL STATE (After all 3 payments verified)
═══════════════════════════════════════════════════════════════════
  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
  │ User A  │    │ User B  │    │ User C  │    │ User D  │
  ├─────────┤    ├─────────┤    ├─────────┤    ├─────────┤
  │ ₹250 ✅ │    │ ₹250 ✅ │    │ ₹250 ✅ │    │ ₹250 ✅ │
  │ Dues: 0 │    │ Recv: 0 │    │ Recv: 0 │    │ Recv: 0 │
  └─────────┘    └─────────┘    └─────────┘    └─────────┘

  ALL TRANSACTIONS: STATUS = 'paid'
```

---

## 🗺️ User Journey Maps

### SELLER JOURNEY (User A)

```
┌─────────────────────────────────────────────────────────────────┐
│                        SELLER WORKFLOW                           │
└─────────────────────────────────────────────────────────────────┘

1. LOGIN
   └─> Dashboard

2. CREATE PROJECT
   └─> Fill form
       └─> Upload image
           └─> Submit

3. ADD PRODUCT
   └─> Select project
       └─> Upload jacket image
           └─> Enter cost price
               └─> Submit

4. MARK AS SOLD
   └─> Set selling price: ₹1000
       └─> Confirm seller
           └─> Submit
               ├─> ✅ Profit +₹250 (immediate)
               └─> ⚠️  Owes ₹750 to others

5. VIEW OBLIGATIONS
   └─> Menu → Payment Due
       └─> Select project
           └─> See 3 members:
               ├─> Priya: ₹250 ⏳
               ├─> Amit:  ₹250 ⏳
               └─> Sneha: ₹250 ⏳

6. MAKE PAYMENTS (Outside App)
   └─> Transfer ₹250 to Priya via UPI
       └─> Transfer ₹250 to Amit via UPI
           └─> Transfer ₹250 to Sneha via UPI

7. MARK AS PAID (In App)
   └─> Click "Mark as Paid" for Priya
       └─> Status: "Awaiting Verification"
           └─> Click "Mark as Paid" for Amit
               └─> Status: "Awaiting Verification"
                   └─> Click "Mark as Paid" for Sneha
                       └─> Status: "Awaiting Verification"

8. WAIT FOR VERIFICATION
   └─> Priya verifies ✅
       └─> Amit verifies ✅
           └─> Sneha verifies ✅
               └─> ALL CLEAR ✅

9. VIEW REVENUE
   └─> Menu → My Revenue
       └─> Select project
           └─> Total: ₹250 (my 25% share)
```

---

### RECEIVER JOURNEY (User B)

```
┌─────────────────────────────────────────────────────────────────┐
│                       RECEIVER WORKFLOW                          │
└─────────────────────────────────────────────────────────────────┘

1. LOGIN
   └─> Dashboard
       └─> See "Amount to Receive" from User A: ₹250

2. CHECK BANK ACCOUNT (Outside App)
   └─> Verify ₹250 received from User A
       └─> ✅ Payment confirmed

3. VERIFY IN APP
   └─> Menu → Revenue Verification
       └─> Select project
           └─> See jacket card:
               ├─> Photo: [Jacket image]
               ├─> Code: ABC12
               ├─> Sold by: Rahul
               ├─> Sale Price: ₹1000
               └─> Your Share: ₹250
                   └─> Button: "Verify Payment Received" 🔵

4. CLICK VERIFY
   └─> Profit +₹250 ✅
       └─> Toast: "Payment verified successfully"
           └─> Card disappears

5. VIEW REVENUE
   └─> Menu → My Revenue
       └─> Select project
           └─> Total: ₹250 ✅
```

---

## 🎨 UI Screen Flow

```
┌────────────────────────────────────────────────────────────────┐
│                         MAIN NAVIGATION                         │
└────────────────────────────────────────────────────────────────┘

                        DASHBOARD
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
    ┌──────────┐      ┌──────────┐      ┌──────────┐
    │  Member  │      │ Projects │      │  Profile │
    │  Cards   │      │  Section │      │          │
    └──────────┘      └──────────┘      └──────────┘
          │                 │
          │                 ├─> Add Project
          │                 ├─> View Project
          │                 │      │
          │                 │      ├─> Add Product
          │                 │      └─> Mark as Sold
          │                 │
          ├─> Mark as Paid  │
          └─> Verify Payment│
                            │
                    ┌───────┴───────┐
                    │   HAMBURGER   │
                    │     MENU      │
                    └───────┬───────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
┌──────────────────┐ ┌──────────────┐ ┌──────────────┐
│     REVENUE      │ │  MY REVENUE  │ │ PAYMENT DUE  │
│  VERIFICATION    │ │              │ │              │
├──────────────────┤ ├──────────────┤ ├──────────────┤
│ • Projects List  │ │ • Project    │ │ • Project    │
│ • Select Project │ │   Selection  │ │   Selection  │
│ • Product Cards  │ │ • Total Box  │ │ • Product    │
│ • Verify Button  │ │ • Breakdown  │ │   Cards      │
│                  │ │              │ │ • Member     │
│                  │ │              │ │   Payment    │
│                  │ │              │ │   Cards      │
└──────────────────┘ └──────────────┘ └──────────────┘
```

---

## 📊 Database Schema Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                       DATA MODEL FLOW                            │
└─────────────────────────────────────────────────────────────────┘

USER
├─> totalProfit: Number (verified profit only)
├─> paymentsDue: [
│   └─> { toMember: ObjectId, amount: Number }
│   ]
├─> paymentsReceivable: [
│   └─> { fromMember: ObjectId, amount: Number }
│   ]
└─> pendingPaymentApprovals: [
    └─> { fromMember: ObjectId, amount: Number, requestedAt: Date }
    ]

PROJECT
├─> projectCode: String (5-char)
├─> projectName: String
├─> totalProducts: Number
├─> productsSold: Number
├─> status: 'active' | 'completed'
└─> createdBy: ObjectId → USER

PRODUCT
├─> productCode: String (5-char)
├─> projectId: ObjectId → PROJECT
├─> costPrice: Number
├─> sellingPrice: Number
├─> status: 'not_sold' | 'sold' | 'in_process'
├─> soldBy: ObjectId → USER
└─> profit: Number

TRANSACTION
├─> productId: ObjectId → PRODUCT
├─> seller: ObjectId → USER
├─> sellingPrice: Number
├─> profitPerMember: Number (selling price ÷ 4)
└─> payments: [
    ├─> fromMember: ObjectId → USER
    ├─> toMember: ObjectId → USER
    ├─> amount: Number
    ├─> status: 'pending' | 'approval_requested' | 'paid'
    ├─> requestedDate: Date
    └─> paidDate: Date
    ]

RELATIONSHIPS:
═══════════════════════════════════════════════════════════════════
USER ←──(createdBy)── PROJECT
USER ←──(soldBy)───── PRODUCT
USER ←──(seller)───── TRANSACTION
USER ←──(from/to)──── TRANSACTION.payments[]
PROJECT ←──(projectId)── PRODUCT
PRODUCT ←──(productId)── TRANSACTION
```

---

## 🔢 Calculation Examples

### Example 1: Single Product Sale

```
INPUT:
  Cost Price: ₹600
  Selling Price: ₹1000
  
CALCULATIONS:
  Profit = Selling Price - Cost Price
         = ₹1000 - ₹600
         = ₹400
  
  Share Per Member = Selling Price ÷ 4
                   = ₹1000 ÷ 4
                   = ₹250
  
DISTRIBUTION:
  Seller (User A):
    Immediate profit: ₹250
    Owes to others: 3 × ₹250 = ₹750
  
  Other Members (B, C, D):
    Expected each: ₹250
    
VERIFICATION:
  Total distributed = 4 × ₹250 = ₹1000 ✅
  Matches selling price ✅
```

---

### Example 2: Multiple Products

```
PROJECT: Winter Jackets 2026

PRODUCT 1:
  Sold by: User A
  Price: ₹1000
  Distribution: 4 × ₹250

PRODUCT 2:
  Sold by: User B
  Price: ₹1500
  Distribution: 4 × ₹375

PRODUCT 3:
  Sold by: User A
  Price: ₹800
  Distribution: 4 × ₹200

FINAL BALANCES:
═══════════════════════════════════════════════════════════════════
User A (sold 2 products):
  From Product 1: ₹250 (own) + ₹375 (from B) = ₹625
  From Product 2: ₹375 (from B)
  From Product 3: ₹200 (own)
  Owes: ₹250×3 (P1) + ₹200×3 (P3) = ₹1350
  Total Profit (after all paid): ₹625 + ₹375 + ₹200 = ₹1200

User B (sold 1 product):
  From Product 1: ₹250 (from A)
  From Product 2: ₹375 (own) + ₹200 (from A) = ₹575
  From Product 3: ₹200 (from A)
  Owes: ₹375×3 = ₹1125
  Total Profit (after all paid): ₹250 + ₹575 + ₹200 = ₹1025

User C (sold 0 products):
  From Product 1: ₹250 (from A)
  From Product 2: ₹375 (from B)
  From Product 3: ₹200 (from A)
  Owes: ₹0
  Total Profit: ₹250 + ₹375 + ₹200 = ₹825

User D (sold 0 products):
  From Product 1: ₹250 (from A)
  From Product 2: ₹375 (from B)
  From Product 3: ₹200 (from A)
  Owes: ₹0
  Total Profit: ₹250 + ₹375 + ₹200 = ₹825

VERIFICATION:
  Total revenue: ₹1000 + ₹1500 + ₹800 = ₹3300
  Total distributed: ₹1200 + ₹1025 + ₹825 + ₹825 = ₹3875
  
  Wait, this doesn't match! Let me recalculate...
  
  Actually:
  User A: ₹250 + ₹200 + ₹375 = ₹825 (after receiving from B)
  User B: ₹375 + ₹250 + ₹200 = ₹825 (after receiving from A)
  User C: ₹250 + ₹375 + ₹200 = ₹825
  User D: ₹250 + ₹375 + ₹200 = ₹825
  
  Total: 4 × ₹825 = ₹3300 ✅ Matches!
```

---

## 🎯 Key Takeaways

1. **Equal Distribution**: Everyone always gets 25% of every sale
2. **Immediate Credit**: Seller gets their 25% instantly
3. **Debt Tracking**: System tracks who owes whom
4. **Two-Step Verification**: Both parties must confirm
5. **Transparent**: All transactions visible and auditable

---

**Visual Guide Version**: 1.0
**Last Updated**: January 29, 2026
