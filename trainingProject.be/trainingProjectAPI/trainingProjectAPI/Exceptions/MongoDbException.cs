namespace trainingProjectAPI.Exceptions;

public class MongoDbException : Exception
{
    public MongoDbException(string message) :  base(message) { }
}