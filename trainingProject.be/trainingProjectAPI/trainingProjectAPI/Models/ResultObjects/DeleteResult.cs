namespace trainingProjectAPI.Models.ResultObjects;

public class DeleteResult
{
    public bool Acknowledged { get; init; }
    public DateTime DeletedOn { get; init; }
}