namespace trainingProjectAPI.Features.EmailFeature
{
    public interface IEmailService 
    {
        public void SendPasswordResetEmail(string toEmail, string token);
    }
}
