# 🏷️ BidSphere – Online Auction System

BidSphere is a secure and transparent **online auction platform** that allows users to create and participate in auctions, with full administrative verification, controlled payments, and safe item delivery.  
The system ensures trust between buyers, sellers, and administrators by holding payments until successful delivery confirmation.

---

## 📌 Features

### 👤 User Module
- User Registration & Login
- Create Auctions (subject to Admin Approval)
- Browse & Participate in Auctions
- Token Fee Payment to Join Auctions
- Receive Auction Winner Notification (Email / App Notification)
- Choose Payment Method:
  - UPI (Online Payment)
  - Cash on Delivery (COD)
- Track Auction Status & Delivery
- Confirm Item Receipt

---

### 🛠️ Admin Module
- Admin Login & Dashboard
- Verify User-Created Auctions
- Approve or Reject Auctions
- Verify Token Fee Payments
- Monitor Ongoing Auctions
- Announce Auction Winners
- Verify Winner Payment (UPI / COD)
- Assign Delivery Personnel
- Release Payment to Seller after Confirmation
- Manage Commission Percentage
- View Reports & Transactions

---

### 🚚 Delivery Module
- Delivery Boy Assignment by Admin
- Pickup Item from Seller Address
- Deliver Item to Winner Address
- Update Delivery Status
- Trigger Buyer Confirmation

---

## 🔄 Complete System Workflow

### 1️⃣ User Registration & Login
- Users register and log in to BidSphere.
- Admin login is separate and secure.

---

### 2️⃣ Auction Creation
- User creates an auction with item details.
- Auction status: **Pending Approval**
- Admin verifies and approves/rejects the auction.

---

### 3️⃣ Auction Participation
- User selects an auction to participate in.
- User pays a **Token Fee**.
- Admin verifies the token payment.
- Only verified users can place bids.

---

### 4️⃣ Auction Completion
- Auction ends automatically based on time.
- System determines the highest bidder.
- Winner is announced via:
  - Email
  - Notification

---

### 5️⃣ Winner Payment
- Winner chooses payment method:
  - **UPI** → Payment link generated
  - **Cash on Delivery**
- Admin verifies online payment (if UPI).

---

### 6️⃣ Delivery Process
- Admin assigns a delivery person.
- Delivery person:
  - Collects item from seller
  - Delivers to winner

---

### 7️⃣ Confirmation & Payment Release
- Winner checks item upon delivery.
- Winner confirms item acceptance.
- Admin releases payment to seller.
- Admin deducts platform commission.

---

## 💰 Commission Model
- Admin earns a predefined commission percentage.
- Commission is deducted before seller payment.
- Remaining amount is transferred to seller.

---

## 🔐 Security & Trust Measures
- Admin verification at every critical step
- Secure payment handling
- Payment held until delivery confirmation
- Transparent transaction tracking

---

## 🧩 Technology Stack (Example)
> *(Modify as per your implementation)*

- **Frontend:** HTML, CSS, JavaScript / React
- **Backend:** Node.js / Java / Python
- **Database:** MySQL / MongoDB
- **Payments:** UPI Integration
- **Notifications:** Email / Push Notifications

---

## 🚀 Future Enhancements
- Real-time bidding with WebSockets
- Auction recommendation system
- Seller ratings & reviews
- Escrow-based smart payments
- Mobile application support

---

## 📄 License
This project is developed for academic and learning purposes.  
All rights reserved © BidSphere.

---

## 🙌 Author
**Project Name:** BidSphere – Online Auction System  
**Developed By:** *Mahek vaghera*

