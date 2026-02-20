export const Winning_Payment_Rejected_Template = `
<!DOCTYPE html>
<html>
<head>
<style>
body { font-family: Arial, sans-serif; background:#f4f4f4; margin:0; padding:0; }
.container {
    max-width:600px; margin:30px auto; background:#fff;
    border-radius:8px; border:1px solid #ddd;
    box-shadow:0 4px 15px rgba(0,0,0,0.1);
}
.header {
    background:#f44336; color:#fff; padding:20px;
    text-align:center; font-size:24px; font-weight:bold;
}
.content { padding:25px; color:#333; line-height:1.8; }
.footer {
    background:#f4f4f4; padding:15px; text-align:center;
    font-size:12px; color:#777; border-top:1px solid #ddd;
}
</style>
</head>
<body>
<div class="container">
    <div class="header"> Payment Failed</div>

    <div class="content">
        <p>Hello <strong>{name}</strong>,</p>
        <p>Your payment for the auction <strong>{auctionName}</strong> was rejected.</p>
        <p>Please try again or contact support.</p>
    </div>

    <div class="footer">
        &copy; ${new Date().getFullYear()} BidSphere. All rights reserved.
    </div>
</div>
</body>
</html>
`;