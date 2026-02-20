export const Auction_Registration_Verified_Email_Template = `
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
    background:#4CAF50; color:#fff; padding:20px;
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
    <div class="header"> Registration Successful</div>

    <div class="content">
        <p>Hello <strong>{name}</strong>,</p>
        <p>Your registration payment has been successfully verified.</p>
        <p><strong>Auction:</strong> {auctionName}</p>
        <p>You can now participate in this auction.</p>
    </div>

    <div class="footer">
        &copy; ${new Date().getFullYear()} BidSphere. All rights reserved.
    </div>
</div>
</body>
</html>
`;