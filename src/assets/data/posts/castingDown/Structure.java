public class Base {
    public String id;
    public String title;
}

public class Middle extends Base {
    public String details;
}

public class Full extends Middle {
    public List<String> comments;
}