import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from logger import logger
import os


def send_email(subject, body, to):
    smtp_server = "smtp.gmail.com"
    smtp_port = 587
    smtp_username = os.getenv("EMAIL_USER")
    smtp_password = os.getenv("EMAIL_PASS")

    msg = MIMEMultipart()
    msg["From"] = smtp_username
    msg["To"] = to
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    logger.info(f"Sending email to {to}")
    logger.info(f"Username: {smtp_username}")

    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_username, smtp_password)
        server.sendmail(smtp_username, to, msg.as_string())
        server.quit()
        logger.info(f"Email sent successfully to {to}")
    except Exception as e:
        logger.error(f"Error sending email to {to}: {str(e)}")
