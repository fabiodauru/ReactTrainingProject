namespace trainingProjectAPI.Models.Domain
{
    public class Tag
    {
        public required string TagName { get; set; }
        public required string Description { get; set; }
        public required DateOnly AchievedOn { get; set; }
    }
}
