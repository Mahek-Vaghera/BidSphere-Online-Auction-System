import { Verification_Email_Template } from "../email-templates/verify_email.template.js"
import { Welcome_Email_Template } from "../email-templates/welcome_email.template.js"
import { Reset_Password_Email_Template } from "../email-templates/restPwd_email.template.js"
import { UPI_Selected_Email_Template } from "../email-templates/upi_email.template.js"
import { PAYMENT_Verification_Request_Sent_Template } from "../email-templates/paymentVerifyRequest_email.template.js"
import {  Auction_Registration_Rejected_Template  } from "../email-templates/auRegistrationRejected_email.template.js"
import {  Auction_Registration_Verified_Email_Template }from "../email-templates/auRegistrationVerified_email.template.js"
import { Winning_Payment_Verified_Email_Template } from "../email-templates/winningPaymentVerified_email.template.js"
import { Winning_Payment_Rejected_Template } from "../email-templates/winningPaymentRejected_email.template.js"
import { Auction_Verified_Email_Template } from "../email-templates/auVerified_email.template.js"
import { Auction_Removed_Email_Template } from "../email-templates/auRejected_email.template.js"
import dotenv from "dotenv";
dotenv.config();
//ahi je brevo-api chhe ene nvi banavani chhe ane email account bhi navu banavanu chhe bidsphere matenu
 const SendVerificationCode = async (email, verificationCode) => {
  try {
    const body = {
      sender: { email: process.env.BREVO_FROM_EMAIL },
      to: [{ email }],
      subject: "Verify your Email, Welcome to BidSphere",
      htmlContent: Verification_Email_Template.replace("{verificationCode}", verificationCode)
    };

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify(body)
    });

    console.log("Verification email sent:", await response.json());

  } catch (error) {
    console.log("Email error:", error);
  }
};

const WelcomeEmail = async (email, name) => {
  try {
    const body = {
      sender: { email: process.env.BREVO_FROM_EMAIL },
      to: [{ email }],
      subject: "Welcome to BidSphere",
      htmlContent: Welcome_Email_Template.replace("{name}", name)
    };

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify(body)
    });

    console.log("Welcome email sent:", await response.json());
  } catch (error) {
    console.log("catch error", error);
  }
};

const SendResetPwdEmail = async (email, resetPwdLink) => {
  try {
    const body = {
      sender: { email: process.env.BREVO_FROM_EMAIL },
      to: [{ email }],
      subject: "Reset your BidSphere Password",
      htmlContent: Reset_Password_Email_Template.replace("{resetLink}", resetPwdLink)
    };

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify(body)
    });

    console.log("Reset password email sent:", await response.json());
  } catch (error) {
    console.log("catch error", error);
  }
};

const SendOutBidEmail = async (email, itemName, currentBid, maxLimit, auctionId, title) => {
  try {
    const htmlContent = Outbid_Email_Template
      .replace("{itemName}", itemName)
      .replace("{auctionTitle}", title)
      .replace("{currentBid}", currentBid)
      .replace("{maxLimit}", maxLimit)
      .replaceAll("{auctionId}", auctionId);

    const body = {
      sender: { email: process.env.BREVO_FROM_EMAIL },
      to: [{ email }],
      subject: `You've Been Outbid on ${itemName} in ${title} - BidSphere`,
      htmlContent
    };

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify(body)
    });

    console.log("Outbid email sent:", await response.json());
  } catch (error) {
    console.log("Error sending outbid email:", error);
  }
};

const SendUPISelectedEmail = async (email, name, auctionName, upiLink, amount) => {
  try {
    const qrBuffer = await QRCode.toBuffer(upiLink);
    const qrBase64 = qrBuffer.toString("base64");

    const htmlContent = UPI_Selected_Email_Template
      .replace("{name}", name)
      .replace("{auctionName}", auctionName)
      .replace("{upiLink}", upiLink)
      .replace("{amount}", amount)
      .replace("{qrCode}", `<img src="cid:qrimage@bidsphere" />`);

    const body = {
      sender: { email: process.env.BREVO_FROM_EMAIL },
      to: [{ email }],
      subject: "UPI Payment Details for Your Auction Order",
      htmlContent,
      attachment: [
        {
          name: "qr.png",
          content: qrBase64,
        }
      ]
    };

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify(body)
    });

    console.log("UPI selected email sent:", await response.json());
  } catch (error) {
    console.log("UPI selected email error:", error);
  }
};

