public class Service {
    public Bare getBare(Object other) {
        Bare bare = new Bare();
        bare.id = other.id;
        bare.title = other.title;
        return bare;
    }

    public Middle getMiddle(Object other) {
        Middle middle = new Middle();
        middle.id = other.id;
        middle.title = other.title;
        middle.details = other.details;
        return middle;
    }

    public Full getFull(Object other) {
        Full full = new Full();
        full.id = other.id;
        full.title = other.title;
        full.details = other.details;
        full.comments = other.comments;
        return full;
    }
}