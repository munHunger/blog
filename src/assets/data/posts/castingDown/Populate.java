public class Service {
    public <T extends Bare> T getBare(Object other, Class<T> type) throws InstantiationException, IllegalAccessException{
        Bare bare = type.newInstance();
        bare.id = other.id;
        bare.title = other.title;
        return bare;
    }

    public <T extends Middle> T getMiddle(Object other, Class<T> type) throws InstantiationException, IllegalAccessException{
        Middle middle = getBare(other, type);
        middle.details = other.details;
        return middle;
    }

    public <T extends Full> T getFull(Object other, Class<T> type) throws InstantiationException, IllegalAccessException{
        Full full = getMiddle();
        full.comments = other.comments;
        return full;
    }
}