const SendPaymentVerificationRequestSent = async (email, name, auctionName, reqFor) => {
  try {
    const htmlContent = PAYMENT_Verification_Request_Sent_Template
      .replace("{name}", name)
      .replace("{auctionName}", auctionName)
      .replace("{reqFor}", reqFor);

    const body = {
      sender: { email: process.env.BREVO_FROM_EMAIL },
      to: [{ email }],
      subject: "Payment Verification Request Received",
      htmlContent
    };

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify(body)
    });

    console.log("Payment verification-request email sent:", await response.json());
  } catch (error) {
    console.log("Error sending payment verification-request email:", error);
  }
};

const SendAuRegistrationPaymentRejection = async (email, name, auctionName) => {
  try {
    const htmlContent = Auction_Registration_Rejected_Template
      .replace("{name}", name)
      .replace("{auctionName}", auctionName);

    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        sender: { email: process.env.BREVO_FROM_EMAIL },
        to: [{ email }],
        subject: "Auction Registration Failed",
        htmlContent
      })
    });

  } catch (err) {
    console.log(err);
  }
};

const SendAuRegistrationPaymentVerifiedEmail = async (email, name, auctionName) => {
  try {
    const htmlContent = Auction_Registration_Verified_Email_Template
      .replace("{name}", name)
      .replace("{auctionName}", auctionName);

    const body = {
      sender: { email: process.env.BREVO_FROM_EMAIL },
      to: [{ email }],
      subject: "Auction Registration Confirmed",
      htmlContent
    };

    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify(body)
    });

  } catch (err) {
    console.log(err);
  }
};

const SendWinningPaymentVerifiedEmail = async (email, name, auctionName) => {
  try {
    const htmlContent = Winning_Payment_Verified_Email_Template
      .replace("{name}", name)
      .replace("{auctionName}", auctionName);

    const body = {
      sender: { email: process.env.BREVO_FROM_EMAIL },
      to: [{ email }],
      subject: "Payment Verified – Your Order is Confirmed",
      htmlContent
    };

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify(body)
    });

    console.log("Payment verified email sent:", await response.json());
  } catch (error) {
    console.log("Payment verified email error:", error);
  }
};

const SendWinningPaymentRejection = async (email, name, auctionName) => {
  try {
    const htmlContent = Winning_Payment_Rejected_Template
      .replace("{name}", name)
      .replace("{auctionName}", auctionName);

    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        sender: { email: process.env.BREVO_FROM_EMAIL },
        to: [{ email }],
        subject: "Payment Rejected",
        htmlContent
      })
    });

  } catch (err) {
    console.log(err);
  }
};

const SendAuctionVerifiedEmailToUser = async (email, name, auctionName) => {
  try {
    const htmlContent = Auction_Verified_Email_Template
      .replace("{name}", name)
      .replace("{auctionName}", auctionName);

    const body = {
      sender: { email: process.env.BREVO_FROM_EMAIL },
      to: [{ email }],
      subject: "Auction Approved & Live 🎉",
      htmlContent
    };

    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify(body)
    });

    console.log("Auction verified email sent");
  } catch (err) {
    console.log("Auction verified email error:", err);
  }
};

const SendAuctionRemovedEmailToUser = async (email, name, auctionName) => {
  try {
    const htmlContent = Auction_Removed_Email_Template
      .replace("{name}", name)
      .replace("{auctionName}", auctionName);

    const body = {
      sender: { email: process.env.BREVO_FROM_EMAIL },
      to: [{ email }],
      subject: "Auction listing request Rejected",
      htmlContent
    };

    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify(body)
    });

  } catch (err) {
    console.log("Auction removed email error:", err);
  }
};

export { 
    SendVerificationCode, 
    WelcomeEmail,
    SendResetPwdEmail,
    SendOutBidEmail,
    SendPaymentVerificationRequestSent,
    SendUPISelectedEmail,
    SendAuRegistrationPaymentRejection,
    SendAuRegistrationPaymentVerifiedEmail,
    SendWinningPaymentVerifiedEmail,
    SendWinningPaymentRejection,
    SendAuctionVerifiedEmailToUser,
    SendAuctionRemovedEmailToUser
 };