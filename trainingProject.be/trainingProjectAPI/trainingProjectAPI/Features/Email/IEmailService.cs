namespace trainingProjectAPI.Interfaces
{
    public interface IEmailService 
    {
        public void SendPasswordResetEmail(string toEmail, string token);
    }
}
