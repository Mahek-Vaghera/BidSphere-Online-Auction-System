import { Verification_Email_Template } from "../email-templates/verify_email.template.js"
import { Welcome_Email_Template } from "../email-templates/welcome_email.template.js"
import { Reset_Password_Email_Template } from "../email-templates/restPwd_email.template.js"
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

export { 
    SendVerificationCode, 
    WelcomeEmail,
    SendResetPwdEmail
 };