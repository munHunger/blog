public class User {
    @Secured(Secured.SecurityLevel.OPEN)
    private String username;
    @Secured(Secured.SecurityLevel.AUTHENTICATED)
    private String email;
    @Secured(Secured.SecurityLevel.ADMIN)
    private List<User> friends;

    ...
}