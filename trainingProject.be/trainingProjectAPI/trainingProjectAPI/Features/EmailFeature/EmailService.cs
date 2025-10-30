using MailKit.Net.Smtp;
using MimeKit;
using trainingProjectAPI.Models.Exceptions;

namespace trainingProjectAPI.Features.EmailFeature
{
    public class EmailService : IEmailService
    {
        private readonly ILogger<EmailService> _logger;

        private readonly string _senderEmail;
        private readonly string _appPassword;
        private readonly string _resetPasswordUrl;
        private readonly string _smtpServer;
        private readonly int _smtpPort;
        private readonly string _senderName;


        public EmailService(ILogger<EmailService> logger, IConfiguration configuration)
        {
            _logger = logger;
            IConfigurationSection emailSettings = configuration.GetSection("EmailSettings");
            _senderEmail = emailSettings["SenderEmail"] ?? throw new ConfigException("SenderEmail is not configured");
            _appPassword = emailSettings["AppPassword"] ?? throw new ConfigException("AppPassword is not configured");
            _resetPasswordUrl = emailSettings["ResetPasswordUrl"] ?? throw new ConfigException("ResetPasswordUrl is not configured");
            _smtpServer = emailSettings["SmtpServer"] ?? throw new ConfigException("SmtpServer is not configured");
            _senderName = emailSettings["SenderName"] ?? throw new ConfigException("SenderName is not configured");
            if (!int.TryParse(emailSettings["SmtpPort"], out _smtpPort))
            {
                throw new ArgumentException("SmtpPort is not configured or is not a valid number", "SmtpPort");
            }
        }

        public void SendPasswordResetEmail(string toEmail, string token)
        {
            string resetLink = $"{_resetPasswordUrl}{Uri.EscapeDataString(token)}";
            CreateEmail(toEmail, resetLink);
        }

        private void CreateEmail(string toEmail, string resetLink)
        {
            var mail = new MimeMessage();
            mail.From.Add(new MailboxAddress(_senderName, _senderEmail));
            mail.To.Add(new MailboxAddress("", toEmail));
            mail.Subject = "Password Reset Request";

            var builder = new BodyBuilder
            {
                HtmlBody = BuildHtmlBody(resetLink),
                TextBody = $"You requested a password reset. Open the link below to reset your password:\n{resetLink}\n\nFreundliche Grüsse\nTom"
            };

            mail.Body = builder.ToMessageBody();
            SendEmail(mail);
        }

        private string BuildHtmlBody(string resetLink)
        {
            return $@"
                  <!DOCTYPE html>
                  <html lang=""de"">
                  <head>
                  <meta charset=""utf-8"">
                  <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
                  <style>
                    body {{ background:#f6f9fc; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial; margin:0; padding:0; }}
                    .container {{ max-width:600px; margin:24px auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.08); }}
                    .header {{ background:linear-gradient(90deg,#3b82f6,#06b6d4); color:#fff; padding:24px; text-align:center; }}
                    .header h1 {{ margin:0; font-size:20px; }}
                    .content {{ padding:24px; color:#0f172a; line-height:1.5; }}
                    .button-wrap {{ text-align:center; margin:20px 0; }}
                    .btn {{ display:inline-block; padding:12px 22px; background:#0ea5e9; color:#fff !important; text-decoration:none; border-radius:6px; font-weight:600; }}
                    .fallback {{ font-size:13px; color:#475569; margin-top:12px; word-break:break-all; }}
                    .footer {{ padding:18px 24px; font-size:13px; color:#64748b; background:#f8fafc; }}
                    .signature {{ margin-top:18px; font-weight:600; color:#0f172a; }}
                    @media (max-width:480px) {{ .container {{ margin:12px; }} .header h1 {{ font-size:18px; }} }}
                  </style>
                  </head>
                  <body>
                    <div class=""container"">
                      <div class=""header"">
                        <h1>Password Reset</h1>
                      </div>
                      <div class=""content"">
                        <p>Hallo,</p>
                        <p>Wir haben eine Anfrage zum Zurücksetzen Ihres Passworts erhalten. Klicken Sie auf die Schaltfläche unten, um Ihr Passwort zurückzusetzen. Dieser Link ist nur für kurze Zeit gültig.</p>
                        <div class=""button-wrap"">
                          <a class=""btn"" href=""{resetLink}"" target=""_blank"" rel=""noopener noreferrer"">Passwort zurücksetzen</a>
                        </div>
                        <p class=""fallback"">Falls die Schaltfläche nicht funktioniert, kopieren Sie diesen Link in Ihren Browser:<br/>
                          <a href=""{resetLink}"" target=""_blank"" rel=""noopener noreferrer"">{resetLink}</a>
                        </p>
                        <p class=""signature"">Freundliche Grüsse<br/>Tom</p>
                      </div>
                      <div class=""footer"">
                        <div>Wenn Sie dies nicht angefordert haben, können Sie diese E‑Mail ignorieren.</div>
                      </div>
                    </div>
                  </body>
                  </html>";
        }

        private void SendEmail(MimeMessage mail)
        {
            try
            {
                using (var smtpClient = new SmtpClient())
                {
                    smtpClient.Connect(_smtpServer, _smtpPort, true);
                    smtpClient.Authenticate(_senderEmail, _appPassword);
                    smtpClient.Send(mail);
                    smtpClient.Disconnect(true);
                }

                _logger.LogInformation("Password reset email sent successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Failed to send password reset email. Error: {ex.Message}");
            }
        }
    }
}
